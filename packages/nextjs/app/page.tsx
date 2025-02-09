"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CreateHaus } from "~~/components/haus/create-haus";
import { Welcome } from "~~/components/haus/welcome";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  console.log("address", connectedAddress);

  return (
    <>
      <div className="flex items-center flex-col flex-grow bg-base-300 pt-10">
        {!connectedAddress && <Welcome />}
        {connectedAddress && <CreateHaus />}
      </div>
    </>
  );
};

export default Home;
