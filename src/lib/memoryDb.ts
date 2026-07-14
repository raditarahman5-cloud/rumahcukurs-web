import fs from 'fs';
import path from 'path';
import os from 'os';

const dbPath = path.join(os.tmpdir(), 'rumahcukurs-db.json');

function getDb() {
  let db = { bookings: [], finance: [] };
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed.bookings)) db.bookings = parsed.bookings;
      if (Array.isArray(parsed.finance)) db.finance = parsed.finance;
    }
  } catch (e) {
    console.error("FS Read error:", e);
  }
  return db;
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
  try {
    const db = getDb();
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
      
      saveDb(db);
      return db.bookings[bIndex];
    }
  } catch (e) {
    console.error("Update status memory db error:", e);
  }
  return null;
}

export function getMemoryFinance() {
  return getDb().finance;
}
