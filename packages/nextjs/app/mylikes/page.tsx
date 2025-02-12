"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import Liked from "~~/components/haus/liked";
import { Welcome } from "~~/components/haus/welcome";
import { useMyLikes } from "~~/hooks/haus/useMyLikes";

const MyLikes: NextPage = () => {
  const { feed } = useMyLikes();
  const { address: connectedAddress } = useAccount();

  return (
    <div className="flex items-center flex-col flex-grow gap-4">
      {!connectedAddress && <Welcome />}
      {connectedAddress && feed.length === 0 && <p>No liked yet!</p>}
      {connectedAddress && feed.length > 0 && (
        <div className="flex flex-col gap-4 my-4">
          {feed.map(liked => (
            <Liked key={liked.id} liked={liked} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLikes;
