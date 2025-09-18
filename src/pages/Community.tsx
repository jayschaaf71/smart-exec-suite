import { Header } from "@/components/layout/Header";
import { CommunityHub } from "@/components/communication/CommunityHub";

export default function Community() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CommunityHub />
    </div>
  );
}