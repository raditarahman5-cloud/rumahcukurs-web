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
      { id: '1', name: 'Potong Rambut', price: 35000, durationMinutes: 45, imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { id: '2', name: 'Haircut + Wash', price: 75000, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1512496015851-a1c81477759a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { id: '3', name: 'Beard Trim (Cukur Kumis/Jenggot)', price: 30000, durationMinutes: 20, imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { id: '4', name: 'Full Grooming Package', price: 120000, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
    ]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, durationMinutes, imageUrl } = body;

    const service = await prisma.service.create({
      data: {
        name,
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes, 10),
        imageUrl: imageUrl || null
      }
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
