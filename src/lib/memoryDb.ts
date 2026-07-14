import fs from 'fs';
import path from 'path';
import os from 'os';

const dbPath = path.join(os.tmpdir(), 'rumahcukurs-db.json');

function getDb() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("FS Read error:", e);
  }
  return { bookings: [], finance: [] };
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data));
  } catch (e) {
    console.error("FS Write error:", e);
  }
}

export function getMemoryBookings() {
  return getDb().bookings;
}

export function addMemoryBooking(booking: any) {
  const db = getDb();
  db.bookings.push(booking);
  saveDb(db);
}

export function updateMemoryBookingStatus(id: string, status: string) {
  const db = getDb();
  const bIndex = db.bookings.findIndex((b: any) => b.id === id);
  if (bIndex > -1) {
    const oldStatus = db.bookings[bIndex].status;
    db.bookings[bIndex].status = status;
    
    // Auto finance
    if (status === 'completed' && oldStatus !== 'completed') {
      db.finance.push({
        id: `fin-${Date.now()}`,
        bookingId: id,
        amount: db.bookings[bIndex].service.price,
        type: 'income',
        createdAt: new Date(),
        booking: db.bookings[bIndex]
      });
    }
    
    saveDb(db);
    return db.bookings[bIndex];
  }
  return null;
}

export function getMemoryFinance() {
  return getDb().finance;
}
