import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 text-center">
      <div className="text-6xl">📶</div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">You&apos;re offline</h1>
        <p className="text-gray-500 mt-2 max-w-sm">
          It looks like you lost your internet connection. Please check your connection and try again.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
      >
        Try Again
      </Link>
      <p className="text-sm text-gray-400">Asian Grocery NG — Fresh Asian Groceries in Nigeria</p>
    </div>
  );
}
