import type { Metadata } from "next";
import Report from "@/components/Report";

export const metadata: Metadata = {
  title: "Your Free Birth Chart PDF Report",
  description: "Download your personal natal chart report, placements, readings and year ahead as a free PDF.",
  alternates: { canonical: "/report" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Report />;
}
