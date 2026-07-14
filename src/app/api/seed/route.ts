import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Buat Demo User jika belum ada
    let user = await prisma.user.findFirst({ where: { email: 'demo@rumahcukur.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'demo-user-id',
          name: 'Budi Pelanggan',
          email: 'demo@rumahcukur.com',
          password: 'password123',
          role: 'customer'
        }
      });
    }

    // 2. Buat Demo Services jika masih kosong
    const serviceCount = await prisma.service.count();
    if (serviceCount === 0) {
      await prisma.service.createMany({
        data: [
          { name: 'Premium Haircut', price: 60000, durationMinutes: 45 },
          { name: 'Haircut + Wash', price: 75000, durationMinutes: 60 },
          { name: 'Beard Trim (Cukur Kumis/Jenggot)', price: 30000, durationMinutes: 20 },
          { name: 'Full Grooming Package', price: 120000, durationMinutes: 90 },
        ]
      });
    }

    return NextResponse.json({ message: 'Seeding success!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
