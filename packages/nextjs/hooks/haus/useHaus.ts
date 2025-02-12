"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readHausFromSigner } from "~~/utils/crud/crud-haus";
import { fetchTotalAssetValue } from "~~/utils/safe/fetchTotalAssetValue";

/**
 * useHausData HOOK
 * Fetches and returns Haus data based on the connected address.
 **/
export const useHaus = () => {
  const { address: connectedAddress } = useAccount();
  const [haus, setHausData] = useState<any>(null);
  const [totalAssetValue, setTotalAssetValue] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const refetch = () => {
    setTriggerRefetch(prev => !prev); // Trigger refetch
  };

  useEffect(() => {
    const fetchHausData = async () => {
      if (!connectedAddress) return;

      setLoading(true);

      try {
        const res = await readHausFromSigner(connectedAddress);
        if (res && res.length > 0) {
          setHausData(res);
          const res2 = await fetchTotalAssetValue(res[0].haus.multisig_id, 84532);
          setTotalAssetValue(res2);
        } else {
          setHausData(null);
        }
      } catch (err) {
        console.error("Error fetching Haus data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHausData();
  }, [connectedAddress, triggerRefetch]);

  return { loading, haus, totalAssetValue, refetch };
};
