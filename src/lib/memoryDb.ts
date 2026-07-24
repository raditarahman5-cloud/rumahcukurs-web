import { getStore } from '@netlify/blobs';

// Get the blobs store
function getBlobStore() {
  // We use a site-wide global store named "rumahcukurs-db"
  return getStore("rumahcukurs-db");
}

async function getDb() {
  try {
    const store = getBlobStore();
    const data = await store.get('db', { type: 'json' });
    if (data && data.bookings && data.finance) {
      return data;
    }
  } catch (e) {
    console.error("Blobs read error:", e);
  }
  return { bookings: [], finance: [] };
}

async function saveDb(data: any) {
  try {
    const store = getBlobStore();
    await store.setJSON('db', data);
  } catch (e) {
    console.error("Blobs write error:", e);
  }
}

export async function getMemoryBookings() {
  const db = await getDb();
  return db.bookings;
}

export async function addMemoryBooking(booking: any) {
  const db = await getDb();
  db.bookings.push(booking);
  await saveDb(db);
}

export async function updateMemoryBookingStatus(id: string, status: string) {
  try {
    const db = await getDb();
    if (!Array.isArray(db.finance)) db.finance = [];
    if (!Array.isArray(db.bookings)) db.bookings = [];

    const bIndex = db.bookings.findIndex((b: any) => b.id === id);
    if (bIndex > -1) {
      const oldStatus = db.bookings[bIndex].status;
      db.bookings[bIndex].status = status;
      
      // Auto finance
      if (status === 'completed' && oldStatus !== 'completed') {
        db.finance.push({
          id: `fin-${Date.now()}`,
          bookingId: id,
          amount: db.bookings[bIndex].service?.price || 0,
          type: 'income',
          createdAt: new Date(),
          booking: db.bookings[bIndex]
        });
      }
      
      await saveDb(db);
      return db.bookings[bIndex];
    }
  } catch (e) {
    console.error("Update status blobs db error:", e);
  }
  return null;
}

export async function getMemoryFinance() {
  const db = await getDb();
  return db.finance;
}
