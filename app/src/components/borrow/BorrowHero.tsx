export default function BorrowHero() {
  return (
    <header className="mt-8 mb-12 text-center">
      <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter mb-5 text-on-surface">
        Borrow Against Your{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container">
          Stocks
        </span>
      </h1>
      <p className="text-on-surface-variant text-lg md:text-xl font-light max-w-2xl mx-auto">
        Unlock liquidity without selling your position.
      </p>
    </header>
  );
}
