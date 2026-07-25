import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-8 relative">
      <div className="max-w-3xl text-center space-y-8 relative z-10 w-full">

        {/* Retro Header Banner */}
        <div className="bg-purple-950/80 border-2 border-dashed border-pink-500 p-8 shadow-[6px_6px_0px_#db2777]">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4 drop-shadow-[2px_2px_0px_#db2777]">
            RUMAH CUKURS
          </h1>
          <div className="text-lg md:text-xl text-purple-200 border-t border-b border-dotted border-purple-500 py-4 mx-4">
            Selamat Datang di Rumah Cukurs<br />
            Potong Rambut // Styling // Perawatan
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center mt-12 pt-8">
          <Link href="/customer" className="group px-8 py-4 bg-purple-900 hover:bg-pink-600 border-2 border-pink-500 font-bold transition-all shadow-[4px_4px_0px_#fbcfe8] hover:shadow-[6px_6px_0px_#fbcfe8] hover:-translate-y-1 w-full md:w-auto text-center text-xl">
            PESAN LAYANAN SEKARANG
          </Link>
        </div>

        {/* Promotional Footer Elements */}
        <div className="mt-16 flex justify-center gap-4 text-xs text-pink-300 font-bold tracking-widest">
          <span className="border border-pink-500 px-2 py-1 bg-purple-950/50 shadow-[2px_2px_0px_#db2777]">Layanan Berkualitas</span>
          <span className="border border-pink-500 px-2 py-1 bg-purple-950/50 shadow-[2px_2px_0px_#db2777]">100% Premium Service</span>
        </div>
      </div>
    </div>
  );
}
