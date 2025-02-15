import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Address } from "../scaffold-eth/Address/Address";
import MultisigOwners from "./multisig-owners";
import { useAccount, useWalletClient } from "wagmi";
import { useHaus } from "~~/hooks/haus/useHaus";
import { useMultisigOwners } from "~~/hooks/haus/useOwners";

export const FundHaus = () => {
  const router = useRouter();
  const { haus, totalAssetValue } = useHaus();
  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Ensure haus has a valid value before trying to access haus[0]
  const hausData = haus && haus[0] ? haus[0] : null;
  const multisigId = hausData?.haus?.multisig_id;

  // Use the custom hook to get owners, loading, and error states
  const { loading, owners } = useMultisigOwners(multisigId, walletClient);

  const handleNextClick = () => {
    if (totalAssetValue === 0) {
      alert("You need to fund your account to start");
    } else {
      router.push("/swipe");
    }
  };

  // Set progress bar width dynamically based on the total asset value
  const progressBarWidth = totalAssetValue === 0 ? 85 : 100;

  return (
    <div className="flex items-center flex-col flex-grow w-full">
      {/* Progress Bar */}
      <div className="p-5 w-full">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressBarWidth}%` }}></div>
        </div>

        {connectedAddress && hausData && (
          <div className="my-4">
            <a href={`/haus/${hausData?.haus?.id}`} className="text-xl font-bold">
              {hausData?.haus?.title}
            </a>
            <div className="w-full mt-2 mb-4 object-cover">
              <Image
                src={hausData?.haus?.profile_pic}
                className="w-full rounded-lg"
                alt="Haus Profile"
                width={250}
                height={250}
              />
            </div>

            {/* Display total asset value */}
            <div className="flex flex-row gap-2 items-center text-lg font-base">
              <div className="badge badge-lg badge-primary">
                {totalAssetValue !== null ? `$${totalAssetValue.toFixed(2)}` : "Loading..."}
              </div>

              <div className="badge badge-secondary">Total asset value</div>
            </div>

            <p className="text-sm mb-2">{hausData?.haus?.description}</p>
            <div className="flex flex-row items-center justify-between text-sm p-5 bg-base-200 rounded-xl">
              <div>
                <span className="text-opacity-75 mb-2">Multisig</span>
                <Address address={hausData?.haus.multisig_id} />
              </div>

              <a
                href={`https://app.safe.global/home?safe=basesep:${hausData?.haus.multisig_id}`}
                className="btn btn-secondary btn-sm"
                target="_blank"
              >
                <Image src="/safe.png" width={14} height={14} alt={"safe"} />
                Safe
              </a>
            </div>
            <div className="mt-2">
              <MultisigOwners owners={owners} />
            </div>

            {/* Display loading, error, or owners */}
            {loading && <p>Loading owners...</p>}
          </div>
        )}

        {/* Create Haus Button */}
        <button className="btn rounded-lg flex items-center flex-col flex-grow w-full" onClick={handleNextClick}>
          Swipe-To-Match
        </button>
      </div>
    </div>
  );
};
