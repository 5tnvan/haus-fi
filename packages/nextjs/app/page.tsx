"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CreateHaus } from "~~/components/haus/create-haus";
import { Welcome } from "~~/components/haus/welcome";
import { readHausFromSigner } from "~~/utils/crud/crud-haus";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
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
          if (res && res.length > 0) setHausData(res);
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
    <>
      <div className="flex items-center flex-col flex-grow bg-base-300 pt-10">
        {!connectedAddress && <Welcome />}
        {connectedAddress && !hausData && <CreateHaus />}

        {connectedAddress && hausData && (
          <div className="text-center">
            <img
              src={hausData[0]?.haus?.profile_pic}
              alt="Profile Pic"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h2 className="text-xl font-bold mb-2">{hausData[0]?.haus?.title}</h2>
            <p className="text-lg mb-2">{hausData[0]?.haus?.description}</p>
            <p className="text-sm text-gray-500">{hausData[0]?.signer_wallet_id}</p>
          </div>
        )}

        {loading && <div>Loading Haus Data...</div>}
        {error && <div>{error}</div>}
      </div>
    </>
  );
};

export default Home;
