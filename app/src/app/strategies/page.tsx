import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StrategyFilters from "@/components/strategies/StrategyFilters";
import StrategyCard from "@/components/strategies/StrategyCard";
import SortDropdown from "@/components/strategies/SortDropdown";
import { strategies } from "@/lib/data/strategies";

const tabs = [
  "All Strategies",
  "Leverage",
  "Automation",
  "Delta Neutral",
  "Options",
];

export default function StrategiesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-4">
                Structured Strategies
              </h1>
              <p className="text-on-surface-variant max-w-2xl text-lg font-body">
                Unlock yield, leverage, and structured strategies tailored to your risk profile.
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-outline-variant/10 pb-4">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-full font-headline font-semibold text-sm transition-colors ${
                i === 0
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <StrategyFilters />

          {/* Strategy List */}
          <div className="lg:col-span-9 space-y-6">
            {/* Sorting Bar */}
            <div className="flex items-center justify-between bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant/10">
              <p className="text-sm font-body text-on-surface-variant">
                <span className="text-on-surface font-bold">
                  {strategies.length}
                </span>{" "}
                featured vaults available
              </p>
              <SortDropdown />
            </div>

            {/* Strategy Cards */}
            <div className="space-y-4">
              {strategies.map((strategy) => (
                <StrategyCard key={strategy.slug} strategy={strategy} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-8">
              <button className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant/10 hover:border-primary/50 text-on-surface-variant hover:text-primary transition-all">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 rounded-lg bg-primary text-on-primary font-bold text-sm">
                1
              </button>
              <button className="w-10 h-10 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-bold text-sm transition-all">
                2
              </button>
              <button className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant/10 hover:border-primary/50 text-on-surface-variant hover:text-primary transition-all">
                <span className="material-symbols-outlined">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
