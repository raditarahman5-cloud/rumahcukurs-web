"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CustomerDashboard() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetch("/api/seed").then(() => {
      fetch("/api/services")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setServices(data);
          setLoading(false);
        });
    });
  }, []);

  const handleBook = async (serviceId: string) => {
    if (!customerName) {
      setMessage({ text: "> ERROR: Enter your name first...", type: "error" });
      return;
    }
    if (!bookingDate) {
      setMessage({ text: "> ERROR: Time is an illusion, but I still need a date...", type: "error" });
      return;
    }
    
    setMessage(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        serviceId,
        bookingDate: bookingDate.toISOString()
      })
    });

    if (res.ok) {
      setMessage({ text: "> SUCCESS: Booking sent! See you soon <3", type: "success" });
      setBookingDate(null);
      setCustomerName("");
    } else {
      setMessage({ text: "> ERROR: Something went wrong x_x", type: "error" });
    }
  };

  if (loading) return <div className="min-h-screen text-pink-500 flex items-center justify-center text-xl tracking-widest font-bold">LOADING... [ Please Wait ]</div>;

  return (
    <div className="min-h-screen text-white p-4 md:p-8 relative">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10 w-full">
        
        {/* Header Block */}
        <header className="bg-[#1a0033] border-2 border-dashed border-pink-500 p-6 shadow-[6px_6px_0px_#db2777] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[2px_2px_0px_#db2777]">
              BOOKING
            </h1>
            <p className="text-pink-400 mt-2 text-sm">*~ Set your appointment ~*</p>
          </div>
          <Link href="/" className="text-pink-300 hover:text-white hover:bg-pink-600 transition-colors text-sm border-2 border-pink-500 px-4 py-2 bg-[#2e004f] shadow-[2px_2px_0px_#fbcfe8]">
            &lt;&lt; BACK
          </Link>
        </header>

        {/* Message Block */}
        {message && (
          <div className={`p-4 font-bold tracking-wider flex items-center gap-3 border-2 shadow-[4px_4px_0px_#000] ${
            message.type === 'success' 
            ? 'bg-purple-900 border-green-400 text-green-300' 
            : 'bg-black border-red-500 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          {/* Form Panel */}
          <div className="space-y-8">
            <div className="bg-[#2e004f] border-2 border-pink-500 p-6 shadow-[4px_4px_0px_#db2777]">
              <label className="block text-pink-300 font-bold mb-4 border-b border-dotted border-pink-500 pb-2">
                [1] YOUR NAME
              </label>
              <input 
                type="text" 
                placeholder="type here..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-3 bg-[#1a0033] border border-pink-500 text-white focus:outline-none focus:bg-pink-950 transition-colors placeholder:text-purple-700"
              />
            </div>

            <div className="bg-[#2e004f] border-2 border-pink-500 p-6 shadow-[4px_4px_0px_#db2777] relative z-50">
              <label className="block text-pink-300 font-bold mb-4 border-b border-dotted border-pink-500 pb-2">
                [2] WHEN
              </label>
              <DatePicker 
                selected={bookingDate}
                onChange={(date: Date | null) => setBookingDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="d MMMM yyyy - HH:mm"
                placeholderText="select a date..."
                className="w-full p-3 bg-[#1a0033] border border-pink-500 text-white focus:outline-none focus:bg-pink-950 transition-colors cursor-pointer placeholder:text-purple-700"
                wrapperClassName="w-full"
                withPortal
              />
            </div>
          </div>

          {/* Services Panel */}
          <div className="bg-[#1a0033] border-2 border-dashed border-purple-500 p-6 shadow-[4px_4px_0px_#9333ea]">
            <label className="block text-purple-300 font-bold mb-4 border-b border-dotted border-purple-500 pb-2">
              [3] CHOOSE STYLE
            </label>
            <div className="space-y-4">
              {services.map((service: any) => (
                <div key={service.id} className="bg-black border border-purple-800 p-4 hover:border-pink-500 hover:bg-[#2e004f] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white drop-shadow-[1px_1px_0px_#db2777]">{service.name}</h3>
                      <p className="text-purple-400 text-sm mt-1">
                        time: {service.durationMinutes} mins
                      </p>
                    </div>
                    <div className="text-pink-400 font-bold bg-[#1a0033] px-2 py-1 border border-pink-900">
                      Rp {service.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleBook(service.id)}
                    className="w-full py-2 bg-pink-700 hover:bg-pink-500 text-white font-bold border border-pink-400 shadow-[2px_2px_0px_#fbcfe8] active:shadow-[0px_0px_0px_#fbcfe8] active:translate-y-[2px] transition-all"
                  >
                    CONFIRM &gt;&gt;
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
