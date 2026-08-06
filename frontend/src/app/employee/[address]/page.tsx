"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const EmployeeBalance = dynamic(() => import("./EmployeeBalance"), { ssr: false });

export default function EmployeeBalancePage() {
  const params = useParams();
  const rawAddress = Array.isArray(params?.address) ? params.address[0] : params?.address;
  const address = (rawAddress as `0x${string}`) || "0x0000000000000000000000000000000000000000";

  return <EmployeeBalance orgAddress={address} />;
}
