import { expect } from "chai";
import { ethers } from "hardhat";
import { UmbraOrgFactory, UmbraOrg } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Umbra Pay Smart Contracts (Coston2 Coordination Chain)", function () {
  let factory: UmbraOrgFactory;
  let org: UmbraOrg;
  let admin: HardhatEthersSigner;
  let employee1: HardhatEthersSigner;
  let employee2: HardhatEthersSigner;
  let teeVault: HardhatEthersSigner;

  const mockEncryptedSalary1 = ethers.toUtf8Bytes("enc_salary_1.5_ETH");
  const mockEncryptedSalary2 = ethers.toUtf8Bytes("enc_salary_2.0_ETH");

  beforeEach(async function () {
    [admin, employee1, employee2, teeVault] = await ethers.getSigners();

    // Deploy Factory
    const Factory = await ethers.getContractFactory("UmbraOrgFactory");
    factory = (await Factory.deploy()) as UmbraOrgFactory;
    await factory.waitForDeployment();

    // Create Organization via Factory
    const tx = await factory.createOrg("Acme Corp Privacy Payroll", teeVault.address);
    const receipt = await tx.wait();

    const orgAddress = await factory.getOrganizations(admin.address).then((orgs) => orgs[0]);
    expect(orgAddress).to.not.be.undefined;

    const Org = await ethers.getContractFactory("UmbraOrg");
    org = Org.attach(orgAddress) as UmbraOrg;
  });

  describe("Organization Creation & Meta", function () {
    it("should set correct admin, name, and TEE vault address", async function () {
      expect(await org.admin()).to.equal(admin.address);
      expect(await org.name()).to.equal("Acme Corp Privacy Payroll");
      expect(await org.teeVaultAddress()).to.equal(teeVault.address);
      expect(await factory.isDeployedOrg(await org.getAddress())).to.be.true;
    });
  });

  describe("Employee Management", function () {
    it("should allow admin to add employees with encrypted salary payloads", async function () {
      await org.connect(admin).addEmployee(employee1.address, mockEncryptedSalary1);

      expect(await org.isEmployee(employee1.address)).to.be.true;
      const employees = await org.getEmployees();
      expect(employees).to.include(employee1.address);

      const encSalary = await org.getEncryptedSalary(employee1.address);
      expect(ethers.toUtf8String(encSalary)).to.equal("enc_salary_1.5_ETH");

      // Verify factory registration
      const empOrgs = await factory.getEmployeeOrganizations(employee1.address);
      expect(empOrgs).to.include(await org.getAddress());
    });

    it("should allow admin to batch add employees", async function () {
      await org.connect(admin).addEmployees(
        [employee1.address, employee2.address],
        [mockEncryptedSalary1, mockEncryptedSalary2]
      );

      expect(await org.isEmployee(employee1.address)).to.be.true;
      expect(await org.isEmployee(employee2.address)).to.be.true;
      expect((await org.getEmployees()).length).to.equal(2);
    });

    it("should allow admin to update employee encrypted salary", async function () {
      await org.connect(admin).addEmployee(employee1.address, mockEncryptedSalary1);
      const newSalaryPayload = ethers.toUtf8Bytes("enc_salary_3.0_ETH");

      await org.connect(admin).updateSalary(employee1.address, newSalaryPayload);
      const updatedSalary = await org.getEncryptedSalary(employee1.address);
      expect(ethers.toUtf8String(updatedSalary)).to.equal("enc_salary_3.0_ETH");
    });

    it("should allow admin to remove an employee", async function () {
      await org.connect(admin).addEmployee(employee1.address, mockEncryptedSalary1);
      await org.connect(admin).removeEmployee(employee1.address);

      expect(await org.isEmployee(employee1.address)).to.be.false;
      expect((await org.getEmployees()).length).to.equal(0);
    });
  });

  describe("Payroll Execution", function () {
    it("should allow admin to run payroll and increment run count", async function () {
      await org.connect(admin).addEmployee(employee1.address, mockEncryptedSalary1);
      expect(await org.payrollRunCount()).to.equal(0);

      await expect(org.connect(admin).runPayroll())
        .to.emit(org, "PayrollExecuted")
        .withArgs(1, (val: bigint) => val > 0, 1);

      expect(await org.payrollRunCount()).to.equal(1);
    });
  });

  describe("Withdrawal Requests & TEE Settlement", function () {
    beforeEach(async function () {
      await org.connect(admin).addEmployee(employee1.address, mockEncryptedSalary1);
      await org.connect(admin).runPayroll();
    });

    it("should allow employee to submit withdrawal request", async function () {
      const withdrawAmount = ethers.parseEther("0.5");
      const sepoliaRecipient = employee1.address;

      await expect(org.connect(employee1).requestWithdrawal(withdrawAmount, sepoliaRecipient))
        .to.emit(org, "WithdrawalRequested")
        .withArgs(0, employee1.address, withdrawAmount, sepoliaRecipient, (val: bigint) => val > 0);

      const req = await org.getWithdrawalRequest(0);
      expect(req.employee).to.equal(employee1.address);
      expect(req.amount).to.equal(withdrawAmount);
      expect(req.sepoliaRecipient).to.equal(sepoliaRecipient);
      expect(req.settled).to.be.false;
    });

    it("should allow TEE enclave or admin to settle withdrawal request", async function () {
      const withdrawAmount = ethers.parseEther("0.5");
      await org.connect(employee1).requestWithdrawal(withdrawAmount, employee1.address);

      const fakeSepoliaTxHash = ethers.keccak256(ethers.toUtf8Bytes("sepolia_tx_hash_123"));

      await expect(org.connect(teeVault).settleWithdrawal(0, fakeSepoliaTxHash))
        .to.emit(org, "WithdrawalSettled")
        .withArgs(0, employee1.address, withdrawAmount, fakeSepoliaTxHash);

      const req = await org.getWithdrawalRequest(0);
      expect(req.settled).to.be.true;
      expect(req.txHash).to.equal(fakeSepoliaTxHash);
    });

    it("should reject non-TEE non-admin from settling withdrawal", async function () {
      const withdrawAmount = ethers.parseEther("0.5");
      await org.connect(employee1).requestWithdrawal(withdrawAmount, employee1.address);

      const fakeSepoliaTxHash = ethers.keccak256(ethers.toUtf8Bytes("sepolia_tx_hash_123"));
      await expect(org.connect(employee2).settleWithdrawal(0, fakeSepoliaTxHash))
        .to.be.revertedWithCustomError(org, "OnlyTeeOrAdmin");
    });
  });
});
