import React, { useState } from "react";
import { Address } from "../scaffold-eth/Address/Address";
import MultisigOwners from "./multisig-owners";
import SafeApiKit from "@safe-global/api-kit";
import Safe from "@safe-global/protocol-kit";
import { baseSepolia } from "viem/chains";
import { useAccount, useWalletClient } from "wagmi";
import { PencilIcon } from "@heroicons/react/24/solid";
import { useHaus } from "~~/hooks/haus/useHaus";
import { useMultisigOwners } from "~~/hooks/haus/useOwners";
import { useGlobalState } from "~~/services/store/store";
import { calculateEthFromUsd } from "~~/utils/calculate-eth-from-usd";

export const AIAgent = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { haus, totalAssetValue } = useHaus();
  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [proposedSuccess, setProposedSuccess] = useState<string | null>(null);
  const [proposedSuccessLink, setProposedSuccessLink] = useState<string | null>(null);
  const [executeSuccess, setExecuteSuccess] = useState<string | null>(null);
  const [executeWarning, setExecuteWarning] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [amount, setAmount] = useState(25);
  const [isEditing, setIsEditing] = useState(false);
  const [isProp1Loading, setIsProp1Loading] = useState(false);
  const [isProp2Loading, setIsProp2Loading] = useState(false);

  const toggleEditing = () => {
    setIsEditing(!isEditing); // Toggle the editing state
  };

  const handleAmountChange = (e: any) => {
    setAmount(e.target.value);
  };

  // Ensure haus has a valid value before trying to access haus[0]
  const hausData = haus && haus[0] ? haus[0] : null;
  const multisigId = hausData?.haus?.multisig_id;

  // Use the custom hook to get owners, loading, and error states
  const { loading, owners } = useMultisigOwners(multisigId, walletClient);

  const handlePropose1 = async (amount: number) => {
    if (totalAssetValue === 0) return;
    try {
      setIsProp1Loading(true);
      const apiKit = new SafeApiKit({
        chainId: 84532n,
      });

      const protocolKit = await Safe.init({
        provider: baseSepolia.rpcUrls.default.http[0],
        signer: process.env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY,
        safeAddress: multisigId,
      });

      const proposedAmount = calculateEthFromUsd(amount, nativeCurrencyPrice);
      const proposedAmountInWei = BigInt(Math.floor(proposedAmount * 10 ** 18));

      const tx = await protocolKit.createTransaction({
        transactions: [
          {
            to: process.env.NEXT_PUBLIC_DEPLOYER_PUBLIC_KEY || "",
            data: "0x",
            value: proposedAmountInWei.toString(),
          },
        ],
      });

      const safeTxHash = await protocolKit.getTransactionHash(tx);
      const signature = await protocolKit.signHash(safeTxHash);

      //security check, max 20% of the TAV
      const maxAllowedAmount = totalAssetValue * 0.2;

      if (amount <= maxAllowedAmount) {
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
        setProposedSuccess("Proposal successfully created");
        setProposedSuccessLink(link);
      } else {
        setSecurityError(`Security check failed: Amount exceeds $${maxAllowedAmount}`);
        setIsProp1Loading(false);
        return;
      }

      // Get pending transactions that need a signature
      const pendingTransactions = await apiKit.getPendingTransactions(multisigId);
      const transaction = pendingTransactions.results[0];

      try {
        await protocolKit.executeTransaction(transaction);
        setExecuteSuccess("Transaction executed successfully.");
      } catch (error) {
        if (error instanceof Error) {
          setExecuteWarning(error.message); // Extract error message if it's an Error object
        } else {
          setExecuteWarning(String(error)); // Convert unknown error to string
        }
      }
      setIsProp1Loading(false);
    } catch (error) {
      setIsProp1Loading(false);
      alert(error);
    }
  };

  const handlePropose2 = async () => {
    if (totalAssetValue === 0) return;
    try {
      setIsProp2Loading(true);
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
      setProposedSuccess("Proposal successfully created");
      setProposedSuccessLink(link);
      setIsProp2Loading(false);
    } catch (error) {
      setIsProp2Loading(false);
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
            {/* Proposal & Exe Buttons */}
            <div className="flex flex-row">
              <button
                className="flex flex-row btn btn-success rounded-lg items-center justify-between flex-grow mb-2 w-2/3"
                onClick={() => handlePropose1(amount)}
              >
                <img src="/favicon.png" className="w-4 h-4 rounded-lg" alt="Haus Profile" />
                {/* Amount input field */}
                Send ${amount} to AI Agent
                {isProp1Loading ? <span className="loading loading-spinner loading-xs"></span> : <span></span>}
              </button>
              <button className="rounded-lg bg-base-200 ml-2 mb-2 w-1/3">
                {isEditing ? (
                  <div className="flex flex-row justify-between px-4">
                    <span></span>
                    <input
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="Enter amount"
                      className="w-10 text-center mx-2 bg-base-200"
                      min="0"
                    />
                    <PencilIcon width={12} onClick={toggleEditing} />
                  </div>
                ) : (
                  <div className="flex flex-row justify-center items-center">
                    <PencilIcon width={12} onClick={toggleEditing} />
                  </div>
                )}
              </button>
            </div>

            <button
              className="flex flex-row btn btn-success rounded-lg items-center justify-between flex-grow w-full mb-2"
              onClick={handlePropose2}
            >
              <img src="/favicon.png" className="w-4 h-4 rounded-lg" alt="Haus Profile" />
              Propose 25% distribution of TAV <br />
              to human owners
              {isProp2Loading ? <span className="loading loading-spinner loading-xs"></span> : <span></span>}
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
              {executeWarning && (
                <div className="flex flex-row justify-between alert alert-warning">
                  <span>{executeWarning}</span>
                  <span className="cursor-pointer" onClick={() => setExecuteWarning(null)}>
                    [x]
                  </span>
                </div>
              )}

              {executeSuccess && (
                <div className="flex flex-row justify-between alert alert-success">
                  <span>{executeSuccess}</span>
                  <span className="cursor-pointer" onClick={() => setExecuteSuccess(null)}>
                    [x]
                  </span>
                </div>
              )}

              {securityError && (
                <div className="flex flex-row justify-between alert alert-error">
                  <span>{securityError}</span>
                  <span className="cursor-pointer" onClick={() => setSecurityError(null)}>
                    [x]
                  </span>
                </div>
              )}

              {proposedSuccessLink && (
                <div className="flex flex-row justify-between alert alert-info">
                  <span className="cursor-pointer" onClick={() => setProposedSuccessLink(null)}>
                    Go to{" "}
                    <a href={proposedSuccessLink} className="btn btn-secondary btn-sm" target="_blank">
                      <img src="/safe.png" width={14} />
                      Safe
                    </a>{" "}
                    transaction
                  </span>
                  <span className="cursor-pointer" onClick={() => setProposedSuccessLink(null)}>
                    [x]
                  </span>
                </div>
              )}

              {proposedSuccess && (
                <div className="flex flex-row justify-between alert alert-success">
                  <span>Proposal successfully created</span>
                  <span className="cursor-pointer" onClick={() => setProposedSuccess(null)}>
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
