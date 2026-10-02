import type { Metadata } from "next";
import { ExplorePage } from "@/components/explore/ExplorePage";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Search restaurants, supermarkets, grocery stores, food and categories near you on StockedUp.",
};

export default function Page() {
  return <ExplorePage />;
}