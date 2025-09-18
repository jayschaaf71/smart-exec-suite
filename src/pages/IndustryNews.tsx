import { Header } from "@/components/layout/Header";
import { IndustryUpdates } from "@/components/knowledge/IndustryUpdates";

export default function IndustryNews() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <IndustryUpdates />
    </div>
  );
}