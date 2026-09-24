import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BorrowHero from "@/components/borrow/BorrowHero";
import BorrowPanel from "@/components/borrow/BorrowPanel";

export default function BorrowPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-24 px-8 max-w-7xl mx-auto">
        <BorrowHero />
        <BorrowPanel />
      </main>
      <Footer />
    </>
  );
}
