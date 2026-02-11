import React from "react";
import rider from "@/icons/delivery.png"

export default function SidebarWidget() {
   return (
    <div
      style={{ backgroundImage: `url(${rider.src || rider})` }}
      className="mx-auto mb-10 w-full max-w-60 bg-cover bg-center bg-no-repeat rounded-2xl bg-transparent py-20 text-center dark:bg-white/[0.03]"
    >
    </div>
   );
}
