import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Ambil data booking beserta layanannya untuk tahu harga
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update status booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    // --- LOGIKA PENCATATAN KEUANGAN OTOMATIS (AUTO-FINANCE) ---
    // Jika admin mengubah status menjadi 'completed' dan status sebelumnya bukan 'completed'
    if (status === 'completed' && booking.status !== 'completed') {
      
      // Pastikan belum ada rekaman keuangan untuk booking ini (mencegah double entry)
      const existingRecord = await prisma.financialRecord.findUnique({
        where: { bookingId: id },
      });

      if (!existingRecord) {
        await prisma.financialRecord.create({
          data: {
            bookingId: id,
            amount: booking.service.price,
            type: 'income',
          },
        });
      }
    }

    // Jika dibatalkan (cancelled), mungkin kita ingin menghapus catatan keuangan jika sudah terlanjur dibuat
    if (status === 'cancelled') {
       const existingRecord = await prisma.financialRecord.findUnique({
        where: { bookingId: id },
      });
      if (existingRecord) {
         await prisma.financialRecord.delete({ where: { bookingId: id } });
      }
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Prisma Error (likely Netlify SQLite issue), using fallback:', error);
    
    // Memory Fallback Logic
    const { memoryBookings, memoryFinanceRecords } = require('@/lib/memoryDb');
    // Using simple substring to avoid parsing again if we need id and status
    const urlParts = request.url.split('/');
    const memId = urlParts[urlParts.length - 1]; // id from url
    
    // Try to get status from cloned request, safely
    let status = 'confirmed';
    try {
      const cloned = await request.clone().json();
      if (cloned.status) status = cloned.status;
    } catch(e) {}
    
    const bIndex = memoryBookings.findIndex((b: any) => b.id === memId);
    if (bIndex > -1) {
      const oldStatus = memoryBookings[bIndex].status;
      memoryBookings[bIndex].status = status;
      
      // Auto-finance mock
      if (status === 'completed' && oldStatus !== 'completed') {
         memoryFinanceRecords.push({
           id: `fin-${Date.now()}`,
           bookingId: memId,
           amount: memoryBookings[bIndex].service.price,
           type: 'income',
           createdAt: new Date(),
           booking: memoryBookings[bIndex]
         });
      }
      return NextResponse.json(memoryBookings[bIndex]);
    }
    return NextResponse.json({ error: 'Not found in memory' }, { status: 404 });
  }
}
