"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [finance, setFinance] = useState({ totalIncome: 0, totalTransactions: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify');
      if (isNetlify) {
        const localBookings = JSON.parse(localStorage.getItem('netlify_bookings') || '[]');
        const localFinance = JSON.parse(localStorage.getItem('netlify_finance') || '{"totalIncome":0,"totalTransactions":0}');
        setBookings(localBookings.sort((a:any, b:any) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()));
        setFinance(localFinance);
        setLoading(false);
        return;
      }

      const [bookingsRes, financeRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/finance")
      ]);
      const bookingsData = await bookingsRes.json();
      const financeData = await financeRes.json();
      
      if(Array.isArray(bookingsData)) setBookings(bookingsData);
      if(financeData.summary) setFinance(financeData.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify');
    if (isNetlify) {
      const localBookings = JSON.parse(localStorage.getItem('netlify_bookings') || '[]');
      const bIndex = localBookings.findIndex((b:any) => b.id === id);
      if (bIndex > -1) {
        const oldStatus = localBookings[bIndex].status;
        localBookings[bIndex].status = status;
        
        if (status === 'completed' && oldStatus !== 'completed') {
          const localFinance = JSON.parse(localStorage.getItem('netlify_finance') || '{"totalIncome":0,"totalTransactions":0}');
          localFinance.totalIncome += localBookings[bIndex].service.price || 0;
          localFinance.totalTransactions += 1;
          localStorage.setItem('netlify_finance', JSON.stringify(localFinance));
        }
        localStorage.setItem('netlify_bookings', JSON.stringify(localBookings));
      }
      fetchData();
      return;
    }

    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    fetchData(); 
  };

  if (loading) return <div className="min-h-screen text-pink-500 flex items-center justify-center font-bold text-xl tracking-widest">LOADING... [ Please Wait ]</div>;

  return (
    <div className="min-h-screen text-white p-4 md:p-8 font-mono relative">

      <div className="max-w-6xl mx-auto space-y-8 relative z-10 w-full">
        
        {/* Header Block */}
        <header className="bg-[#1a0033] border-2 border-dashed border-purple-500 p-6 shadow-[6px_6px_0px_#9333ea] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-[2px_2px_0px_#db2777]">
              ADMIN AREA
            </h1>
            <p className="text-purple-400 mt-2 text-sm">*~ Dashboard / Stats / Control ~*</p>
          </div>
          <Link href="/" className="text-purple-300 hover:text-white hover:bg-purple-600 transition-colors text-sm border-2 border-purple-500 px-4 py-2 bg-black shadow-[2px_2px_0px_#e9d5ff]">
            &lt;&lt; LOGOUT
          </Link>
        </header>

        {/* Finance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2e004f] border-2 border-pink-500 p-6 shadow-[4px_4px_0px_#db2777] hover:bg-[#3b0764] transition-colors">
            <h3 className="text-pink-300 font-bold mb-2 text-sm border-b border-dotted border-pink-500 pb-2">:: TOTAL CASH ::</h3>
            <p className="text-3xl md:text-4xl font-bold text-white drop-shadow-[1px_1px_0px_#db2777] mt-4">Rp {finance.totalIncome.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-[#2e004f] border-2 border-purple-500 p-6 shadow-[4px_4px_0px_#9333ea] hover:bg-[#3b0764] transition-colors">
            <h3 className="text-purple-300 font-bold mb-2 text-sm border-b border-dotted border-purple-500 pb-2">:: TOTAL BOOKINGS ::</h3>
            <p className="text-3xl md:text-4xl font-bold text-white drop-shadow-[1px_1px_0px_#9333ea] mt-4">{finance.totalTransactions} items</p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-black border-2 border-dashed border-pink-500 p-4 md:p-6 shadow-[6px_6px_0px_#db2777]">
          <h2 className="text-lg font-bold text-pink-400 mb-6 border-b border-solid border-pink-900 pb-2">
            *~ RECENT APPOINTMENTS ~*
          </h2>
          
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <p className="text-purple-600 text-center py-12 font-bold">No bookings found...</p>
            ) : (
              bookings.map((booking: any) => (
                <div key={booking.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-[#1a0033] border border-purple-800 hover:border-pink-500 transition-colors">
                  <div className="w-full md:w-auto mb-4 md:mb-0">
                    <p className="font-bold text-lg text-white drop-shadow-[1px_1px_0px_#db2777]">{booking.user?.name || 'GUEST'}</p>
                    <p className="text-pink-400 text-sm mt-1">
                      {booking.service?.name} | Rp {booking.service?.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-purple-500 text-xs mt-2">
                      Date: {new Date(booking.bookingDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <span className={`w-full sm:w-auto text-center px-3 py-1 text-xs font-bold border ${
                      booking.status === 'completed' ? 'bg-black text-gray-400 border-gray-600' :
                      booking.status === 'confirmed' ? 'bg-[#2e004f] text-pink-300 border-pink-500' :
                      booking.status === 'cancelled' ? 'bg-red-950 text-red-400 border-red-700' :
                      'bg-black text-purple-300 border-purple-500'
                    }`}>
                      [{booking.status}]
                    </span>
                    
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <div className="flex gap-2 w-full sm:w-auto text-xs">
                        {booking.status === 'pending' && (
                          <button onClick={() => updateStatus(booking.id, 'confirmed')} className="flex-1 sm:flex-none px-3 py-2 bg-purple-900 hover:bg-purple-700 text-white font-bold border border-purple-400 shadow-[2px_2px_0px_#e9d5ff] active:shadow-[0px_0px_0px_#e9d5ff] active:translate-y-[2px] transition-all">
                            ACCEPT
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button onClick={() => updateStatus(booking.id, 'completed')} className="flex-1 sm:flex-none px-3 py-2 bg-pink-700 hover:bg-pink-500 text-white font-bold border border-pink-400 shadow-[2px_2px_0px_#fbcfe8] active:shadow-[0px_0px_0px_#fbcfe8] active:translate-y-[2px] transition-all">
                            FINISH &amp; LOG $
                          </button>
                        )}
                        <button onClick={() => updateStatus(booking.id, 'cancelled')} className="px-3 py-2 bg-black hover:bg-red-900 text-red-500 hover:text-white font-bold border border-red-800 transition-all">
                          CANCEL
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
