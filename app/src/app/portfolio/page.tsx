import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PortfolioHeader from "@/components/portfolio/PortfolioHeader";
import PortfolioStats from "@/components/portfolio/PortfolioStats";
import ActivePositions from "@/components/portfolio/ActivePositions";
import TransactionHistory from "@/components/portfolio/TransactionHistory";
import PortfolioSidebar from "@/components/portfolio/PortfolioSidebar";

export default function PortfolioPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto">
        <PortfolioHeader />
        <PortfolioStats />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <ActivePositions />
            <TransactionHistory />
          </div>
          <PortfolioSidebar />
        </div>
      </main>
      <Footer />
    </>
  );
}
