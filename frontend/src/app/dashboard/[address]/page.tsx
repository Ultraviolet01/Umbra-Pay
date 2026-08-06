"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const OrgDashboard = dynamic(() => import("./OrgDashboard"), { ssr: false });

export default function OrgDashboardPage() {
  const params = useParams();
  const rawAddress = Array.isArray(params?.address) ? params.address[0] : params?.address;
  const address = (rawAddress as `0x${string}`) || "0x0000000000000000000000000000000000000000";

  return <OrgDashboard address={address} />;
}
