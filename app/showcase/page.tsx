import type { Metadata } from "next";
import { EnterpriseShowcase } from "@/components/EnterpriseShowcase";

export const metadata: Metadata = {
  title: "SHK Enterprises & NEXOCELL™ | Official Brand Showcase",
  description:
    "Official SHK Enterprises Engine Spare Parts Dealer & NEXOCELL™ Motorcycle Battery Hub.",
};

export default function ShowcasePage() {
  return (
    <main
      style={{
        backgroundColor: "#050B14",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Exact standalone recreation of uploaded reference design without navigation header */}
      <EnterpriseShowcase />
    </main>
  );
}
