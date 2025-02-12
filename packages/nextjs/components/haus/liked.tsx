import React from "react";
import Image from "next/image";
import { Address } from "~~/components/scaffold-eth";

interface LikedProps {
  liked: {
    id: string;
    haus: {
      id: string;
      profile_pic: string;
      title: string;
      description: string;
      multisig_id: string;
    };
  };
}

const Liked: React.FC<LikedProps> = ({ liked }) => {
  return (
    <div key={liked.id} className="card bg-base-200 w-96 shadow-xl">
      <figure>
        <img src={liked.haus.profile_pic} alt={liked.haus.title} className="w-full h-48 object-cover" />
      </figure>
      <div className="flex flex-col gap-3 p-4">
        <div className="text-lg font-bold flex flex-row items-center justify-between">
          <a href={`/haus/${liked.haus.id}`}>{liked.haus.title}</a>
          <div className="flex flex-row justify-center items-center h-8">
            <Image src="/heart-anim.gif" width={300} height={300} alt="fresh" className="w-14 h-14" />
          </div>
        </div>
        <div>{liked.haus.description}</div>
        <div className="flex flex-row items-center justify-between text-sm p-5 bg-base-300 rounded-xl">
          <div>
            <span className="text-opacity-75 mb-2">Multisig</span>
            <Address address={liked.haus.multisig_id} />
          </div>
          <a
            href={`https://app.safe.global/home?safe=basesep:${liked.haus.multisig_id}`}
            className="btn btn-secondary btn-sm"
            target="_blank"
          >
            <img src="/safe.png" width={14} />
            Safe
          </a>
        </div>
      </div>
    </div>
  );
};

export default Liked;
