import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let body: any = {};
  try {
    body = await request.json();
  } catch(e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let routeId = '';
  try {
    const resolvedParams = await params;
    routeId = resolvedParams.id;
  } catch(e) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  try {
    const { name, price, durationMinutes, imageUrl } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (price !== undefined) dataToUpdate.price = Number(price);
    if (durationMinutes !== undefined) dataToUpdate.durationMinutes = Number(durationMinutes);
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;

    const updatedService = await prisma.service.upsert({
      where: { id: routeId },
      update: dataToUpdate,
      create: {
        id: routeId,
        name: dataToUpdate.name || 'Unknown',
        price: dataToUpdate.price || 0,
        durationMinutes: dataToUpdate.durationMinutes || 0,
        imageUrl: dataToUpdate.imageUrl || null,
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let routeId = '';
  try {
    const resolvedParams = await params;
    routeId = resolvedParams.id;
  } catch(e) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  try {
    await prisma.service.delete({
      where: { id: routeId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Gagal menghapus layanan. Pastikan tidak ada transaksi yang terkait.' }, { status: 500 });
  }
}
