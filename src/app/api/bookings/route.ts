import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Ideally, we'd extract user session here to filter by user or return all for admin
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let whereClause = {};
    if (userId) {
      whereClause = { userId };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: [
        { bookingDate: 'desc' }
      ]
    });
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, serviceId, bookingDate, customerName } = body;

    let finalUserId = userId;

    if (!finalUserId && customerName) {
      // Auto-generate a dummy email since email is required in the Prisma schema
      const dummyEmail = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}@guest.local`;
      
      const user = await prisma.user.create({
        data: {
          name: customerName,
          email: dummyEmail,
          password: 'guestpassword',
          role: 'customer'
        }
      });
      
      finalUserId = user.id;
    }

    if (!finalUserId) {
      return NextResponse.json({ error: 'Missing user information' }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: finalUserId,
        serviceId,
        bookingDate: new Date(bookingDate),
        status: 'pending'
      }
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
