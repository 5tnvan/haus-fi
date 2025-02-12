"use client";

import { useParams } from "next/navigation";
import type { NextPage } from "next";
import { useWalletClient } from "wagmi";
import { Haus } from "~~/components/haus/haus";
import { useHausById } from "~~/hooks/haus/useHausById";
import { useMultisigOwners } from "~~/hooks/haus/useOwners";

const HausProfile: NextPage = () => {
  const { haus_id } = useParams();
  const { haus, totalAssetValue } = useHausById(haus_id);
  const { data: walletClient } = useWalletClient();

  const hausData = haus && haus.length > 0 ? haus[0] : null;
  const multisigId = hausData?.multisig_id;

  const { owners, loading } = useMultisigOwners(multisigId, walletClient);

  if (!hausData || !multisigId || loading) {
    return <div className="w-full text-center p-5">Loading...</div>;
  }

  return (
    <>
      <Haus hausData={haus} totalAssetValue={totalAssetValue} owners={owners} />
    </>
  );
};

export default HausProfile;
