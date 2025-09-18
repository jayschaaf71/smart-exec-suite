import { Header } from "@/components/layout/Header";
import { PersonalProductivity } from "@/components/onboarding/PersonalProductivity";

export default function Productivity() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PersonalProductivity />
    </div>
  );
}