"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useWalletClient } from "wagmi";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { useMultisigOwners } from "~~/hooks/haus/useOwners";
import { fetchTotalAssetValue } from "~~/utils/safe/fetchTotalAssetValue";

interface HausSigner {
  signer_wallet_id: string;
}

interface HausData {
  id: string;
  title: string;
  profile_pic: string;
  description: string;
  multisig_id: string;
  haus_signers: HausSigner[];
  hasSwipedRight: boolean;
}

export const SwipeHaus = ({ hausData }: { hausData: HausData }) => {
  const [totalAssetValue, setTotalAssetValue] = useState<number | null>(null);
  const { data: walletClient } = useWalletClient();
  const { owners } = useMultisigOwners(hausData.multisig_id, walletClient);

  useEffect(() => {
    const fetchData = async () => {
      if (hausData?.multisig_id) {
        const res = await fetchTotalAssetValue(hausData.multisig_id, 84532); // Add networkId if needed
        if (res !== null) {
          setTotalAssetValue(res); // Update the state with the fetched value
        }
      }
    };

    fetchData(); // Call the async function inside useEffect
  }, [hausData]);

  return (
    <div className="flex items-center flex-col flex-grow w-full">
      {/* Progress Bar */}
      <div className="p-5 pt-0 w-full">
        {hausData && (
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-row items-center justify-between mt-2">
              <a href={`/haus/${hausData.id}`} className="text-xl font-bold">
                {hausData.title}
              </a>

              {hausData.hasSwipedRight && (
                <div className="flex flex-row justify-center items-center">
                  <div className="text-xs opacity-50">You loved this</div>
                  <Image src="/heart-anim.gif" width={300} height={300} alt="fresh" className="w-14 h-14" />
                </div>
              )}
            </div>
            <div className="w-full object-cover">
              <img src={hausData.profile_pic} className="w-full h-[300px] object-cover rounded-lg" alt="Haus Profile" />
            </div>

            <div className="flex flex-row gap-2 items-center text-lg font-base">
              <div className="badge badge-lg badge-primary">
                {totalAssetValue !== null ? `$${totalAssetValue.toFixed(2)}` : "Loading..."}
              </div>

              <div className="badge badge-secondary">Total asset value</div>
            </div>

            <div className="text-sm">{hausData.description}</div>
            <div className="flex flex-row items-center justify-between text-sm p-5 bg-base-300 rounded-xl">
              <div>
                <span className="text-opacity-75 mb-2">Multisig</span>
                <Address address={hausData.multisig_id} />
              </div>

              <a
                href={`https://app.safe.global/home?safe=basesep:${hausData.multisig_id}`}
                className="btn btn-secondary btn-sm"
                target="_blank"
              >
                <img src="/safe.png" width={14} />
                Safe
              </a>
            </div>
            <div className="text-sm p-5 bg-base-200 rounded-xl">
              <span className="text-opacity-75">Multisig owners</span>
              <div className="flex flex-col gap-2">
                {owners.map((owner, index) => (
                  <span key={index} className="text-sm">
                    <Address address={owner} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
