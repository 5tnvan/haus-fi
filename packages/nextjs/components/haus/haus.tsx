"use client";

import React from "react";
import Image from "next/image";
import { Address } from "~~/components/scaffold-eth/Address/Address";

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

export const Haus = ({
  hausData,
  totalAssetValue,
  owners, // Receive owners as a prop
}: {
  hausData: HausData[];
  totalAssetValue: number | null;
  owners: string[]; // Assuming owners is an array of addresses
}) => {
  // Check if hausData is not empty and use the first item from the array
  const haus = hausData?.length > 0 ? hausData[0] : null;

  if (!haus) {
    return <div className="w-full text-center p-5">Loading...</div>;
  }

  return (
    <div className="flex items-center flex-col flex-grow w-full">
      <div className="p-5 pt-0 w-full">
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex flex-row items-center justify-between mt-2">
            <a href={`/haus/${haus.id}`} className="text-xl font-bold">
              {haus.title}
            </a>

            {haus.hasSwipedRight && (
              <div className="flex flex-row justify-center items-center">
                <div className="text-xs opacity-50">You loved this</div>
                <Image src="/heart-anim.gif" width={300} height={300} alt="fresh" className="w-14 h-14" />
              </div>
            )}
          </div>
          <div className="w-full object-cover">
            <img src={haus.profile_pic} className="w-full h-[300px] object-cover rounded-lg" alt="Haus Profile" />
          </div>

          <div className="flex flex-row gap-2 items-center text-lg font-base">
            <div className="badge badge-lg badge-primary">
              {totalAssetValue !== null ? `$${totalAssetValue.toFixed(2)}` : "Loading..."}
            </div>

            <div className="badge badge-secondary">Total asset value</div>
          </div>

          <div className="text-sm">{haus.description}</div>
          <div className="flex flex-row items-center justify-between text-sm p-5 bg-base-200 rounded-xl">
            <div>
              <span className="text-opacity-75 mb-2">Multisig</span>
              <Address address={haus.multisig_id} />
            </div>

            <a
              href={`https://app.safe.global/home?safe=basesep:${haus.multisig_id}`}
              className="btn btn-secondary btn-sm"
              target="_blank"
            >
              <img src="/safe.png" width={14} />
              Safe
            </a>
          </div>

          {/* Render Owners */}
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
      </div>
    </div>
  );
};
