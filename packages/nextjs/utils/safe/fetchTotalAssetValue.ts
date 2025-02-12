/**
 * READ: readAllHaus()
 * TABLE: "haus"
 **/

const SAFE_API_BASE_URL = "https://safe-client.safe.global/v1";

export const fetchTotalAssetValue = async (safeAddress: string, chainId: number): Promise<number | null> => {
  if (!safeAddress) return null;

  try {
    const response = await fetch(`${SAFE_API_BASE_URL}/chains/${chainId}/safes/${safeAddress}/balances/usd`);
    if (!response.ok) throw new Error(`Error fetching balances: ${response.statusText}`);

    const data = await response.json();

    if (Array.isArray(data.items)) {
      const totalValue = data.items.reduce((sum: number, asset: any) => sum + (parseFloat(asset.fiatBalance) || 0), 0);

      return isNaN(totalValue) ? null : totalValue;
    } else {
      console.error("Expected 'items' to be an array, but got:", data.items);
      return null;
    }
  } catch (error) {
    console.error("Error fetching Safe balances:", error);
    return null;
  }
};
