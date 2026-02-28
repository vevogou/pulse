// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MerchantCashout is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;

    uint256 public merchantFeeBps = 30;
    uint256 public platformFeeBps = 10;
    uint256 public constant BPS = 10000;
    uint256 public constant CODE_EXPIRY = 15 minutes;

    struct Merchant {
        address wallet;
        string name;
        int256 lat;
        int256 lng;
        string countryCode;
        uint256 cashAvailable;
        uint256 totalFeesEarned;
        bool isVerified;
        bool exists;
    }

    struct CashoutRequest {
        address worker;
        address merchant;
        uint256 amount;
        bytes6 code;
        uint256 expiresAt;
        bool completed;
        bool cancelled;
    }

    uint256 public merchantCount;
    uint256 public requestCount;
    mapping(uint256 => Merchant) public merchants;
    mapping(address => uint256) public merchantIdByWallet;
    mapping(uint256 => CashoutRequest) public requests;
    mapping(address => uint256[]) public merchantRequests;
    mapping(address => uint256[]) public workerRequests;

    event MerchantRegistered(uint256 indexed merchantId, address wallet, string name);
    event CashoutRequested(uint256 indexed requestId, address worker, uint256 merchantId, uint256 amount, bytes6 code);
    event CashoutCompleted(uint256 indexed requestId, address merchant, uint256 fee);
    event CashoutCancelled(uint256 indexed requestId);
    event MerchantVerified(uint256 indexed merchantId);

    modifier onlyOwnerOrVerified() {
        require(msg.sender == owner() ||
            (merchantIdByWallet[msg.sender] != 0 &&
             merchants[merchantIdByWallet[msg.sender]].isVerified),
            "Not authorized");
        _;
    }

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    function registerMerchant(
        string calldata name,
        int256 lat,
        int256 lng,
        string calldata countryCode,
        uint256 initialCash
    ) external returns (uint256) {
        require(merchantIdByWallet[msg.sender] == 0, "Already registered");

        merchantCount++;
        merchants[merchantCount] = Merchant({
            wallet: msg.sender,
            name: name,
            lat: lat,
            lng: lng,
            countryCode: countryCode,
            cashAvailable: initialCash,
            totalFeesEarned: 0,
            isVerified: false,
            exists: true
        });

        merchantIdByWallet[msg.sender] = merchantCount;
        emit MerchantRegistered(merchantCount, msg.sender, name);
        return merchantCount;
    }

    function verifyMerchant(uint256 merchantId) external onlyOwner {
        merchants[merchantId].isVerified = true;
        emit MerchantVerified(merchantId);
    }

    function updateCashAvailable(uint256 amount) external {
        uint256 mid = merchantIdByWallet[msg.sender];
        require(mid != 0, "Not registered");
        merchants[mid].cashAvailable = amount;
    }

    /// @notice Worker requests a cash withdrawal at a merchant
    function requestCashout(uint256 merchantId, uint256 amount) external nonReentrant returns (uint256) {
        Merchant memory m = merchants[merchantId];
        require(m.exists && m.isVerified, "Invalid merchant");
        require(m.cashAvailable >= amount, "Merchant low on cash");
        require(amount >= 1e6, "Min $1 cashout");

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        bytes6 code = bytes6(keccak256(abi.encodePacked(
            block.timestamp, msg.sender, merchantId, requestCount
        )));

        requestCount++;
        requests[requestCount] = CashoutRequest({
            worker: msg.sender,
            merchant: m.wallet,
            amount: amount,
            code: code,
            expiresAt: block.timestamp + CODE_EXPIRY,
            completed: false,
            cancelled: false
        });

        merchantRequests[m.wallet].push(requestCount);
        workerRequests[msg.sender].push(requestCount);

        emit CashoutRequested(requestCount, msg.sender, merchantId, amount, code);
        return requestCount;
    }

    /// @notice Merchant confirms they gave cash to worker
    function confirmCashout(uint256 requestId, bytes6 code) external nonReentrant {
        CashoutRequest storage req = requests[requestId];
        require(req.merchant == msg.sender, "Not your request");
        require(!req.completed && !req.cancelled, "Already processed");
        require(block.timestamp <= req.expiresAt, "Code expired");
        require(req.code == code, "Invalid code");

        req.completed = true;

        uint256 platformFee = (req.amount * platformFeeBps) / BPS;
        uint256 merchantFee = (req.amount * merchantFeeBps) / BPS;

        usdc.safeTransfer(msg.sender, req.amount + merchantFee - platformFee);

        uint256 mid = merchantIdByWallet[msg.sender];
        merchants[mid].totalFeesEarned += merchantFee;
        merchants[mid].cashAvailable -= req.amount;

        emit CashoutCompleted(requestId, msg.sender, merchantFee);
    }

    /// @notice Worker cancels if code expires
    function cancelCashout(uint256 requestId) external nonReentrant {
        CashoutRequest storage req = requests[requestId];
        require(req.worker == msg.sender, "Not your request");
        require(!req.completed && !req.cancelled, "Already processed");
        require(block.timestamp > req.expiresAt, "Code not expired yet");

        req.cancelled = true;
        usdc.safeTransfer(msg.sender, req.amount);

        emit CashoutCancelled(requestId);
    }

    function collectPlatformFees() external onlyOwner {
        usdc.safeTransfer(owner(), usdc.balanceOf(address(this)));
    }

    /// @notice Simple geographic box query
    function getMerchantsNear(
        int256 lat,
        int256 lng,
        int256 deltaLat,
        int256 deltaLng
    ) external view returns (uint256[] memory) {
        uint256[] memory temp = new uint256[](merchantCount);
        uint256 count = 0;
        for (uint256 i = 1; i <= merchantCount; i++) {
            Merchant memory m = merchants[i];
            if (!m.exists || !m.isVerified) continue;
            if (
                m.lat >= lat - deltaLat && m.lat <= lat + deltaLat &&
                m.lng >= lng - deltaLng && m.lng <= lng + deltaLng
            ) {
                temp[count] = i;
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) result[i] = temp[i];
        return result;
    }
}
