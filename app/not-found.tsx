import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-stone-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="text-copper-500 text-xs uppercase tracking-[0.25em] mb-4">404</p>
        <h1 className="font-serif text-5xl mb-6">Page not found</h1>
        <p className="text-stone-400 mb-10">The page may have moved, or the address may be incorrect.</p>
        <Link href="/" className="inline-block bg-copper-600 hover:bg-copper-500 px-8 py-4 text-xs font-bold uppercase tracking-widest">
          Return home
        </Link>
      </div>
    </main>
  );
}
