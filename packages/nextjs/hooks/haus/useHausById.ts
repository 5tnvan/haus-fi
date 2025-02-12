"use client";

import { useEffect, useState } from "react";
import { readHausFromId } from "~~/utils/crud/crud-haus";
import { fetchTotalAssetValue } from "~~/utils/safe/fetchTotalAssetValue";

/**
 * useHausData HOOK
 * Fetches and returns Haus data based on the connected address.
 **/
export const useHausById = (haus_id: any) => {
  const [haus, setHausData] = useState<any>(null);
  const [totalAssetValue, setTotalAssetValue] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const refetch = () => {
    setTriggerRefetch(prev => !prev); // Trigger refetch
  };

  useEffect(() => {
    const fetchHausData = async () => {
      setLoading(true);

      try {
        const res = await readHausFromId(haus_id);
        if (res && res.length > 0) {
          setHausData(res);
          const res2 = await fetchTotalAssetValue(res[0].multisig_id, 84532);
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
  }, [haus_id, triggerRefetch]);

  return { loading, haus, totalAssetValue, refetch };
};
