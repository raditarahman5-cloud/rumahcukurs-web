import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resetMemoryBookings } from '@/lib/memoryDb';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Attempt to delete from Prisma (if it works)
    try {
      await prisma.booking.deleteMany({});
    } catch (e) {
      console.warn('Prisma reset skipped, using memory fallback', e);
    }

    // Reset memory DB
    await resetMemoryBookings();
    
    return NextResponse.json({ success: true, message: "Queue resetted" });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Failed to reset queue' }, { status: 500 });
  }
}
