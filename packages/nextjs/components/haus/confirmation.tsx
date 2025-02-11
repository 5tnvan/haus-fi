import React from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

export default function Confirmation() {
  const { address: connectedAddress } = useAccount();
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = React.useState([
    { id: "co-investors", title: "Co-investors", selected: true },
    { id: "co-partners", title: "Co-partners", selected: false },
    { id: "housemates", title: "Housemates", selected: true },
    { id: "co-parents", title: "Co-parents", selected: false },
    { id: "co-founders", title: "Co-founders", selected: false },
    { id: "co-buyers", title: "Co-buyers", selected: true },
    { id: "co-livers", title: "Co-livers", selected: true },
  ]);

  const toggleOption = (id: string) => {
    setSelectedOptions(options =>
      options.map(option => (option.id === id ? { ...option, selected: !option.selected } : option)),
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      {/* Status Bar */}
      <div className="flex justify-between items-center p-4">
        <span className="text-lg">9:41</span>
        <div className="flex items-center gap-2">
          <span>tom.eth</span>
          <span className="text-green-600 truncate max-w-[100px]">
            {connectedAddress ? `base:${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-3)}` : ""}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div className="bg-green-600 h-2 w-3/4"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Who do you want to build with?</h1>
          <p className="text-base-content/60">Choose your collaboration style.</p>
        </div>

        {/* Options List */}
        <div className="space-y-4">
          {selectedOptions.map(option => (
            <div
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className="flex items-center justify-between p-4 bg-base-200 rounded-lg cursor-pointer"
            >
              <span className="text-lg">{option.title}</span>
              {option.selected && (
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4">
        <button
          onClick={() => router.push("/haus/match")}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-medium"
        >
          Connect HAUS
        </button>
      </div>
    </div>
  );
}
