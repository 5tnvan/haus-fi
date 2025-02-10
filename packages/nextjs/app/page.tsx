"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CreateHaus } from "~~/components/haus/create-haus";
import { FundHaus } from "~~/components/haus/fund-haus";
import { Welcome } from "~~/components/haus/welcome";
import { readHausFromSigner } from "~~/utils/crud/crud-haus";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [hausData, setHausData] = useState<any>(null); // Store fetched data

  useEffect(() => {
    const fetchHausData = async () => {
      if (connectedAddress) {
        try {
          const res = await readHausFromSigner(connectedAddress); // Await the promise
          console.log("res", res); // Log the result (e.g., haus data)
          if (res && res.length > 0) setHausData(res);
        } catch (err) {
          console.error("Error fetching Haus data:", err);
        }
      }
    };

    fetchHausData();
  }, [connectedAddress]); // Trigger effect when connectedAddress changes

  return (
    <>
      <div className="flex items-center flex-col flex-grow">
        {!connectedAddress && <Welcome />}
        {connectedAddress && !hausData && <CreateHaus />}

        {connectedAddress && hausData && <FundHaus />}
      </div>
    </>
  );
};

export default Home;
