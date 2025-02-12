import { useEffect, useState } from "react";
import { createSafeClient } from "@safe-global/sdk-starter-kit";

// Custom Hook to fetch multisig owners
export const useMultisigOwners = (multisig_id: any, walletClient: any) => {
  const [owners, setOwners] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchOwners = async () => {
      if (!walletClient || !multisig_id) {
        setLoading(false);
        return;
      }

      try {
        const provider = {
          request: walletClient?.transport.request,
        };

        const safeClient = await createSafeClient({
          provider,
          signer: walletClient?.account.address,
          safeAddress: multisig_id,
        });

        // Fetch owners
        const fetchedOwners = await safeClient.getOwners();
        setOwners(fetchedOwners);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching owners:", error);
        setLoading(false);
      }
    };

    fetchOwners();
  }, [multisig_id, walletClient]); // Add walletClient to dependency to re-fetch if it changes

  return { loading, owners };
};
