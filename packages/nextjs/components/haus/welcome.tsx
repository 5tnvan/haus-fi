import React from "react";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

/**
 * Site footer
 */
export const Welcome = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  console.log("address", connectedAddress);

  return (
    <div className="flex items-center flex-col flex-grow">
      <div className="w-full h-full object-cover">
        <img src="/favicon.png" className="w-full" />
      </div>

      <div className="p-5">
        <h1 className="">
          <span className="block text-4xl font-bold">haus.fi</span>
        </h1>
        <p>Build your haus in just a few minutes</p>
        <p>A haus needs a solid foundation. Create a wallet for your idea and let’s fund, match, grow it!</p>
        <div className="btn rounded-lg flex items-center flex-col flex-grow">
          <RainbowKitCustomConnectButton />
          {isLocalNetwork && <FaucetButton />}
        </div>
      </div>
    </div>
  );
};
