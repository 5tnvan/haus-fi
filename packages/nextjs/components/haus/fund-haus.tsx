import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readHausFromSigner } from "~~/utils/crud/crud-haus";

/**
 * Site footer
 */
export const FundHaus = () => {
  const { address: connectedAddress } = useAccount();
  console.log("address", connectedAddress);
  const [hausData, setHausData] = useState<any>(null); // Store fetched data
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    const fetchHausData = async () => {
      if (connectedAddress) {
        try {
          setLoading(true);
          setError(null);
          const res = await readHausFromSigner(connectedAddress); // Await the promise
          console.log("res", res); // Log the result (e.g., haus data)
          setHausData(res); // Update the state with the fetched data
        } catch (err) {
          console.error("Error fetching Haus data:", err);
          setError("Failed to fetch Haus data");
        } finally {
          setLoading(false); // Stop loading once the request is complete
        }
      }
    };

    fetchHausData();
  }, [connectedAddress]); // Trigger effect when connectedAddress changes

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">Fund your HAUS</span>
        </h1>
        <p>Scan QR Code</p>
      </div>
      <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
        <div className="flex justify-center items-center gap-12 flex-col sm:flex-row"></div>
      </div>
      {connectedAddress && hausData && (
        <div className="text-center">
          <img src={hausData[0]?.haus?.profile_pic} alt="Profile Pic" className="w-32 h-32 rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{hausData[0]?.haus?.title}</h2>
          <p className="text-lg mb-2">{hausData[0]?.haus?.description}</p>
          <p className="text-sm text-gray-500">{hausData[0]?.signer_wallet_id}</p>
        </div>
      )}

      {loading && <div>Loading Haus Data...</div>}
      {error && <div>{error}</div>}
    </div>
  );
};
