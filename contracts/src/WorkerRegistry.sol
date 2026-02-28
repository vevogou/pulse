// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract WorkerRegistry is ERC721, Ownable {
    using Strings for uint256;

    uint256 public constant TIER0_LIMIT = 50 * 1e6;
    uint256 public constant TIER1_LIMIT = 200 * 1e6;
    uint256 public constant TIER2_LIMIT = 1000 * 1e6;

    struct Worker {
        address wallet;
        bytes32 phoneHash;
        string displayName;
        string country;
        uint8 tier;
        uint256 kycLevel;
        uint256 streamCount;
        uint256 totalEarned;
        uint256 joinedAt;
        uint256 lastActive;
        bool exists;
    }

    uint256 public tokenCount;
    mapping(address => Worker) public workers;
    mapping(bytes32 => address) public phoneToWallet;
    mapping(address => uint256) public walletToToken;
    mapping(address => bool) public authorizedOracles;
    mapping(address => uint256) public dailyWithdrawn;
    mapping(address => uint256) public lastWithdrawalDay;

    event WorkerRegistered(address indexed wallet, bytes32 phoneHash, uint256 tokenId);
    event TierUpgraded(address indexed wallet, uint8 newTier);
    event OracleSet(address indexed oracle, bool authorized);

    modifier onlyOracle() {
        require(authorizedOracles[msg.sender] || msg.sender == owner(), "Not authorized oracle");
        _;
    }

    function transferFrom(address, address, uint256) public pure override {
        revert("PULSE: Soulbound - non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("PULSE: Soulbound - non-transferable");
    }

    constructor() ERC721("PULSE Worker ID", "PWID") Ownable(msg.sender) {}

    function setOracle(address oracle, bool authorized) external onlyOwner {
        authorizedOracles[oracle] = authorized;
        emit OracleSet(oracle, authorized);
    }

    function registerWorker(
        bytes32 phoneHash,
        address wallet,
        string calldata displayName,
        string calldata country
    ) external onlyOracle returns (uint256) {
        return _registerWorker(phoneHash, wallet, displayName, country);
    }

    /// @notice Self-registration: anyone can register their own wallet
    function selfRegister(
        bytes32 phoneHash,
        string calldata displayName,
        string calldata country
    ) external returns (uint256) {
        return _registerWorker(phoneHash, msg.sender, displayName, country);
    }

    function _registerWorker(
        bytes32 phoneHash,
        address wallet,
        string memory displayName,
        string memory country
    ) internal returns (uint256) {
        require(!workers[wallet].exists, "Already registered");
        require(phoneToWallet[phoneHash] == address(0), "Phone already used");

        tokenCount++;
        workers[wallet] = Worker({
            wallet: wallet,
            phoneHash: phoneHash,
            displayName: displayName,
            country: country,
            tier: 0,
            kycLevel: 1,
            streamCount: 0,
            totalEarned: 0,
            joinedAt: block.timestamp,
            lastActive: block.timestamp,
            exists: true
        });

        phoneToWallet[phoneHash] = wallet;
        walletToToken[wallet] = tokenCount;
        _mint(wallet, tokenCount);

        emit WorkerRegistered(wallet, phoneHash, tokenCount);
        return tokenCount;
    }

    function upgradeTier(address wallet, uint8 newTier) external onlyOracle {
        require(workers[wallet].exists, "Worker not found");
        require(newTier > workers[wallet].tier, "Can only upgrade");
        workers[wallet].tier = newTier;
        emit TierUpgraded(wallet, newTier);
    }

    function getDailyLimit(address wallet) external view returns (uint256) {
        uint8 tier = workers[wallet].tier;
        if (tier == 0) return TIER0_LIMIT;
        if (tier == 1) return TIER1_LIMIT;
        return TIER2_LIMIT;
    }

    function checkAndUpdateDailyLimit(address wallet, uint256 amount) external onlyOracle returns (bool) {
        uint256 today = block.timestamp / 86400;
        if (lastWithdrawalDay[wallet] < today) {
            dailyWithdrawn[wallet] = 0;
            lastWithdrawalDay[wallet] = today;
        }
        uint256 limit = this.getDailyLimit(wallet);
        if (dailyWithdrawn[wallet] + amount > limit) return false;
        dailyWithdrawn[wallet] += amount;
        return true;
    }

    function updateStats(address wallet, uint256 amountEarned) external onlyOracle {
        if (workers[wallet].exists) {
            workers[wallet].totalEarned += amountEarned;
            workers[wallet].lastActive = block.timestamp;
        }
    }

    function getWorker(address wallet) external view returns (Worker memory) {
        return workers[wallet];
    }

    function getWalletByPhone(bytes32 phoneHash) external view returns (address) {
        return phoneToWallet[phoneHash];
    }

    /// @notice On-chain SVG token URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        address wallet = _ownerOf(tokenId);
        Worker memory w = workers[wallet];

        string memory tier = w.tier == 0 ? "Starter" : w.tier == 1 ? "Verified" : "Elite";
        string memory color = w.tier == 0 ? "#94A3B8" : w.tier == 1 ? "#3B82F6" : "#F59E0B";

        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250">',
            '<rect width="400" height="250" fill="#0F172A" rx="16"/>',
            '<rect x="20" y="20" width="360" height="210" fill="#1E293B" rx="12"/>',
            '<text x="40" y="65" font-family="monospace" font-size="28" font-weight="bold" fill="white">PULSE</text>',
            '<text x="40" y="100" font-family="monospace" font-size="12" fill="#94A3B8">WORKER ID #', tokenId.toString(), '</text>',
            '<text x="40" y="130" font-family="monospace" font-size="14" fill="white">', w.displayName, '</text>',
            '<rect x="40" y="145" width="80" height="24" fill="', color, '" rx="4"/>',
            '<text x="50" y="162" font-family="monospace" font-size="11" fill="white">', tier, '</text>',
            '<text x="40" y="210" font-family="monospace" font-size="10" fill="#64748B">', w.country, '</text>',
            '</svg>'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(string(abi.encodePacked(
                '{"name":"PULSE Worker #', tokenId.toString(), '",',
                '"description":"PULSE Earned Wage Access Worker ID",',
                '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
            ))))
        ));
    }
}
