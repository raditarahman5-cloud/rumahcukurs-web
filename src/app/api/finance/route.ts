import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // API Khusus Admin: Menampilkan seluruh rekap keuangan
    const records = await prisma.financialRecord.findMany({
      include: {
        booking: {
          include: {
            service: true,
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Menghitung Total Pendapatan
    const totalIncome = records
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + record.amount, 0);

    return NextResponse.json({
      records,
      summary: {
        totalIncome,
        totalTransactions: records.length
      }
    });
  } catch (error) {
    console.error('Error fetching financial records:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
