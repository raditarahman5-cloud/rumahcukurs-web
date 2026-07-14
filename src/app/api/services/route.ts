import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Prisma Error (likely Netlify SQLite issue), using fallback:', error);
    return NextResponse.json([
      { id: '1', name: 'Premium Haircut', price: 60000, durationMinutes: 45 },
      { id: '2', name: 'Haircut + Wash', price: 75000, durationMinutes: 60 },
      { id: '3', name: 'Beard Trim (Cukur Kumis/Jenggot)', price: 30000, durationMinutes: 20 },
      { id: '4', name: 'Full Grooming Package', price: 120000, durationMinutes: 90 }
    ]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, durationMinutes } = body;

    const service = await prisma.service.create({
      data: {
        name,
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes, 10),
      }
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
