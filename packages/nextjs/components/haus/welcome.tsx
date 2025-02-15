import React from "react";
import Image from "next/image";
import { hardhat } from "viem/chains";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

/**
 * Site footer
 */
export const Welcome = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <div className="flex items-center flex-col flex-grow">
      <div className="w-full h-full object-cover">
        <Image src="/favicon.png" className="w-full" height="400" width="400" alt={""} />
      </div>

      <div className="p-5">
        <h1 className="">
          <span className="block text-4xl font-bold">haus.fi</span>
        </h1>
        <p>Build your haus in just a few minutes</p>
        <p>A haus needs a solid foundation. Create a multisig for your idea and let’s fund, match, grow it!</p>
        <div className="btn rounded-lg flex items-center flex-col flex-grow">
          <RainbowKitCustomConnectButton />
          {isLocalNetwork && <FaucetButton />}
        </div>
      </div>
    </div>
  );
};
