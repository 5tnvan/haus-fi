import React, { useState } from "react";
import { FundHaus } from "./fund-haus";
import Safe, { SafeAccountConfig, getSafeAddressFromDeploymentTx } from "@safe-global/protocol-kit";
import { SafeVersion } from "@safe-global/types-kit";
import semverSatisfies from "semver/functions/satisfies";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { waitForTransactionReceipt } from "viem/actions";
import { baseSepolia } from "viem/chains";
import { useAccount, useWalletClient } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { createHaus } from "~~/utils/crud/crud-haus";
import { getPublicURL, uploadProfileAvatar } from "~~/utils/crud/crud-profile-pic";

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
  const [isDeploying, setIsDeploying] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateWallet = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.preventDefault();
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
    return safeAddress;
  };

  const handleFileSave = async () => {
    if (profilePic) {
      //set up file
      const fileData = new FormData();
      fileData.append("file", profilePic);

      // upload new avatar
      const data1 = await uploadProfileAvatar(fileData, "dummy_multisig_id");

      // update profile table
      const data2 = await getPublicURL(data1?.path);
      return data2.publicUrl;
    }
  };

  const handleCreateHaus = async () => {
    // Ensure required fields are provided
    if (!title || !description) {
      throw new Error("Title and description are required.");
    }

    if (!connectedAddress) {
      throw new Error("Wallet connection is required.");
    }

    // Deploy wallet and get multisig_id
    const multisig_id = await handleCreateWallet();
    if (!multisig_id) {
      throw new Error("Failed to create multisig wallet.");
    }

    // Save the profile picture and ensure it's uploaded
    const profile_pic_url = await handleFileSave();
    if (!profile_pic_url) {
      throw new Error("Profile picture is required.");
    }

    // Create the Haus entry
    const res = await createHaus(multisig_id, title, description, profile_pic_url, connectedAddress);
    if (res) {
      setSuccess(true);
    }
    console.log("Haus created successfully:", res);
  };
  return (
    <>
      {success ? (
        <FundHaus />
      ) : (
        <div className="flex items-center flex-col flex-grow py-10">
          <div className="px-5 max-w-md w-full">
            <h1 className="text-center text-4xl font-bold mb-6">Create a HAUS</h1>

            {/* Profile Picture Upload */}
            <label className="flex flex-col items-center cursor-pointer">
              <div className="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                {profilePicPreview ? (
                  <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500">+</span>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
              <p className="mt-2 text-sm text-gray-600">Click to upload profile picture</p>
            </label>

            {/* Title Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium">Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Enter HAUS title"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Description Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium">Description</label>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Enter description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Signer (Connected Wallet) */}
            <div className="mt-4">
              <label className="block text-sm font-medium">Signer</label>
              <Address address={connectedAddress} />
            </div>

            {/* Threshold (Fixed at 1) */}
            <div className="mt-4">
              <label className="block text-sm font-medium">Threshold</label>
              <select className="w-full p-2 border rounded bg-gray-100" value="1" disabled>
                <option value="1">1 (Single signer)</option>
              </select>
            </div>

            {/* Create Haus Button */}
            <button
              type="button"
              className="mt-6 text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full px-5 py-2.5"
              onClick={handleCreateHaus}
              disabled={isDeploying}
            >
              {isDeploying ? "Deploying..." : "Create Haus"}
            </button>

            {/* Safe Address Display */}
            {safeAddress && (
              <div className="mt-4 p-4 border rounded bg-gray-100">
                <p className="text-sm font-medium">Safe Deployed At:</p>
                <Address address={safeAddress} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
