import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let body: any = {};
  try {
    body = await request.json();
  } catch(e) {}

  let routeId = '';
  try {
    const resolvedParams = await params;
    routeId = resolvedParams.id;
  } catch(e) {}

  try {
    const { status } = body;

    // Ambil data booking beserta layanannya untuk tahu harga
    const booking = await prisma.booking.findUnique({
      where: { id: routeId },
      include: { service: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update status booking
    const updatedBooking = await prisma.booking.update({
      where: { id: routeId },
      data: { status },
    });

    // --- LOGIKA PENCATATAN KEUANGAN OTOMATIS (AUTO-FINANCE) ---
    // Jika admin mengubah status menjadi 'completed' dan status sebelumnya bukan 'completed'
    if (status === 'completed' && booking.status !== 'completed') {
      
      // Pastikan belum ada rekaman keuangan untuk booking ini (mencegah double entry)
      const existingRecord = await prisma.financialRecord.findUnique({
        where: { bookingId: routeId },
      });

      if (!existingRecord) {
        await prisma.financialRecord.create({
          data: {
            bookingId: routeId,
            amount: booking.service.price,
            type: 'income',
          },
        });
      }
    }

    // Jika dibatalkan (cancelled), mungkin kita ingin menghapus catatan keuangan jika sudah terlanjur dibuat
    if (status === 'cancelled') {
       const existingRecord = await prisma.financialRecord.findUnique({
        where: { bookingId: routeId },
      });
      if (existingRecord) {
         await prisma.financialRecord.delete({ where: { bookingId: routeId } });
      }
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Prisma Error (likely Netlify SQLite issue), using fallback:', error);
    
    const { updateMemoryBookingStatus } = require('@/lib/memoryDb');
    
    // Gunakan ID dari parameter atau jika gagal coba ekstrak dari URL
    let memId = routeId;
    if (!memId) {
      const urlParts = request.url.split('/');
      memId = urlParts[urlParts.length - 1];
    }
    
    const status = body.status || 'confirmed';
    
    const updated = await updateMemoryBookingStatus(memId, status);
    if (updated) {
      return NextResponse.json(updated);
    }
    
    return NextResponse.json({ error: 'Not found in memory' }, { status: 404 });
  }
}
