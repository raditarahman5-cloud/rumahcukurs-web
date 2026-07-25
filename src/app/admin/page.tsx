"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [finance, setFinance] = useState({ totalIncome: 0, totalTransactions: 0 });
  const [settings, setSettings] = useState({ openTime: '09:00', closeTime: '21:00' });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{isOpen: boolean, title: string, message: string, isConfirm: boolean, onConfirm?: () => void}>({isOpen: false, title: '', message: '', isConfirm: false});

  const showAlert = (title: string, message: string) => setModal({ isOpen: true, title, message, isConfirm: false });
  const showConfirm = (title: string, message: string, onConfirm: () => void) => setModal({ isOpen: true, title, message, isConfirm: true, onConfirm });

  const fetchData = async () => {
    try {
      const [bookingsRes, financeRes, settingsRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/finance"),
        fetch("/api/settings")
      ]);
      const bookingsData = await bookingsRes.json();
      const financeData = await financeRes.json();
      const settingsData = await settingsRes.json();
      
      if(Array.isArray(bookingsData)) setBookings(bookingsData);
      if(financeData.summary) setFinance(financeData.summary);
      if(settingsData) setSettings(settingsData);
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
    // Optimistic UI Update to hide Netlify Blobs latency
    setBookings(prev => {
      const newBookings = [...prev];
      const bIndex = newBookings.findIndex(b => b.id === id);
      if (bIndex > -1) {
        const oldStatus = newBookings[bIndex].status;
        newBookings[bIndex].status = status;
        
        if (status === 'completed' && oldStatus !== 'completed') {
          setFinance(f => ({
            totalIncome: f.totalIncome + (newBookings[bIndex].service?.price || 0),
            totalTransactions: f.totalTransactions + 1
          }));
        }
      }
      return newBookings;
    });

    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      // Optionally fetch data again, but optimistic update covers it for immediate feedback
      // fetchData(); 
    } catch (e) {
      console.error(e);
      fetchData(); // revert on error
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      showAlert('Sukses', 'Pengaturan waktu berhasil disimpan.');
    } catch (e) {
      console.error(e);
      showAlert('Gagal', 'Terjadi kesalahan saat menyimpan pengaturan.');
    }
  };

  const handleResetQueue = () => {
    showConfirm(
      'Reset Antrian?', 
      'Apakah Anda yakin ingin mereset antrian hari ini? Transaksi yang sudah selesai akan tetap tersimpan di riwayat laporan.',
      async () => {
        try {
          await fetch('/api/bookings/reset', { method: 'POST' });
          setBookings([]);
          showAlert('Sukses', 'Antrian berhasil direset.');
        } catch (e) {
          console.error(e);
          showAlert('Gagal', 'Terjadi kesalahan saat mereset antrian.');
        }
      }
    );
  };

  if (loading) return <div className="min-h-screen text-pink-500 flex items-center justify-center font-bold text-xl tracking-widest">Memuat Data...</div>;

  return (
    <div className="min-h-screen text-white p-4 md:p-8 font-mono relative">

      <div className="max-w-6xl mx-auto space-y-8 relative z-10 w-full">
        
        {/* Header Block */}
        <header className="bg-[#1a0033] border-2 border-dashed border-purple-500 p-6 shadow-[6px_6px_0px_#9333ea] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-[2px_2px_0px_#db2777]">
              Dashboard Admin
            </h1>
            <p className="text-purple-400 mt-2 text-sm">Control Panel</p>
          </div>
          <Link href="/" className="text-purple-300 hover:text-white hover:bg-purple-600 transition-colors text-sm border-2 border-purple-500 px-4 py-2 bg-black shadow-[2px_2px_0px_#e9d5ff]">
            &lt;&lt; LOGOUT
          </Link>
        </header>

        {/* Finance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2e004f] border-2 border-pink-500 p-6 shadow-[4px_4px_0px_#db2777] hover:bg-[#3b0764] transition-colors">
            <h3 className="text-pink-300 font-bold mb-2 text-sm border-b border-dotted border-pink-500 pb-2">Total Pendapatan</h3>
            <p className="text-3xl md:text-4xl font-bold text-white drop-shadow-[1px_1px_0px_#db2777] mt-4">Rp {finance.totalIncome.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-[#2e004f] border-2 border-purple-500 p-6 shadow-[4px_4px_0px_#9333ea] hover:bg-[#3b0764] transition-colors">
            <h3 className="text-purple-300 font-bold mb-2 text-sm border-b border-dotted border-purple-500 pb-2">Total Transaksi</h3>
            <p className="text-3xl md:text-4xl font-bold text-white drop-shadow-[1px_1px_0px_#9333ea] mt-4">{finance.totalTransactions} Transaksi</p>
          </div>
        </div>

        {/* Settings Block */}
        <div className="bg-black border-2 border-dashed border-purple-500 p-4 md:p-6 shadow-[6px_6px_0px_#9333ea] flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1">
            <label className="block text-purple-300 font-bold mb-2 text-sm">Jam Buka</label>
            <input 
              type="time" 
              value={settings.openTime} 
              onChange={e => setSettings({...settings, openTime: e.target.value})} 
              className="w-full p-2 bg-[#1a0033] border border-purple-500 text-white focus:outline-none focus:bg-purple-900 transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-purple-300 font-bold mb-2 text-sm">Jam Tutup</label>
            <input 
              type="time" 
              value={settings.closeTime} 
              onChange={e => setSettings({...settings, closeTime: e.target.value})} 
              className="w-full p-2 bg-[#1a0033] border border-purple-500 text-white focus:outline-none focus:bg-purple-900 transition-colors"
            />
          </div>
          <button 
            onClick={handleUpdateSettings} 
            className="w-full md:w-auto px-6 py-2 h-[42px] bg-purple-700 hover:bg-purple-500 text-white font-bold border border-purple-400 shadow-[2px_2px_0px_#e9d5ff] active:shadow-[0px_0px_0px_#e9d5ff] active:translate-y-[2px] transition-all"
          >
            SAVE SETTINGS
          </button>
        </div>

        {/* Bookings List */}
        <div className="bg-black border-2 border-dashed border-pink-500 p-4 md:p-6 shadow-[6px_6px_0px_#db2777]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-solid border-pink-900 pb-4 mb-6">
            <h2 className="text-lg font-bold text-pink-400">
              Daftar Antrian
            </h2>
            <button 
              onClick={handleResetQueue} 
              className="mt-4 md:mt-0 px-4 py-2 bg-red-900 hover:bg-red-700 text-white font-bold border border-red-500 shadow-[2px_2px_0px_#fca5a5] active:shadow-[0px_0px_0px_#fca5a5] active:translate-y-[2px] transition-all text-sm"
            >
              RESET QUEUE
            </button>
          </div>
          
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
                            Selesai
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

      {/* Custom Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#1a0033] border-2 border-pink-500 p-6 shadow-[8px_8px_0px_#db2777] max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-pink-800 pb-2">{modal.title}</h3>
            <p className="text-pink-100 mb-6">{modal.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="px-4 py-2 bg-black text-white font-bold border border-gray-600 hover:bg-gray-800 transition-colors"
              >
                Tutup
              </button>
              {modal.isConfirm && (
                <button 
                  onClick={() => {
                    if (modal.onConfirm) modal.onConfirm();
                    setModal({ ...modal, isOpen: false });
                  }}
                  className="px-4 py-2 bg-pink-700 hover:bg-pink-500 text-white font-bold border border-pink-400 shadow-[2px_2px_0px_#fbcfe8] active:shadow-[0px_0px_0px_#fbcfe8] active:translate-y-[2px] transition-all"
                >
                  Konfirmasi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
