"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readHausFromSigner } from "~~/utils/crud/crud-haus";
import { readAllMatches } from "~~/utils/crud/crud-haus-swipes";

/**
 * useFeed HOOK
 * Use this to get feed of videos
 **/
export const useMatches = () => {
  const { address: connectedAddress } = useAccount();
  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  //const [hasMore, setHasMore] = useState(true);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const refetch = () => {
    setPage(0);
    setFeed([]);
    //setHasMore(true);
    setTriggerRefetch(prev => !prev);
  };

  const fetchMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const fetchFeed = async () => {
    try {
      if (!connectedAddress) {
        console.warn("No connected address found");
        return;
      }

      setLoading(true);

      const hausData = await readHausFromSigner(connectedAddress);

      if (!hausData || hausData.length === 0) {
        console.warn("No haus data found for signer");
        return;
      }

      const haus = hausData[0];

      const { matches } = await readAllMatches(haus.haus.id);

      if (matches) {
        setFeed(matches);
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connectedAddress) {
      fetchFeed();
    }
  }, [connectedAddress, page, triggerRefetch]);

  return { loading, feed, fetchMore, refetch };
};
