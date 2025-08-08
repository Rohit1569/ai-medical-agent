import { PricingTable } from "@clerk/nextjs";
import React from "react";

function Billing() {
  return (
   
      <div className="px-10 md:px-20 lg:px-48">
        <h1 className="text-4xl font-bold mb-10">Join Subscription</h1>
        <PricingTable/>
      </div>
   
  );
}
export default Billing;