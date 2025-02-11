import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const PreMatchHaus = () => {
  const router = useRouter();

  const handleSwipeToMatch = () => {
    router.push("/haus/match");
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      {/* Header with close button and status */}
      <div className="flex justify-between items-center p-4">
        <div className="text-xl">9:41</div>
        <button className="btn btn-circle btn-ghost">✕</button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">
        {/* Hero Image */}
        <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
          <Image
            src="/path/to/your/image.jpg"
            alt="HAUS Preview"
            width={500}
            height={300}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? "bg-green-600" : "bg-white/60"}`} />
            ))}
          </div>
        </div>

        {/* HAUS Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">GreenHAUS&lt;&gt;GreenLand 🏡🌿</h1>
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg inline-block mt-2">
              Total asset value: $ 5,212.00
            </div>
          </div>

          <p className="text-base-content/80">
            Ayoo, fellow ice-walkers! You wanna build iglu 2.0 with frost-proof tech and green food magic? Then listen
            up! GreenHAUS is NOT your grandma&apos;s ice cube—it&apos;s a modular tiny home + greenhouse built for
            co-buyers, co-livers, and co-investors who wanna chill &amp; thrive in GreenLand.
          </p>

          {/* Member Section */}
          <div className="space-y-4">
            <h2 className="font-semibold">Members</h2>
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full bg-base-300">
                  <Image src="/path/to/member/image.jpg" alt="Member" width={40} height={40} className="rounded-full" />
                </div>
              </div>
              <div>
                <div className="font-medium">tom.eth</div>
                <div className="text-sm text-base-content/60 truncate max-w-[200px]">Connected Address</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4">
        <button onClick={handleSwipeToMatch} className="btn btn-primary w-full text-lg">
          This is your HAUS. Ready to Swipe-to-Match? →
        </button>
      </div>
    </div>
  );
};
