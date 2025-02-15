"use client";

import { useState } from "react";
import Image from "next/image";
import { Address } from "~~/components/scaffold-eth";

const Match = ({ match, haus, hausOwners, matchedOwners, onOwnerApproved }: any) => {
  const [selectedOwner, setSelectedOwner] = useState("");

  // Check if the selected owner is already in the hausOwners list
  const isOwnerAlreadyAdded = hausOwners.includes(selectedOwner);

  const handleApproveOwner = () => {
    onOwnerApproved(selectedOwner);
  };

  return (
    <div className="flex flex-col justify-between items-center p-4 bg-base-200 w-full rounded-lg">
      <div className="flex flex-row">
        <div className="avatar">
          <div className="w-24 rounded">
            <Image src={haus[0].haus.profile_pic} alt={haus[0].haus.title} className="w-16 h-16 rounded-full" />
          </div>
        </div>
        <span>
          <Image src="/heart-anim.gif" width={300} height={300} alt="fresh" className="w-14 h-14" />
        </span>
        <div className="avatar">
          <div className="w-24 rounded">
            <Image src={match.matchHaus.profile_pic} alt={match.matchHaus.title} className="w-16 h-16 rounded-full" />
          </div>
        </div>
      </div>

      <p className="text-center">
        <span className="opacity-85">You matched with </span>
        <a href={`/haus/${match.matchHaus.id}`} className="font-medium opacity-100">
          {match.matchHaus.title}
        </a>
      </p>

      {/* Multisig Owners Section */}
      <span className="text-sm">
        <span className="badge badge-neutral mb-2">Add</span>
      </span>
      <div className="flex flex-row justify-between w-full text-sm p-5 bg-base-100 rounded-xl">
        <div className="">
          <span className="text-opacity-75 mb-2">Multisig owners</span>
          <div className="flex flex-col gap-2">
            {matchedOwners.length > 0 ? (
              matchedOwners.map((owner: any, idx: number) => (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`owner-${match.matchHaus.multisig_id}`}
                    value={owner}
                    onChange={() => setSelectedOwner(owner)}
                  />
                  <Address address={owner} />
                </label>
              ))
            ) : (
              <span className="text-xs opacity-75">Fetching owners...</span>
            )}
          </div>
        </div>

        <div className="w-14 h-14 border-secondary border-2 rounded-full">
          <Image src={match.matchHaus.profile_pic} alt={match.matchHaus.title} className="w-14 h-14 rounded-full" />
        </div>
      </div>

      {/* Multisig Owners Section */}
      <span className="text-sm mt-2">
        {" "}
        <span className="badge badge-neutral mb-2">into</span>
      </span>

      <div className="flex flex-row items-center justify-between w-full text-sm p-5 bg-base-100 rounded-xl">
        <div>
          <span className="text-opacity-75 mb-2">Multisig owners</span>
          <div className="flex flex-col gap-2">
            {hausOwners.length > 0 ? (
              hausOwners.map((owner: any, idx: number) => <Address key={idx} address={owner} />)
            ) : (
              <span className="text-xs opacity-75">Fetching owners...</span>
            )}
          </div>
        </div>

        <div className="w-14 h-14 border-secondary border-2 rounded-full">
          <Image src={haus[0].haus.profile_pic} alt={haus[0].haus.title} className="w-14 h-14 rounded-full" />
        </div>
      </div>

      <button
        className="btn btn-primary mt-4"
        onClick={handleApproveOwner}
        disabled={!selectedOwner || isOwnerAlreadyAdded}
      >
        {isOwnerAlreadyAdded ? "Owner already added" : "Approve owner"}
      </button>
    </div>
  );
};

export default Match;
