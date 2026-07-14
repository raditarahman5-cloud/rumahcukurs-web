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
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
