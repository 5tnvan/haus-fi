import React, { useState } from "react";
import { Address } from "../scaffold-eth/Address/Address";
import MultisigOwners from "./multisig-owners";
import SafeApiKit from "@safe-global/api-kit";
import Safe from "@safe-global/protocol-kit";
import { baseSepolia } from "viem/chains";
import { useAccount, useWalletClient } from "wagmi";
import { useHaus } from "~~/hooks/haus/useHaus";
import { useMultisigOwners } from "~~/hooks/haus/useOwners";
import { useGlobalState } from "~~/services/store/store";
import { calculateEthFromUsd } from "~~/utils/calculate-eth-from-usd";

export const AIAgent = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { haus, totalAssetValue } = useHaus();
  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [success, setSuccess] = useState<boolean>(false);
  const [successLink, setSuccessLink] = useState<string | null>(null);

  // Ensure haus has a valid value before trying to access haus[0]
  const hausData = haus && haus[0] ? haus[0] : null;
  const multisigId = hausData?.haus?.multisig_id;

  // Use the custom hook to get owners, loading, and error states
  const { loading, owners } = useMultisigOwners(multisigId, walletClient);

  const handlePropose1 = async () => {
    if (totalAssetValue === 0) return;
    try {
      const apiKit = new SafeApiKit({
        chainId: 84532n,
      });

      const protocolKit = await Safe.init({
        provider: baseSepolia.rpcUrls.default.http[0],
        signer: process.env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY,
        safeAddress: multisigId,
      });

      const onedollar = calculateEthFromUsd(1, nativeCurrencyPrice);
      const valueInWei = BigInt(Math.floor(onedollar * 10 ** 18));

      console.log("onedollar", onedollar);

      const tx = await protocolKit.createTransaction({
        transactions: [
          {
            to: process.env.NEXT_PUBLIC_DEPLOYER_PUBLIC_KEY || "",
            data: "0x",
            value: valueInWei.toString(),
          },
        ],
      });

      const safeTxHash = await protocolKit.getTransactionHash(tx);
      const signature = await protocolKit.signHash(safeTxHash);

      await apiKit.proposeTransaction({
        safeAddress: multisigId,
        safeTransactionData: tx.data,
        safeTxHash,
        senderSignature: signature.data,
        senderAddress: process.env.NEXT_PUBLIC_DEPLOYER_PUBLIC_KEY || "",
      });

      console.log("Proposed a transaction with Safe:", multisigId);
      console.log("- safeTxHash:", safeTxHash);
      console.log("- Sender:", process.env.NEXT_PUBLIC_DEPLOYER_PUBLIC_KEY);
      console.log("- Sender signature:", signature.data);

      const link = `https://app.safe.global/transactions/tx?safe=basesep:${multisigId}&id=multisig_${multisigId}_${safeTxHash}`;
      setSuccess(true);
      setSuccessLink(link);
    } catch (error) {
      alert(error);
    }
  };

  const handlePropose2 = async () => {
    if (totalAssetValue === 0) return;
    try {
      const apiKit = new SafeApiKit({
        chainId: 84532n,
      });

      const protocolKit = await Safe.init({
        provider: baseSepolia.rpcUrls.default.http[0],
        signer: process.env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY,
        safeAddress: multisigId,
      });

      const amountToDistribute = calculateEthFromUsd(totalAssetValue, nativeCurrencyPrice) * 0.22;
      const filteredOwners = owners.filter(owner => owner !== process.env.NEXT_PUBLIC_DEPLOYER_PUBLIC_KEY);
      const amountToDistributeBigInt = BigInt(Math.floor(amountToDistribute * 1e18));
      const amountPerOwner = amountToDistributeBigInt / BigInt(filteredOwners.length);

      const transactions = filteredOwners.map(owner => ({
        to: owner,
        value: amountPerOwner.toString(),
        data: "0x",
      }));

      const tx = await protocolKit.createTransaction({
        transactions,
      });

      const safeTxHash = await protocolKit.getTransactionHash(tx);
      const signature = await protocolKit.signHash(safeTxHash);

      await apiKit.proposeTransaction({
        safeAddress: multisigId,
        safeTransactionData: tx.data,
        safeTxHash,
        senderSignature: signature.data,
        senderAddress: process.env.NEXT_PUBLIC_DEPLOYER_PUBLIC_KEY || "",
      });

      console.log("Proposed a transaction with Safe:", multisigId);
      console.log("- safeTxHash:", safeTxHash);
      console.log("- Sender:", process.env.NEXT_PUBLIC_DEPLOYER_PUBLIC_KEY);
      console.log("- Sender signature:", signature.data);

      const link = `https://app.safe.global/transactions/tx?safe=basesep:${multisigId}&id=multisig_${multisigId}_${safeTxHash}`;
      setSuccess(true);
      setSuccessLink(link);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow w-full">
      <div className="p-5 w-full">
        {connectedAddress && hausData && (
          <div className="my-4">
            <a href={`/haus/${hausData?.haus?.id}`} className="text-xl font-bold">
              Hi, {`I'm`} Agent X...
            </a>
            <div className="w-full mt-2 mb-4 object-cover">
              <img src="/Gjl7ldeW4AAGfAN.jpeg" className="w-full rounded-lg" alt="Haus Profile" />
            </div>

            {/* Display total asset value */}
            <div className="flex flex-row gap-2 items-center text-lg font-base">
              <div className="badge badge-lg badge-primary">
                {totalAssetValue !== null ? `$${totalAssetValue.toFixed(2)}` : "Loading..."}
              </div>

              <div className="badge badge-secondary">Total asset value</div>
            </div>

            <p className="text-sm mb-2">{`Here's`} what I can do for you...</p>
            {/* Create Haus Button */}
            <button
              className="flex flex-row btn btn-success rounded-lg items-center justify-between flex-grow w-full mb-2"
              onClick={handlePropose1}
            >
              <img src="/favicon.png" className="w-4 h-4 rounded-lg" alt="Haus Profile" />
              Propose a $1 transaction to self
              <span></span>
            </button>
            <button
              className="flex flex-row btn btn-success rounded-lg items-center justify-between flex-grow w-full mb-2"
              onClick={handlePropose2}
            >
              <img src="/favicon.png" className="w-4 h-4 rounded-lg" alt="Haus Profile" />
              Propose 25% distribution of TAV <br />
              to human owners
              <span></span>
            </button>
            <div className="flex flex-row items-center justify-between text-sm p-5 bg-base-200 rounded-xl">
              <div>
                <span className="text-opacity-75 mb-2">Multisig</span>
                <Address address={hausData?.haus.multisig_id} />
              </div>

              <a
                href={`https://app.safe.global/home?safe=basesep:${hausData?.haus.multisig_id}`}
                className="btn btn-secondary btn-sm"
                target="_blank"
              >
                <img src="/safe.png" width={14} />
                Safe
              </a>
            </div>
            <div className="mt-2">
              <MultisigOwners owners={owners} />
            </div>

            {/* Display loading, error, or owners */}
            {loading && <p>Loading owners...</p>}

            <div className="toast toast-end z-20">
              {successLink && (
                <div className="alert alert-info">
                  <span className="cursor-pointer" onClick={() => setSuccessLink(null)}>
                    Go to{" "}
                    <a href={successLink} className="btn btn-secondary btn-sm" target="_blank">
                      <img src="/safe.png" width={14} />
                      Safe
                    </a>{" "}
                    proposal
                  </span>
                  <span className="cursor-pointer" onClick={() => setSuccessLink(null)}>
                    [x]
                  </span>
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  <span>Proposal successfully created</span>
                  <span className="cursor-pointer" onClick={() => setSuccess(false)}>
                    [x]
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
