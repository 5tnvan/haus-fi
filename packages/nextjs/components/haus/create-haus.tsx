"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export const CreateHaus = () => {
  const { address: connectedAddress } = useAccount();
  const [walletName, setWalletName] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const router = useRouter();

  const handleCreateHaus = async () => {
    if (!walletName || !connectedAddress) {
      return;
    }
    setIsDeploying(true);
    try {
      // Implementation details...
      // After successful creation:
      router.push("/haus/fund");
    } catch (error) {
      console.error("Error creating HAUS:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-[333px] mx-auto p-4">
      {/* Status Bar */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg text-black">9:41</span>
        <div className="flex items-center gap-2">
          <span className="text-black">user.eth</span>
          <span className="text-green-600">base:0x1318...543</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div className="bg-green-600 h-2 rounded-full w-1/4"></div>
      </div>

      {/* Main Content */}
      <h1 className="text-4xl font-bold mb-8 text-black">Create a HAUS</h1>

      <div className="space-y-8">
        {/* Wallet Name Input */}
        <div>
          <label className="block text-black text-lg mb-2">Name your Group Wallet</label>
          <input
            type="text"
            className="w-full p-4 border-2 border-green-600 rounded-2xl text-lg"
            value={walletName}
            onChange={e => setWalletName(e.target.value)}
            placeholder="GreenHAUS<>GreenLand 🏡🌿"
          />
        </div>

        {/* Members Section */}
        <div className="space-y-4">
          {/* AI Agent */}
          <div className="bg-green-50 p-4 rounded-2xl relative">
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xl font-medium text-black">AI Agent</div>
                <div className="text-sm text-green-600 mt-1">base:0x131832E2D191213BBb1570455257c29D2154720</div>
              </div>
              <div className="text-right">
                <div className="text-lg text-black">cherub.eth</div>
                <div className="text-sm text-gray-500">Proposer</div>
              </div>
            </div>
          </div>

          {/* Member 1 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-medium text-black">Connected Wallet</div>
                <div className="text-sm text-green-600">base:0x131832E2D191213BBb1570455257c29D2154722</div>
              </div>
              <div className="text-right">
                <div className="text-black">user.eth</div>
                <div className="text-sm text-gray-500">Owner</div>
              </div>
            </div>
          </div>

          {/* Threshold */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-medium text-black">Multisig Settings</div>
                <div className="text-sm text-black">Any transaction requires the confirmation of</div>
              </div>
              <div className="text-right">
                <div className="text-black">2 owners</div>
                <div className="text-sm text-gray-500">Threshold</div>
              </div>
            </div>
          </div>
        </div>

        {/* You&apos;ll Get Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-black">You&apos;ll get</h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-600">★</span>
              <span className="text-black">Group Wallet / Multisig Account</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">★</span>
              <span className="text-black">1 Signer, 1 AI Proposer</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">★</span>
              <span className="text-black">Be part of HAUS Swipe-to-Match</span>
            </li>
          </ul>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateHaus}
          disabled={isDeploying}
          className="w-full bg-green-600 text-white py-4 rounded-2xl text-lg font-medium"
        >
          {isDeploying ? "Creating..." : "Create HAUS"}
        </button>
      </div>
    </div>
  );
};
