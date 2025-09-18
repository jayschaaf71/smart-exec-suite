import { Header } from "@/components/layout/Header";
import { ConsultingServices } from "@/components/consulting/ConsultingServices";

export default function Consulting() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ConsultingServices />
    </div>
  );
}