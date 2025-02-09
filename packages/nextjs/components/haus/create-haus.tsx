import React, { useState } from "react";
import Safe, { SafeAccountConfig, getSafeAddressFromDeploymentTx } from "@safe-global/protocol-kit";
import { SafeVersion } from "@safe-global/types-kit";
import semverSatisfies from "semver/functions/satisfies";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { waitForTransactionReceipt } from "viem/actions";
import { baseSepolia } from "viem/chains";
import { useAccount, useWalletClient } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

interface Config {
  RPC_URL: string;
  DEPLOYER_ADDRESS_PRIVATE_KEY: string;
  DEPLOY_SAFE: {
    OWNERS: string[];
    THRESHOLD: number;
    SALT_NONCE: string;
    SAFE_VERSION: string;
  };
}

const config: Config = {
  RPC_URL: baseSepolia.rpcUrls.default.http[0],
  DEPLOYER_ADDRESS_PRIVATE_KEY: process.env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY || "",
  DEPLOY_SAFE: {
    OWNERS: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"], //dummy wallet
    THRESHOLD: 1,
    SALT_NONCE: "150000",
    SAFE_VERSION: "1.3.0",
  },
};

export const CreateHaus = () => {
  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [safeAddress, setSafeAddress] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(1);
  const [isDeploying, setIsDeploying] = useState(false);

  const createWallet = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!walletClient || !connectedAddress) {
      alert("Please connect your wallet.");
      return;
    }

    setIsDeploying(true);

    console.log("Safe Account config: ", config.DEPLOY_SAFE);
    // 1. set safe config
    const safeAccountConfig: SafeAccountConfig = {
      owners: [connectedAddress], // connected wallet will be the signer
      threshold: config.DEPLOY_SAFE.THRESHOLD,
    };

    const safeVersion = config.DEPLOY_SAFE.SAFE_VERSION as SafeVersion;
    const saltNonce = config.DEPLOY_SAFE.SALT_NONCE;

    // protocol-kit instance creation
    const protocolKit = await Safe.init({
      provider: config.RPC_URL,
      signer: config.DEPLOYER_ADDRESS_PRIVATE_KEY,
      predictedSafe: {
        safeAccountConfig,
        safeDeploymentConfig: {
          saltNonce,
          safeVersion,
        },
      },
    });

    console.log("safeAccountConfig", safeAccountConfig);
    console.log("protocolKit", protocolKit);

    // The Account Abstraction feature is only available for Safes version 1.3.0 and above.
    if (semverSatisfies(safeVersion, ">=1.3.0")) {
      // check if its deployed
      console.log("Safe Account deployed: ", await protocolKit.isSafeDeployed());

      // Predict deployed address
      const predictedSafeAddress = await protocolKit.getAddress();
      console.log("Predicted Safe address:", predictedSafeAddress);
    }

    console.log("Deploying Safe Account...");

    // Deploy the Safe account
    const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction();

    console.log("deploymentTransaction: ", deploymentTransaction);

    const account = privateKeyToAccount(`0x${config.DEPLOYER_ADDRESS_PRIVATE_KEY}`);

    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(config.RPC_URL),
    });

    const txHash = await client.sendTransaction({
      to: deploymentTransaction.to,
      value: BigInt(deploymentTransaction.value),
      data: deploymentTransaction.data as `0x${string}`,
    });

    console.log("Transaction hash:", txHash);

    const txReceipt = await waitForTransactionReceipt(client, { hash: txHash });

    const safeAddress = getSafeAddressFromDeploymentTx(txReceipt, safeVersion);

    console.log("safeAddress:", safeAddress);
    setSafeAddress(safeAddress);

    protocolKit.connect({ safeAddress });

    console.log("is Safe deployed:", await protocolKit.isSafeDeployed());
    console.log("Safe Address:", await protocolKit.getAddress());
    console.log("Safe Owners:", await protocolKit.getOwners());
    console.log("Safe Threshold:", await protocolKit.getThreshold());

    setIsDeploying(false);
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">Create a HAUS</span>
        </h1>
        <div className="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50">
          <svg className="shrink-0 inline w-4 h-4 me-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div>
            {`Let's`} build a new <span className="font-medium">haus</span> by creating a{" "}
            <span className="font-medium">multisig account.</span>
          </div>
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">Signer 1</label>
          <Address address={connectedAddress} />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">Threshold</label>
          <select
            className="block w-full p-2 border rounded"
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
          >
            <option value="1">1 (Single signer)</option>
          </select>
        </div>
        <button
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5"
          onClick={createWallet}
          disabled={isDeploying}
        >
          {isDeploying ? "Deploying..." : "Create Haus"}
        </button>
        {safeAddress && (
          <div className="mt-4 p-4 border rounded bg-gray-100">
            <p className="text-sm font-medium">Safe Deployed At:</p>
            <Address address={safeAddress} />
          </div>
        )}
      </div>
    </div>
  );
};
