"use client";

import { useEffect, useState } from "react";
import { createSafeClient } from "@safe-global/sdk-starter-kit";
import type { NextPage } from "next";
import { useAccount, useWalletClient } from "wagmi";
import Match from "~~/components/haus/match";
import { Welcome } from "~~/components/haus/welcome";
import { useHaus } from "~~/hooks/haus/useHaus";
import { useMatches } from "~~/hooks/haus/useMatches";
import { useMultisigOwners } from "~~/hooks/haus/useOwners";
import { fetchMultisigOwners } from "~~/utils/safe/fetchMultisigOwners";

const Matches: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { haus } = useHaus();
  const { feed } = useMatches();
  const { data: walletClient } = useWalletClient();
  const [ownersMap, setOwnersMap] = useState<{ [key: string]: string[] }>({});
  const hausData = haus && haus.length > 0 ? haus[0] : null;
  const multisigId = hausData?.haus.multisig_id;
  const { owners: hausOwners } = useMultisigOwners(multisigId, walletClient);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [successLink, setSuccessLink] = useState<string | null>(null);

  const handleAddOwners = async (multisig_id: string) => {
    console.log("multisig_id", multisig_id);
    if (!connectedAddress || !multisig_id) {
      console.error("Wallet not connected or Safe address missing.");
      return;
    }

    try {
      if (!walletClient) {
        console.error("Wallet client not found.");
        return;
      }

      const provider = {
        request: walletClient.transport.request,
      };

      const safeClient = await createSafeClient({
        provider,
        //signer: walletClient.account.address,
        signer: process.env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY,
        safeAddress: hausData?.haus.multisig_id,
      });

      const transaction = await safeClient.createAddOwnerTransaction({
        ownerAddress: multisig_id,
        threshold: 2,
      });

      const transactionResult = await safeClient.send({ transactions: [transaction] });

      const chainPrefix = "basesep";

      if (transactionResult) {
        console.log("link", transactionResult);
        const link = `https://app.safe.global/transactions/tx?id=multisig_${transactionResult.safeAddress}_${transactionResult.transactions?.safeTxHash}&safe=${chainPrefix}:${transactionResult.safeAddress}`;
        console.log("link", link);
        setSuccessMsg(transactionResult.status);
        setSuccessLink(link);
      }

      console.log("Add Owner Transaction Result", transactionResult);
    } catch (error) {
      console.error("Error adding owner:", error);
    }
  };

  useEffect(() => {
    const fetchOwnersForMatches = async () => {
      if (!walletClient) return;

      const newOwnersMap: { [key: string]: string[] } = {};
      for (const match of feed) {
        if (match.matchHaus.multisig_id) {
          const owners = await fetchMultisigOwners(match.matchHaus.multisig_id, walletClient);
          newOwnersMap[match.matchHaus.multisig_id] = owners;
        }
      }
      setOwnersMap(newOwnersMap);
    };

    fetchOwnersForMatches();
  }, [feed, walletClient]);

  return (
    <div className="flex items-center flex-col flex-grow gap-4">
      {!connectedAddress && <Welcome />}
      {connectedAddress && feed.length === 0 && <p>No matches yet!</p>}
      {connectedAddress && feed.length > 0 && (
        <div className="flex flex-col gap-4 p-4">
          {feed.map((match, index) => (
            <Match
              key={index}
              match={match}
              haus={haus}
              hausOwners={hausOwners}
              matchedOwners={ownersMap[match.matchHaus.multisig_id] || []}
              walletClient={walletClient}
              connectedAddress={connectedAddress}
              onOwnerApproved={(selectedOwner: string) => handleAddOwners(selectedOwner)}
            />
          ))}
        </div>
      )}

      <div className="toast z-20">
        {successMsg && (
          <div className="flex flex-row justify-between alert alert-warning">
            <span>{successMsg}</span>
            <span className="cursor-pointer" onClick={() => setSuccessMsg(null)}>
              [x]
            </span>
          </div>
        )}
        {successLink && (
          <div className="alert alert-info">
            <span className="cursor-pointer" onClick={() => setSuccessLink(null)}>
              Go to{" "}
              <a href={successLink} className="btn btn-secondary btn-sm" target="_blank">
                <img src="/safe.png" width={14} />
                Safe
              </a>{" "}
              transaction
            </span>
            <span className="cursor-pointer" onClick={() => setSuccessLink(null)}>
              [x]
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
