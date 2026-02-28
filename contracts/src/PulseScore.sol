// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PulseScore is Ownable {
    struct Score {
        uint256 score;
        uint256 withdrawalCount;
        uint256 completedStreams;
        uint256 totalEarned;
        uint256 joinedAt;
        uint256 lastUpdated;
    }

    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant INITIAL_SCORE = 200;

    mapping(address => Score) public scores;
    mapping(address => bool) public authorizedCallers;

    event ScoreUpdated(address indexed worker, uint256 newScore, string reason);

    modifier onlyCaller() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() Ownable(msg.sender) {}

    function setCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
    }

    function initScore(address worker) external onlyCaller {
        if (scores[worker].joinedAt == 0) {
            scores[worker] = Score({
                score: INITIAL_SCORE,
                withdrawalCount: 0,
                completedStreams: 0,
                totalEarned: 0,
                joinedAt: block.timestamp,
                lastUpdated: block.timestamp
            });
        }
    }

    function recordWithdrawal(address worker) external onlyCaller {
        _ensureInit(worker);
        scores[worker].withdrawalCount++;
        _addScore(worker, 3, "Withdrawal");
    }

    function recordStreamComplete(address worker) external onlyCaller {
        _ensureInit(worker);
        scores[worker].completedStreams++;
        _addScore(worker, 10, "Stream completed");
    }

    function recordEarnings(address worker, uint256 amount) external onlyCaller {
        _ensureInit(worker);
        scores[worker].totalEarned += amount;
        uint256 bonus = (amount / 1e8);
        if (bonus > 0) _addScore(worker, bonus * 10, "Earnings milestone");
    }

    function penalize(address worker, uint256 points) external onlyCaller {
        _ensureInit(worker);
        if (scores[worker].score > points) {
            scores[worker].score -= points;
        } else {
            scores[worker].score = 0;
        }
        emit ScoreUpdated(worker, scores[worker].score, "Penalty");
    }

    function getScore(address worker) external view returns (uint256 score, string memory tier) {
        score = scores[worker].score;
        if (score < 300) tier = "Starter";
        else if (score < 500) tier = "Rising";
        else if (score < 750) tier = "Trusted";
        else tier = "Elite";
    }

    function getFullScore(address worker) external view returns (Score memory) {
        return scores[worker];
    }

    function _ensureInit(address worker) internal {
        if (scores[worker].joinedAt == 0) {
            scores[worker].joinedAt = block.timestamp;
            scores[worker].score = INITIAL_SCORE;
            scores[worker].lastUpdated = block.timestamp;
        }
    }

    function _addScore(address worker, uint256 points, string memory reason) internal {
        uint256 newScore = scores[worker].score + points;
        if (newScore > MAX_SCORE) newScore = MAX_SCORE;
        scores[worker].score = newScore;
        scores[worker].lastUpdated = block.timestamp;
        emit ScoreUpdated(worker, newScore, reason);
    }
}
