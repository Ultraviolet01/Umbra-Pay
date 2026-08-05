// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {UmbraOrgFactory} from "./UmbraOrgFactory.sol";

/// @title UmbraOrg — coordination contract on Coston2 for Umbra Pay confidential payroll
/// @notice Solvency & payroll state coordinated on Coston2; payouts settled on Sepolia via TEE Enclave (FCC)
contract UmbraOrg {
    struct WithdrawalRequest {
        uint256 requestId;
        address employee;
        uint256 amount;
        address sepoliaRecipient;
        uint256 timestamp;
        bool settled;
        bytes32 txHash;
    }

    // ── State ────────────────────────────────────────────────────────────
    address public admin;
    string public name;
    address public teeVaultAddress; // TEE enclave address handling Sepolia ETH payouts
    uint256 public createdAt;
    UmbraOrgFactory public factory;

    address[] private _employees;
    mapping(address => bool) public isEmployee;
    mapping(address => bytes) private _encryptedSalaries; // TEE-encrypted salary payloads

    uint256 public payrollRunCount;
    uint256 public nextRequestId;

    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    uint256[] private _requestIds;

    // ── Events ───────────────────────────────────────────────────────────
    event EmployeeAdded(address indexed employee, bytes encryptedSalary);
    event EmployeeRemoved(address indexed employee);
    event SalaryUpdated(address indexed employee, bytes newEncryptedSalary);
    event PayrollExecuted(uint256 indexed runId, uint256 timestamp, uint256 employeeCount);
    event WithdrawalRequested(
        uint256 indexed requestId,
        address indexed employee,
        uint256 amount,
        address sepoliaRecipient,
        uint256 timestamp
    );
    event WithdrawalSettled(
        uint256 indexed requestId,
        address indexed employee,
        uint256 amount,
        bytes32 txHash
    );

    // ── Errors ───────────────────────────────────────────────────────────
    error OnlyAdmin();
    error OnlyTeeOrAdmin();
    error AlreadyEmployee();
    error NotEmployee();
    error ZeroAmount();
    error InvalidRecipient();
    error RequestNotFound();
    error RequestAlreadySettled();

    // ── Modifiers ────────────────────────────────────────────────────────
    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    modifier onlyTeeOrAdmin() {
        if (msg.sender != teeVaultAddress && msg.sender != admin) revert OnlyTeeOrAdmin();
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────────
    constructor(
        string memory _name,
        address _admin,
        address _teeVaultAddress,
        address _factory
    ) {
        require(_admin != address(0), "Invalid admin");
        require(_teeVaultAddress != address(0), "Invalid TEE vault");
        name = _name;
        admin = _admin;
        teeVaultAddress = _teeVaultAddress;
        createdAt = block.timestamp;
        factory = UmbraOrgFactory(_factory);
    }

    // ── Admin Functions ──────────────────────────────────────────────────

    /// @notice Add an employee with TEE-encrypted salary payload
    function addEmployee(address employee, bytes calldata encryptedSalary) public onlyAdmin {
        if (employee == address(0)) revert InvalidRecipient();
        if (isEmployee[employee]) revert AlreadyEmployee();

        isEmployee[employee] = true;
        _employees.push(employee);
        _encryptedSalaries[employee] = encryptedSalary;

        factory.registerEmployee(employee);
        emit EmployeeAdded(employee, encryptedSalary);
    }

    /// @notice Batch add employees
    function addEmployees(
        address[] calldata employees,
        bytes[] calldata encryptedSalaries
    ) external onlyAdmin {
        require(employees.length == encryptedSalaries.length, "Length mismatch");
        for (uint256 i = 0; i < employees.length; i++) {
            addEmployee(employees[i], encryptedSalaries[i]);
        }
    }

    /// @notice Remove an employee
    function removeEmployee(address employee) external onlyAdmin {
        if (!isEmployee[employee]) revert NotEmployee();

        isEmployee[employee] = false;
        delete _encryptedSalaries[employee];

        uint256 len = _employees.length;
        for (uint256 i = 0; i < len; i++) {
            if (_employees[i] == employee) {
                _employees[i] = _employees[len - 1];
                _employees.pop();
                break;
            }
        }

        factory.unregisterEmployee(employee);
        emit EmployeeRemoved(employee);
    }

    /// @notice Update employee's encrypted salary
    function updateSalary(address employee, bytes calldata newEncryptedSalary) external onlyAdmin {
        if (!isEmployee[employee]) revert NotEmployee();
        _encryptedSalaries[employee] = newEncryptedSalary;
        emit SalaryUpdated(employee, newEncryptedSalary);
    }

    /// @notice Trigger payroll run on Coston2
    function runPayroll() external onlyAdmin {
        payrollRunCount++;
        emit PayrollExecuted(payrollRunCount, block.timestamp, _employees.length);
    }

    /// @notice Update TEE Enclave vault address
    function setTeeVaultAddress(address _newTee) external onlyAdmin {
        require(_newTee != address(0), "Invalid address");
        teeVaultAddress = _newTee;
    }

    // ── Employee Functions ───────────────────────────────────────────────

    /// @notice Request native ETH withdrawal to be settled on Sepolia by TEE Enclave
    function requestWithdrawal(uint256 amount, address sepoliaRecipient) external returns (uint256 requestId) {
        if (!isEmployee[msg.sender]) revert NotEmployee();
        if (amount == 0) revert ZeroAmount();
        if (sepoliaRecipient == address(0)) revert InvalidRecipient();

        requestId = nextRequestId++;
        WithdrawalRequest memory req = WithdrawalRequest({
            requestId: requestId,
            employee: msg.sender,
            amount: amount,
            sepoliaRecipient: sepoliaRecipient,
            timestamp: block.timestamp,
            settled: false,
            txHash: bytes32(0)
        });

        withdrawalRequests[requestId] = req;
        _requestIds.push(requestId);

        emit WithdrawalRequested(requestId, msg.sender, amount, sepoliaRecipient, block.timestamp);
    }

    // ── Settlement Function ──────────────────────────────────────────────

    /// @notice Mark a withdrawal request as settled after Sepolia ETH transfer
    function settleWithdrawal(uint256 requestId, bytes32 txHash) external onlyTeeOrAdmin {
        WithdrawalRequest storage req = withdrawalRequests[requestId];
        if (req.employee == address(0)) revert RequestNotFound();
        if (req.settled) revert RequestAlreadySettled();

        req.settled = true;
        req.txHash = txHash;

        emit WithdrawalSettled(requestId, req.employee, req.amount, txHash);
    }

    // ── View Functions ───────────────────────────────────────────────────

    function getEmployees() external view returns (address[] memory) {
        return _employees;
    }

    function getEncryptedSalary(address employee) external view returns (bytes memory) {
        return _encryptedSalaries[employee];
    }

    function getWithdrawalRequest(uint256 requestId) external view returns (WithdrawalRequest memory) {
        return withdrawalRequests[requestId];
    }

    function getAllWithdrawalRequestIds() external view returns (uint256[] memory) {
        return _requestIds;
    }
}
