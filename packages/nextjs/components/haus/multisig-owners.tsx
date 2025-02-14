import { Address } from "../scaffold-eth/Address/Address";

const MultisigOwners = ({ owners }: { owners: string[] }) => {
  return (
    <div className="text-sm p-5 bg-base-200 rounded-xl mt-2">
      <span className="text-opacity-75">Multisig owners</span>
      <div className="flex flex-col gap-2">
        {owners.map((owner, index) => (
          <div key={index} className="flex flex-row justify-between">
            <Address address={owner} />
            {owner === "0x3990677113d7fd2339F85dD4b312E392b595C19f" && (
              <span className="badge badge-success badge-outline">AI agent</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultisigOwners;
