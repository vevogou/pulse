// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IPulseVault {
    function fundStream(address employer, uint256 amount) external;
}

interface IPulseScore {
    function recordWithdrawal(address worker) external;
    function recordStreamComplete(address worker) external;
}

contract StreamEngine is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    IPulseVault public pulseVault;
    IPulseScore public pulseScore;

    uint256 public platformFeeBps = 50;
    uint256 public constant BPS = 10000;
    uint256 public constant MAX_BATCH = 100;

    struct Stream {
        uint256 id;
        address employer;
        address worker;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 endTime;
        uint256 totalAmount;
        uint256 withdrawnAmount;
        bool isActive;
        bool isCancelled;
    }

    uint256 public streamCount;
    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public workerStreams;
    mapping(address => uint256[]) public employerStreams;
    mapping(uint256 => uint256) public streamBalance;

    event StreamCreated(
        uint256 indexed streamId,
        address indexed employer,
        address indexed worker,
        uint256 ratePerSecond,
        uint256 startTime,
        uint256 endTime,
        uint256 totalAmount
    );
    event Withdrawal(
        uint256 indexed streamId,
        address indexed worker,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );
    event StreamPaused(uint256 indexed streamId);
    event StreamResumed(uint256 indexed streamId);
    event StreamCancelled(uint256 indexed streamId, uint256 refundAmount);

    modifier onlyEmployer(uint256 streamId) {
        require(streams[streamId].employer == msg.sender, "Not stream employer");
        _;
    }

    modifier onlyWorker(uint256 streamId) {
        require(streams[streamId].worker == msg.sender, "Not stream worker");
        _;
    }

    constructor(address _usdc, address _pulseVault) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        pulseVault = IPulseVault(_pulseVault);
    }

    function setPulseScore(address _score) external onlyOwner {
        pulseScore = IPulseScore(_score);
    }

    /// @notice Create a salary stream for a worker
    function createStream(
        address worker,
        uint256 ratePerSecond,
        uint256 durationSeconds
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(worker != address(0), "Invalid worker");
        require(ratePerSecond > 0, "Rate must be > 0");
        require(durationSeconds >= 3600, "Min 1 hour duration");

        uint256 totalAmount = ratePerSecond * durationSeconds;

        uint256 balanceBefore = usdc.balanceOf(address(this));
        pulseVault.fundStream(msg.sender, totalAmount);
        uint256 balanceAfter = usdc.balanceOf(address(this));
        require(balanceAfter - balanceBefore >= totalAmount, "Funding failed");

        streamCount++;
        uint256 streamId = streamCount;

        streams[streamId] = Stream({
            id: streamId,
            employer: msg.sender,
            worker: worker,
            ratePerSecond: ratePerSecond,
            startTime: block.timestamp,
            endTime: block.timestamp + durationSeconds,
            totalAmount: totalAmount,
            withdrawnAmount: 0,
            isActive: true,
            isCancelled: false
        });

        streamBalance[streamId] = totalAmount;
        workerStreams[worker].push(streamId);
        employerStreams[msg.sender].push(streamId);

        emit StreamCreated(streamId, msg.sender, worker, ratePerSecond,
            block.timestamp, block.timestamp + durationSeconds, totalAmount);

        return streamId;
    }

    /// @notice Batch create streams — gas efficient for payroll
    function batchCreateStreams(
        address[] calldata workers,
        uint256[] calldata rates,
        uint256 durationSeconds
    ) external nonReentrant whenNotPaused {
        require(workers.length == rates.length, "Arrays mismatch");
        require(workers.length <= MAX_BATCH, "Max 100 per batch");

        uint256 totalNeeded = 0;
        for (uint256 i = 0; i < rates.length; i++) {
            totalNeeded += rates[i] * durationSeconds;
        }

        pulseVault.fundStream(msg.sender, totalNeeded);

        for (uint256 i = 0; i < workers.length; i++) {
            uint256 amount = rates[i] * durationSeconds;
            streamCount++;
            streams[streamCount] = Stream({
                id: streamCount,
                employer: msg.sender,
                worker: workers[i],
                ratePerSecond: rates[i],
                startTime: block.timestamp,
                endTime: block.timestamp + durationSeconds,
                totalAmount: amount,
                withdrawnAmount: 0,
                isActive: true,
                isCancelled: false
            });
            streamBalance[streamCount] = amount;
            workerStreams[workers[i]].push(streamCount);
            employerStreams[msg.sender].push(streamCount);
        }
    }

    /// @notice Calculate accumulated (available to withdraw) — NO transaction needed
    function getAccumulated(uint256 streamId) public view returns (uint256) {
        Stream memory s = streams[streamId];
        if (!s.isActive || s.isCancelled) return 0;

        uint256 elapsed = block.timestamp > s.endTime
            ? s.endTime - s.startTime
            : block.timestamp - s.startTime;

        uint256 earned = elapsed * s.ratePerSecond;
        if (earned > s.totalAmount) earned = s.totalAmount;

        return earned > s.withdrawnAmount ? earned - s.withdrawnAmount : 0;
    }

    /// @notice Worker withdraws available earnings
    function withdraw(uint256 streamId, uint256 amount) external nonReentrant whenNotPaused {
        Stream storage s = streams[streamId];
        require(s.worker == msg.sender, "Not your stream");
        require(s.isActive && !s.isCancelled, "Stream not active");

        uint256 available = getAccumulated(streamId);
        require(amount > 0 && amount <= available, "Invalid amount");

        uint256 fee = (amount * platformFeeBps) / BPS;
        uint256 workerGets = amount - fee;

        s.withdrawnAmount += amount;
        streamBalance[streamId] -= amount;

        usdc.safeTransfer(msg.sender, workerGets);

        if (s.withdrawnAmount >= s.totalAmount) {
            s.isActive = false;
            if (address(pulseScore) != address(0)) {
                pulseScore.recordStreamComplete(msg.sender);
            }
        } else if (address(pulseScore) != address(0)) {
            pulseScore.recordWithdrawal(msg.sender);
        }

        emit Withdrawal(streamId, msg.sender, workerGets, fee, block.timestamp);
    }

    /// @notice Withdraw all available earnings across all streams
    function withdrawAll() external nonReentrant whenNotPaused {
        uint256[] memory sIds = workerStreams[msg.sender];
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < sIds.length; i++) {
            uint256 avail = getAccumulated(sIds[i]);
            if (avail > 0) {
                Stream storage s = streams[sIds[i]];
                s.withdrawnAmount += avail;
                streamBalance[sIds[i]] -= avail;
                totalAmount += avail;
            }
        }

        require(totalAmount > 0, "Nothing to withdraw");
        uint256 fee = (totalAmount * platformFeeBps) / BPS;
        usdc.safeTransfer(msg.sender, totalAmount - fee);
    }

    function pauseStream(uint256 streamId) external onlyEmployer(streamId) {
        streams[streamId].isActive = false;
        emit StreamPaused(streamId);
    }

    function resumeStream(uint256 streamId) external onlyEmployer(streamId) {
        require(!streams[streamId].isCancelled, "Stream cancelled");
        streams[streamId].isActive = true;
        emit StreamResumed(streamId);
    }

    function cancelStream(uint256 streamId) external onlyEmployer(streamId) nonReentrant {
        Stream storage s = streams[streamId];
        require(!s.isCancelled, "Already cancelled");

        uint256 alreadyEarned = (block.timestamp - s.startTime) * s.ratePerSecond;
        if (alreadyEarned > s.totalAmount) alreadyEarned = s.totalAmount;

        uint256 unstreamed = s.totalAmount - alreadyEarned;
        s.isCancelled = true;
        s.isActive = false;

        if (unstreamed > 0) {
            usdc.safeTransfer(s.employer, unstreamed);
            streamBalance[streamId] -= unstreamed;
        }

        emit StreamCancelled(streamId, unstreamed);
    }

    function getWorkerStreams(address worker) external view returns (uint256[] memory) {
        return workerStreams[worker];
    }

    function getEmployerStreams(address employer) external view returns (uint256[] memory) {
        return employerStreams[employer];
    }

    function collectFees() external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        usdc.safeTransfer(owner(), balance);
    }

    function setPlatformFee(uint256 newBps) external onlyOwner {
        require(newBps <= 200, "Max 2%");
        platformFeeBps = newBps;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
