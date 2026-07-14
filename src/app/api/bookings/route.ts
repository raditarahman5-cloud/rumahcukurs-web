import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Netlify Memory Fallback (resets on cold start)
const memoryBookings: any[] = [];

export async function GET(request: Request) {
  try {
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
    console.error('Prisma Error (likely Netlify SQLite issue), using fallback:', error);
    return NextResponse.json(memoryBookings.sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()));
  }
}

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch(e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
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
    console.error('Prisma Error (likely Netlify SQLite issue), using fallback:', error);
    
    // Add to memory fallback
    const newBooking = {
      id: `mem-${Date.now()}`,
      userId: body.userId || `guest-${Date.now()}`,
      user: { name: body.customerName || 'GUEST' },
      serviceId: body.serviceId,
      service: {
        name: body.serviceId === '1' ? 'Premium Haircut' : body.serviceId === '2' ? 'Haircut + Wash' : body.serviceId === '3' ? 'Beard Trim' : 'Grooming',
        price: body.serviceId === '1' ? 60000 : body.serviceId === '2' ? 75000 : body.serviceId === '3' ? 30000 : 120000
      },
      bookingDate: new Date(body.bookingDate),
      status: 'pending'
    };
    memoryBookings.push(newBooking);
    
    return NextResponse.json(newBooking, { status: 201 });
  }
}
