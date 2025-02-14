export function calculateEthFromUsd(value: number, nativeCurrencyPrice: number) {
  return value / nativeCurrencyPrice;
}