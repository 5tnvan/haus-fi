import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { readHausFromSigner } from "~~/utils/crud/crud-haus";

const SAFE_API_BASE_URL = "https://safe-client.safe.global/v1";

interface HausData {
  haus: {
    multisig_id: string;
  };
}

interface AssetBalance {
  fiatBalance: string;
}

/**
 * Site footer
 */
export const FundHaus = () => {
  const { address: connectedAddress } = useAccount();
  const [hausData, setHausData] = useState<HausData[] | null>(null);
  const [totalAssetValue, setTotalAssetValue] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHausData = async () => {
      if (!connectedAddress) {
        setError("No wallet connected");
        setIsLoading(false);
        return;
      }

      try {
        const res = await readHausFromSigner(connectedAddress);
        console.log("Haus Data:", res);
        setHausData(res);
        setError(null);
      } catch (err) {
        console.error("Error fetching Haus data:", err);
        setError("Failed to fetch Haus data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHausData();
  }, [connectedAddress]);

  useEffect(() => {
    const fetchTotalAssetValue = async () => {
      const safeAddress = hausData?.[0]?.haus?.multisig_id;
      const chainId = 84532;

      if (!safeAddress) {
        console.log("No Safe address available");
        return;
      }

      try {
        const response = await fetch(`${SAFE_API_BASE_URL}/chains/${chainId}/safes/${safeAddress}/balances/usd`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data.items)) throw new Error("Invalid response format");

        const totalValue = data.items.reduce(
          (sum: number, asset: AssetBalance) => sum + (parseFloat(asset.fiatBalance) || 0),
          0,
        );
        setTotalAssetValue(totalValue);
        setError(null);
      } catch (err) {
        console.error("Error fetching balances:", err);
        setError("Failed to fetch asset values");
      }
    };

    if (hausData) {
      fetchTotalAssetValue();
    }
  }, [hausData]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col gap-4 p-4">
      {hausData && hausData[0]?.haus?.multisig_id && (
        <>
          <h2>Fund your HAUS</h2>
          <div className="p-4 bg-base-200 rounded-lg">
            <Address address={hausData[0].haus.multisig_id} />
            {totalAssetValue !== null && <div>Total Value: ${totalAssetValue.toFixed(2)}</div>}
          </div>
        </>
      )}
      <button
        onClick={() => router.push("/haus/swipe")}
        className="w-full bg-green-600 text-white py-4 rounded-lg font-medium"
      >
        Start Swiping
      </button>
    </div>
  );
};
