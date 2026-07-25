import { NextResponse } from 'next/server';
import { getMemorySettings, updateMemorySettings } from '@/lib/memoryDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getMemorySettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateMemorySettings({
      openTime: body.openTime,
      closeTime: body.closeTime
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
