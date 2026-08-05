"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance, useSwitchChain } from "wagmi";
import { parseUnits } from "viem";
import {
  CONTRACTS,
  UMBRA_ORG_FACTORY_ABI,
  UMBRA_ORG_ABI,
  isContractsDeployed,
} from "@/lib/contracts";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

/**
 * Hook for UmbraOrgFactory interactions on Coston2 coordination chain.
 */
export function useOrganizationFactory() {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContract, isPending, isSuccess, data: hash } = useWriteContract();

  const createOrganization = async (name: string, teeVaultAddress: `0x${string}` = CONTRACTS.teeVault) => {
    if (chainId !== 114) {
      try {
        await switchChainAsync({ chainId: 114 });
      } catch (err) {
        console.error("Failed to switch network to Coston2:", err);
        return;
      }
    }

    writeContract({
      address: CONTRACTS.organizationFactory,
      abi: UMBRA_ORG_FACTORY_ABI,
      functionName: "createOrg",
      args: [name, teeVaultAddress],
      gas: 3000000n,
    });
  };

  const {
    data: organizations,
    isLoading: isLoadingOrgs,
    refetch: refetchOrgs,
  } = useReadContract({
    address: CONTRACTS.organizationFactory,
    abi: UMBRA_ORG_FACTORY_ABI,
    functionName: "getOrganizations",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isContractsDeployed },
  });

  return {
    createOrganization,
    organizations: (organizations as `0x${string}`[] | undefined) ?? [],
    isCreating: isPending,
    isCreated: isSuccess,
    txHash: hash,
    isLoadingOrgs,
    refetchOrgs,
  };
}

/**
 * Hook for fetching organizations an employee belongs to on Coston2.
 */
export function useEmployeeOrganizations() {
  const { address } = useAccount();

  const {
    data: employeeOrgs,
    isLoading: isLoadingEmployeeOrgs,
    refetch: refetchEmployeeOrgs,
  } = useReadContract({
    address: CONTRACTS.organizationFactory,
    abi: UMBRA_ORG_FACTORY_ABI,
    functionName: "getEmployeeOrganizations",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isContractsDeployed },
  });

  return {
    employeeOrgs: (employeeOrgs as `0x${string}`[] | undefined) ?? [],
    isLoadingEmployeeOrgs,
    refetchEmployeeOrgs,
  };
}

/**
 * Hook for single UmbraOrg interactions on Coston2 coordination chain.
 */
export function useOrganization(orgAddress?: `0x${string}`) {
  const { writeContract, isPending, data: txHash, reset: resetTx } = useWriteContract();
  const {
    writeContract: writeRemove,
    data: removeTxHash,
    reset: resetRemove,
  } = useWriteContract();

  const [removingAddress, setRemovingAddress] = useState<`0x${string}` | null>(null);

  const { isSuccess: isRemoveConfirmed } = useWaitForTransactionReceipt({
    hash: removeTxHash,
    query: { enabled: !!removeTxHash },
  });

  const addEmployee = (employee: `0x${string}`, encryptedSalary: `0x${string}`) => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: UMBRA_ORG_ABI,
      functionName: "addEmployee",
      args: [employee, encryptedSalary],
      gas: 500000n,
    });
  };

  const addEmployees = (employees: `0x${string}`[], encryptedSalaries: `0x${string}`[]) => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: UMBRA_ORG_ABI,
      functionName: "addEmployees",
      args: [employees, encryptedSalaries],
      gas: 1000000n,
    });
  };

  const removeEmployee = (employee: `0x${string}`) => {
    if (!orgAddress) return;
    setRemovingAddress(employee);
    writeRemove(
      {
        address: orgAddress,
        abi: UMBRA_ORG_ABI,
        functionName: "removeEmployee",
        args: [employee],
        gas: 300000n,
      },
      {
        onError: () => setRemovingAddress(null),
      }
    );
  };

  const runPayroll = () => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: UMBRA_ORG_ABI,
      functionName: "runPayroll",
      gas: 500000n,
    });
  };

  const updateSalary = (employee: `0x${string}`, newEncryptedSalary: `0x${string}`) => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: UMBRA_ORG_ABI,
      functionName: "updateSalary",
      args: [employee, newEncryptedSalary],
      gas: 500000n,
    });
  };

  const requestWithdrawal = (amountWei: bigint, sepoliaRecipient: `0x${string}`) => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: UMBRA_ORG_ABI,
      functionName: "requestWithdrawal",
      args: [amountWei, sepoliaRecipient],
      gas: 500000n,
    });
  };

  const deposit = (amountEth: string) => {
    fetch("/api/enclave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deposit",
        depositAmountEth: amountEth,
      }),
    });
  };

  const { data: orgName } = useReadContract({
    address: orgAddress,
    abi: UMBRA_ORG_ABI,
    functionName: "name",
    query: { enabled: !!orgAddress },
  });

  const { data: employees, refetch: refetchEmployees } = useReadContract({
    address: orgAddress,
    abi: UMBRA_ORG_ABI,
    functionName: "getEmployees",
    query: { enabled: !!orgAddress },
  });

  const { data: adminAddress } = useReadContract({
    address: orgAddress,
    abi: UMBRA_ORG_ABI,
    functionName: "admin",
    query: { enabled: !!orgAddress },
  });

  const { data: teeVaultAddress } = useReadContract({
    address: orgAddress,
    abi: UMBRA_ORG_ABI,
    functionName: "teeVaultAddress",
    query: { enabled: !!orgAddress },
  });

  const { data: createdAt } = useReadContract({
    address: orgAddress,
    abi: UMBRA_ORG_ABI,
    functionName: "createdAt",
    query: { enabled: !!orgAddress },
  });

  const { data: payrollRunCount } = useReadContract({
    address: orgAddress,
    abi: UMBRA_ORG_ABI,
    functionName: "payrollRunCount",
    query: { enabled: !!orgAddress },
  });

  const { data: vaultBalanceData, refetch: refetchBalance } = useBalance({
    address: CONTRACTS.teeVault,
    chainId: 11155111,
  });

  const contractBalance = vaultBalanceData ? vaultBalanceData.value : 0n;

  useEffect(() => {
    if (isRemoveConfirmed && removingAddress) {
      refetchEmployees();
      setRemovingAddress(null);
      resetRemove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRemoveConfirmed]);

  return {
    addEmployee,
    addEmployees,
    removeEmployee,
    runPayroll,
    updateSalary,
    requestWithdrawal,
    deposit,
    paymentToken: ZERO_ADDRESS,
    contractBalance,
    isETH: true,
    orgName: orgName as string | undefined,
    employees: (employees as `0x${string}`[] | undefined) ?? [],
    adminAddress: adminAddress as `0x${string}` | undefined,
    teeVaultAddress: (teeVaultAddress as `0x${string}` | undefined) || CONTRACTS.teeVault,
    createdAt: createdAt as bigint | undefined,
    payrollRunCount: payrollRunCount as bigint | undefined,
    isPending,
    removingAddress,
    txHash,
    resetTx,
    refetchEmployees,
    refetchBalance,
  };
}
