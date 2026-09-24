import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SpendDashboardPreview from "@/components/spend/SpendDashboardPreview";
import SpendCardVisual from "@/components/spend/SpendCardVisual";
import SpendOnboardingSteps from "@/components/spend/SpendOnboardingSteps";

export default function SpendPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col">
        {/* Blurred dashboard preview */}
        <main className="flex-grow pt-24 px-8 pb-16 blur-md pointer-events-none select-none">
          <SpendDashboardPreview />
        </main>

        {/* Onboarding modal overlay — z-40 keeps navbar (z-50) accessible */}
        <div className="fixed inset-0 top-20 z-40 flex items-center justify-center px-4 pointer-events-none">
          <div className="absolute inset-0 bg-surface/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-4xl bg-surface-container-low rounded-[2rem] overflow-hidden shadow-[0_64px_120px_rgba(0,0,0,0.6)] flex flex-col md:flex-row pointer-events-auto">
            <SpendCardVisual />
            <SpendOnboardingSteps />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
