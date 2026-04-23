import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 bg-black">
      <h1 className="text-3xl font-bold tracking-widest text-fog-blue uppercase">
        Mystery TRPG
      </h1>
      <p className="text-gray-500 text-sm tracking-wider">Scene Sync System</p>
      <div className="flex gap-6 mt-4">
        <Link
          href="/gm"
          className="px-8 py-3 border border-gray-700 text-gray-300 hover:border-fog-blue hover:text-fog-blue transition-colors tracking-widest text-sm uppercase"
        >
          GM
        </Link>
        <Link
          href="/play"
          className="px-8 py-3 border border-gray-700 text-gray-300 hover:border-fog-blue hover:text-fog-blue transition-colors tracking-widest text-sm uppercase"
        >
          Player
        </Link>
      </div>
    </main>
  );
}
