// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getReserveNormalizedIncome(address asset) external view returns (uint256);
}

interface IAToken is IERC20 {}

contract PulseVault is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    IPool public immutable aavePool;
    IAToken public immutable aUsdc;
    address public streamEngine;

    uint256 public platformFeeBps = 2000;
    uint256 public constant BPS = 10000;

    mapping(address => uint256) public employerPrincipal;
    uint256 public totalPrincipal;
    uint256 public pendingPlatformFees;

    event PayrollDeposited(address indexed employer, uint256 amount);
    event StreamFunded(address indexed employer, uint256 amount);
    event YieldClaimed(address indexed employer, uint256 amount);
    event PlatformFeeCollected(uint256 amount);
    event StreamEngineSet(address indexed engine);

    modifier onlyStreamEngine() {
        require(msg.sender == streamEngine, "Only StreamEngine");
        _;
    }

    constructor(
        address _usdc,
        address _aavePool,
        address _aUsdc
    ) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        aavePool = IPool(_aavePool);
        aUsdc = IAToken(_aUsdc);
    }

    function setStreamEngine(address _engine) external onlyOwner {
        streamEngine = _engine;
        emit StreamEngineSet(_engine);
    }

    /// @notice Employer deposits payroll USDC into vault → auto-supplied to Aave
    function depositPayroll(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        usdc.approve(address(aavePool), amount);
        aavePool.supply(address(usdc), amount, address(this), 0);

        employerPrincipal[msg.sender] += amount;
        totalPrincipal += amount;

        emit PayrollDeposited(msg.sender, amount);
    }

    /// @notice StreamEngine calls this to fund a worker stream
    function fundStream(address employer, uint256 amount) external nonReentrant onlyStreamEngine whenNotPaused {
        require(employerPrincipal[employer] >= amount, "Insufficient employer balance");

        uint256 withdrawn = aavePool.withdraw(address(usdc), amount, address(streamEngine));

        employerPrincipal[employer] -= amount;
        totalPrincipal -= amount;

        emit StreamFunded(employer, withdrawn);
    }

    /// @notice Returns employer's current balance including yield
    function getEmployerBalance(address employer) external view returns (uint256) {
        if (totalPrincipal == 0) return 0;
        uint256 totalAUsdc = aUsdc.balanceOf(address(this));
        return (totalAUsdc * employerPrincipal[employer]) / totalPrincipal;
    }

    /// @notice Returns yield earned by employer
    function getYieldEarned(address employer) external view returns (uint256) {
        uint256 currentBalance = this.getEmployerBalance(employer);
        uint256 principal = employerPrincipal[employer];
        if (currentBalance <= principal) return 0;
        uint256 totalYield = currentBalance - principal;
        return (totalYield * (BPS - platformFeeBps)) / BPS;
    }

    /// @notice Employer withdraws their principal + yield
    function withdrawPayroll(uint256 amount) external nonReentrant whenNotPaused {
        uint256 currentBalance = this.getEmployerBalance(msg.sender);
        require(amount <= currentBalance, "Insufficient balance");

        uint256 withdrawn = aavePool.withdraw(address(usdc), amount, address(this));
        uint256 principal = employerPrincipal[msg.sender];

        if (amount > principal) {
            uint256 yieldPortion = amount - principal;
            uint256 fee = (yieldPortion * platformFeeBps) / BPS;
            pendingPlatformFees += fee;
            usdc.safeTransfer(msg.sender, withdrawn - fee);
            employerPrincipal[msg.sender] = 0;
        } else {
            usdc.safeTransfer(msg.sender, withdrawn);
            employerPrincipal[msg.sender] -= amount;
        }

        totalPrincipal = totalPrincipal > amount ? totalPrincipal - amount : 0;
    }

    function collectPlatformFees() external onlyOwner {
        uint256 fees = pendingPlatformFees;
        pendingPlatformFees = 0;
        usdc.safeTransfer(owner(), fees);
        emit PlatformFeeCollected(fees);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
