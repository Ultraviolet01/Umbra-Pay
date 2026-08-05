const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

export const CONTRACTS = {
  organizationFactory:
    (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`) ||
    "0x8C00cab72b52644c0F98570c5DC094E3E214B241",
  demoOrg:
    (process.env.NEXT_PUBLIC_DEMO_ORG_ADDRESS as `0x${string}`) ||
    "0x89E6fBd9B415D6E16b2cbeD92D4924659B8e9D94",
  teeVault:
    (process.env.NEXT_PUBLIC_TEE_VAULT_ADDRESS as `0x${string}`) ||
    "0x294dB937C2b9f02A29987472a3F16918a08d1185",
};

export const isContractsDeployed = CONTRACTS.organizationFactory !== ZERO_ADDRESS;

export const UMBRA_ORG_FACTORY_ABI = [
  {
    type: "event",
    name: "OrganizationCreated",
    anonymous: false,
    inputs: [
      { name: "orgAddress", type: "address", indexed: true },
      { name: "admin", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "teeVaultAddress", type: "address", indexed: false },
    ],
  },
  {
    type: "function",
    name: "createOrg",
    inputs: [
      { name: "name", type: "string" },
      { name: "teeVaultAddress", type: "address" },
    ],
    outputs: [{ name: "orgAddress", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getOrganizations",
    inputs: [{ name: "admin", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEmployeeOrganizations",
    inputs: [{ name: "employee", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isDeployedOrg",
    inputs: [{ name: "org", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;

export const UMBRA_ORG_ABI = [
  { type: "error", name: "OnlyAdmin", inputs: [] },
  { type: "error", name: "OnlyTeeOrAdmin", inputs: [] },
  { type: "error", name: "AlreadyEmployee", inputs: [] },
  { type: "error", name: "NotEmployee", inputs: [] },
  { type: "error", name: "ZeroAmount", inputs: [] },
  { type: "error", name: "InvalidRecipient", inputs: [] },
  { type: "error", name: "RequestNotFound", inputs: [] },
  { type: "error", name: "RequestAlreadySettled", inputs: [] },
  {
    type: "event",
    name: "EmployeeAdded",
    anonymous: false,
    inputs: [
      { name: "employee", type: "address", indexed: true },
      { name: "encryptedSalary", type: "bytes", indexed: false },
    ],
  },
  {
    type: "event",
    name: "EmployeeRemoved",
    anonymous: false,
    inputs: [{ name: "employee", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "SalaryUpdated",
    anonymous: false,
    inputs: [
      { name: "employee", type: "address", indexed: true },
      { name: "newEncryptedSalary", type: "bytes", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PayrollExecuted",
    anonymous: false,
    inputs: [
      { name: "runId", type: "uint256", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
      { name: "employeeCount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "WithdrawalRequested",
    anonymous: false,
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "employee", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "sepoliaRecipient", type: "address", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "WithdrawalSettled",
    anonymous: false,
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "employee", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "txHash", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "function",
    name: "addEmployee",
    inputs: [
      { name: "employee", type: "address" },
      { name: "encryptedSalary", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addEmployees",
    inputs: [
      { name: "employees", type: "address[]" },
      { name: "encryptedSalaries", type: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "admin",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "teeVaultAddress",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createdAt",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "payrollRunCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextRequestId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEmployees",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEncryptedSalary",
    inputs: [{ name: "employee", type: "address" }],
    outputs: [{ name: "", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getWithdrawalRequest",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "requestId", type: "uint256" },
          { name: "employee", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "sepoliaRecipient", type: "address" },
          { name: "timestamp", type: "uint256" },
          { name: "settled", type: "bool" },
          { name: "txHash", type: "bytes32" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isEmployee",
    inputs: [{ name: "employee", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "removeEmployee",
    inputs: [{ name: "employee", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "runPayroll",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateSalary",
    inputs: [
      { name: "employee", type: "address" },
      { name: "newEncryptedSalary", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestWithdrawal",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "sepoliaRecipient", type: "address" },
    ],
    outputs: [{ name: "requestId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "settleWithdrawal",
    inputs: [
      { name: "requestId", type: "uint256" },
      { name: "txHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const ORGANIZATION_ABI = UMBRA_ORG_ABI;
