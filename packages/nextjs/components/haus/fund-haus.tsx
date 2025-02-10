import React, { useEffect, useState } from "react";
import { Address } from "../scaffold-eth/Address/Address";
import { useAccount } from "wagmi";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { readHausFromSigner } from "~~/utils/crud/crud-haus";

const SAFE_API_BASE_URL = "https://safe-client.safe.global/v1";

/**
 * Site footer
 */
export const FundHaus = () => {
  const { address: connectedAddress } = useAccount();
  const [hausData, setHausData] = useState<any>(null); // Store fetched data
  const [totalAssetValue, setTotalAssetValue] = useState<number | null>(null); // Store total assets in USD

  useEffect(() => {
    const fetchHausData = async () => {
      if (connectedAddress) {
        try {
          const res = await readHausFromSigner(connectedAddress);
          console.log("Haus Data:", res);
          setHausData(res);
        } catch (err) {
          console.error("Error fetching Haus data:", err);
        }
      }
    };

    fetchHausData();
  }, [connectedAddress]);

  useEffect(() => {
    const fetchTotalAssetValue = async () => {
      const safeAddress = hausData?.[0]?.haus?.multisig_id;
      const chainId = 84532; // Change if needed (Ethereum Mainnet = 1, Polygon = 137, etc.)

      if (safeAddress) {
        try {
          const response = await fetch(`${SAFE_API_BASE_URL}/chains/${chainId}/safes/${safeAddress}/balances/usd`);
          if (!response.ok) throw new Error(`Error fetching balances: ${response.statusText}`);

          const data = await response.json();

          // Check if 'items' is an array before using reduce
          if (Array.isArray(data.items)) {
            const totalValue = data.items.reduce(
              (sum: number, asset: any) => sum + (parseFloat(asset.fiatBalance) || 0),
              0,
            );

            // Ensure totalValue is a valid number before calling toFixed
            const validTotalValue = Number(totalValue); // Explicitly convert to number
            if (!isNaN(validTotalValue)) {
              console.log(`Total Asset Value for Safe ${safeAddress}: $${validTotalValue.toFixed(2)}`);
              setTotalAssetValue(validTotalValue);
            } else {
              console.error("Total value is NaN:", validTotalValue);
              setTotalAssetValue(null);
            }
          } else {
            console.error("Expected 'items' to be an array, but got:", data.items);
            setTotalAssetValue(null);
          }
        } catch (error) {
          console.error("Error fetching Safe balances:", error);
          setTotalAssetValue(null);
        }
      }
    };

    fetchTotalAssetValue();
  }, [hausData]);

  const handleNextClick = () => {
    if (totalAssetValue === 0) {
      alert("You need to fund your account.");
    } else {
      console.log("Next clicked");
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
            <h2 className="text-xl font-bold my-2">{hausData[0]?.haus?.title}</h2>
            <div className="w-full mb-4 object-cover">
              <img src={hausData[0]?.haus?.profile_pic} className="w-full rounded-lg" alt="Haus Profile" />
            </div>

            {/* Display total asset value */}
            <p className="flex flex-row gap-2 items-center text-lg font-base">
              <div className="badge badge-lg badge-primary">
                {totalAssetValue !== null ? `$${totalAssetValue.toFixed(2)}` : "Loading..."}
              </div>

              <div className="badge badge-secondary">Total asset value</div>
            </p>

            <p className="text-sm mb-2">{hausData[0]?.haus?.description}</p>
            <p className="flex flex-row items-center justify-between text-sm p-5 bg-base-200 rounded-xl">
              <div>
                <span className="text-opacity-75 mb-2">Multisig</span>
                <Address address={hausData[0]?.haus.multisig_id} />
              </div>

              <a
                href={`https://app.safe.global/home?safe=basesep:${hausData[0]?.haus.multisig_id}`}
                className="btn btn-secondary btn-sm"
              >
                <img src="/safe.png" width={14} />
                Fund
              </a>
            </p>
            <p className="text-sm p-5 bg-base-200 rounded-xl">
              <span className="text-opacity-75 mb-2">Signer 1</span>
              <Address address={hausData[0]?.signer_wallet_id} />
            </p>
          </div>
        )}

        {/* Create Haus Button */}
        <button
          type="button"
          className="flex flex-row items-center justify-between mt-6 text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full px-5 py-2.5"
          onClick={handleNextClick}
        >
          <span></span>
          <span>{`Swipe-to-Match`}</span> <ChevronRightIcon width={15} />
        </button>
      </div>
    </div>
  );
};
