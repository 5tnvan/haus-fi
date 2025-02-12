"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon } from "@heroicons/react/24/solid";
import { CreateHaus } from "~~/components/haus/create-haus";
import { FundHaus } from "~~/components/haus/fund-haus";
import { SwipeHaus } from "~~/components/haus/swipe-haus";
import { Welcome } from "~~/components/haus/welcome";
import { useHaus } from "~~/hooks/haus/useHaus";
import { useRandomHaus } from "~~/hooks/haus/useRandomHaus";
import { createHausSwipe } from "~~/utils/crud/crud-haus-swipes";

const Swipe: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { haus, totalAssetValue } = useHaus();
  const { feed: hausFeed, fetchMore, refetch } = useRandomHaus(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeRightSuccess, setSwipeRightSuccess] = useState(false);

  const handleNextHaus = async (yah: boolean, haus_id: string) => {
    if (yah) {
      const error = await createHausSwipe(haus_id, haus[0].haus_id);
      if (error) {
        alert("Uh-Oh, Swipe Right Failed");
      } else {
        refetch();
        setSwipeRightSuccess(true);
        setTimeout(() => setSwipeRightSuccess(false), 3000);
      }
    }

    if (!yah) {
      if (currentIndex < hausFeed.length - 1) {
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        fetchMore(); // Fetch more data
        setCurrentIndex(0); // Reset index after fetching more
      }
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow">
      {!connectedAddress && <Welcome />}
      {connectedAddress && !haus && <CreateHaus />}
      {connectedAddress && haus && totalAssetValue == 0 && <FundHaus />}
      {connectedAddress && haus && totalAssetValue > 0 && (
        <div className="w-full">
          {/* Show only one Haus at a time */}
          {hausFeed.length > 0 && currentIndex < hausFeed.length && (
            <div key={hausFeed[currentIndex]?.id || currentIndex}>
              <div className="flex flex-row gap-2 px-5">
                {hausFeed[currentIndex].hasSwipedRight ? (
                  <>
                    <button
                      type="button"
                      className="flex flex-row items-center justify-between mt-6 bg-primary hover:opacity-85 font-medium rounded-lg text-sm w-full px-5 py-2.5"
                      onClick={() => handleNextHaus(false, hausFeed[currentIndex].id)}
                    >
                      <span></span>
                      <span>Next</span> <ChevronRightIcon width={15} />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Swipe Left (Nah!) Button */}
                    <button
                      type="button"
                      className="flex flex-row items-center justify-between mt-6 border-primary font-medium rounded-lg text-sm w-full px-5 py-2.5 border-2"
                      onClick={() => handleNextHaus(false, hausFeed[currentIndex].id)}
                    >
                      <ChevronLeftIcon width={15} />
                      <span>{`Nah`}</span>
                      <span></span>
                    </button>

                    {/* Swipe Right (Yah!) Button */}
                    <button
                      type="button"
                      className="flex flex-row items-center justify-between mt-6 bg-primary hover:opacity-85 font-medium rounded-lg text-sm w-full px-5 py-2.5"
                      onClick={() => handleNextHaus(true, hausFeed[currentIndex].id)}
                    >
                      <span>
                        <HeartIcon width={15} />
                      </span>
                      <span>{`Yah!`}</span> <ChevronRightIcon width={15} />
                    </button>
                  </>
                )}
              </div>
              <SwipeHaus hausData={hausFeed[currentIndex]} />
              {swipeRightSuccess && (
                <div className="toast z-30">
                  <div className="alert alert-success">
                    <span className="text-sm font-medium">Yay, you loved it!</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Swipe;
