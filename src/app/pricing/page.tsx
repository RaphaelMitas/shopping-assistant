"use client";
import PricingTable from "@/components/autumn/pricing-table";
import type { ProductDetails } from "autumn-js/react";

const productDetails: ProductDetails[] = [
  {
    id: "free",
    description: "For those who want to try the app",
    price: {
      primaryText: "$0",
      secondaryText: "/month",
    },
  },
  {
    id: "starter",
    description: "For those of you who are just starting out",
    price: {
      primaryText: "$4,99",
      secondaryText: "/month",
    },
    recommendText: "Most Popular",
  },
  {
    id: "premium",
    description: "For those of you who are really serious",
    price: {
      primaryText: "$9,99",
      secondaryText: "/month",
    },
  },

  {
    id: "top_up",
    description: "For those of you who want to top up",
    price: {
      primaryText: "$10",
      secondaryText: "/1000 tokens",
    },
  },
];

export default function PricingPage() {
  return (
    <div className="m-auto h-full w-full items-center justify-center p-8">
      <PricingTable productDetails={productDetails} />
    </div>
  );
}
