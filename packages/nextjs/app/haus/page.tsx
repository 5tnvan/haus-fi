"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CreateHaus } from "~~/components/haus/create-haus";
import { FundHaus } from "~~/components/haus/fund-haus";
import { Welcome } from "~~/components/haus/welcome";
import { useHaus } from "~~/hooks/haus/useHaus";

const Haus: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { haus } = useHaus();

  return (
    <>
      <div className="flex items-center flex-col flex-grow">
        {!connectedAddress && <Welcome />}
        {connectedAddress && !haus && <CreateHaus />}
        {connectedAddress && haus && <FundHaus />}
      </div>
    </>
  );
};

export default Haus;
