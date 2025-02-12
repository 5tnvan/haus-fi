import { createSafeClient } from "@safe-global/sdk-starter-kit";

export const fetchMultisigOwners = async (multisig_id: string, walletClient: any): Promise<string[]> => {
  if (!walletClient || !multisig_id) {
    return [];
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
    return await safeClient.getOwners();
  } catch (error) {
    console.error("Error fetching owners:", error instanceof Error ? error.message : String(error));
    return [];
  }
};
