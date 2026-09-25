export default function IntelligenceLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 justify-between animate-pulse">
      <div className="h-10 bg-surface-container-high/60 rounded-xl w-64 mb-4" />
      <div className="space-y-4 max-w-md mx-auto py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container-high/60" />
        <div className="h-6 bg-surface-container-high/60 rounded w-72 mx-auto" />
        <div className="h-4 bg-surface-container-high/40 rounded w-96 mx-auto" />
      </div>
      <div className="h-20 bg-surface-container-high/50 rounded-2xl w-full" />
    </div>
  );
}
