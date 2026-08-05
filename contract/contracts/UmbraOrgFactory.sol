// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {UmbraOrg} from "./UmbraOrg.sol";

/// @title UmbraOrgFactory — deploys UmbraOrg instances on Coston2 coordination chain for Umbra Pay
contract UmbraOrgFactory {
    /// @notice Emitted when a new organization is created
    event OrganizationCreated(
        address indexed orgAddress,
        address indexed admin,
        string name,
        address teeVaultAddress
    );

    /// @dev admin address => list of orgs created by admin
    mapping(address => address[]) private _orgsByAdmin;

    /// @dev employee address => list of orgs employee belongs to
    mapping(address => address[]) private _orgsByEmployee;

    /// @dev tracks deployed org addresses
    mapping(address => bool) public isDeployedOrg;

    /// @notice Deploy a new UmbraOrg contract
    /// @param name The organization name
    /// @param teeVaultAddress The TEE enclave vault address on Sepolia
    /// @return orgAddress The address of the deployed UmbraOrg contract
    function createOrg(string calldata name, address teeVaultAddress) external returns (address orgAddress) {
        require(teeVaultAddress != address(0), "Invalid TEE address");
        UmbraOrg org = new UmbraOrg(name, msg.sender, teeVaultAddress, address(this));
        orgAddress = address(org);
        _orgsByAdmin[msg.sender].push(orgAddress);
        isDeployedOrg[orgAddress] = true;
        emit OrganizationCreated(orgAddress, msg.sender, name, teeVaultAddress);
    }

    /// @notice Get all organizations created by an admin
    function getOrganizations(address admin) external view returns (address[] memory) {
        return _orgsByAdmin[admin];
    }

    /// @notice Get all organizations an employee belongs to
    function getEmployeeOrganizations(address employee) external view returns (address[] memory) {
        return _orgsByEmployee[employee];
    }

    /// @notice Register an employee in an organization
    function registerEmployee(address employee) external {
        require(isDeployedOrg[msg.sender], "Only deployed orgs");
        address[] storage orgs = _orgsByEmployee[employee];
        for (uint256 i = 0; i < orgs.length; i++) {
            if (orgs[i] == msg.sender) return;
        }
        orgs.push(msg.sender);
    }

    /// @notice Unregister an employee from an organization
    function unregisterEmployee(address employee) external {
        require(isDeployedOrg[msg.sender], "Only deployed orgs");
        address[] storage orgs = _orgsByEmployee[employee];
        uint256 len = orgs.length;
        for (uint256 i = 0; i < len; i++) {
            if (orgs[i] == msg.sender) {
                orgs[i] = orgs[len - 1];
                orgs.pop();
                break;
            }
        }
    }
}
