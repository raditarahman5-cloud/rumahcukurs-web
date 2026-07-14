# Struktur Proyek Sistem Booking Barbershop ("Rumah Cukurs")

Dokumen ini mendefinisikan struktur dasar, arsitektur, fitur, dan desain basis data untuk proyek sistem booking barbershop dengan fitur pencatatan keuangan otomatis, **yang dioptimalkan untuk hosting di Netlify**.

## 1. Teknologi yang Direkomendasikan (Netlify-Ready)
Netlify sangat optimal untuk arsitektur *Jamstack* (JavaScript, API, dan Markup). Karena Netlify tidak mendukung PHP (seperti Laravel) secara bawaan untuk backend-nya, kita akan menggunakan *modern stack* berikut:

- **Framework**: **Next.js (React)** - Sangat sempurna untuk Netlify karena Netlify mendukung fitur Serverless Functions (API Routes) dari Next.js.
- **Styling**: **Tailwind CSS** - Untuk antarmuka UI/UX yang modern, premium, dan responsif.
- **Backend (Database & Auth)**: **Supabase** (PostgreSQL) atau **Firebase**. 
  - *Rekomendasi kuat: Supabase*, karena ini adalah database relasional (SQL) yang memiliki fitur **Database Triggers**. Sangat cocok untuk menjalankan logika "Pencatatan Keuangan Otomatis" tanpa memberatkan server.
- **ORM**: **Prisma** (Opsional, jika ingin mengelola skema database langsung dari kode Next.js).

## 2. Fitur Utama berdasarkan Role

### 🤵 Role: Pelanggan (Customer)
- **Registrasi & Login**: Membuat akun pengguna (menggunakan fitur Auth bawaan Supabase/NextAuth).
- **Pilih Layanan & Waktu**: Melihat daftar layanan dan slot waktu yang tersedia.
- **Manajemen Booking**: Melihat status booking (Menunggu, Disetujui, Selesai) dan riwayat.

### 👨‍💼 Role: Admin (Pemilik Barbershop)
- **Dashboard Pintar**: Ringkasan jadwal potong hari ini dan grafik total pendapatan bulanan.
- **Manajemen Booking**: Menyetujui, membatalkan, atau menyelesaikan jadwal masuk.
- **Manajemen Layanan**: Menambah atau mengubah harga layanan.
- **Pencatatan Uang Otomatis (Auto-Finance)**: 
  - Saat admin menekan tombol **"Selesai"** pada sebuah booking, sistem secara *otomatis* akan merekam pendapatan ke dalam pembukuan berdasarkan harga layanan tersebut.
  - Admin tidak perlu mencatat transaksi satu per satu.

## 3. Desain Basis Data (Database Schema - PostgreSQL)

Kita menggunakan 4 tabel utama:

1. **`users`**
   - `id`, `name`, `email`, `role` (enum: 'admin', 'customer')
2. **`services`**
   - `id`, `name` (misal: Premium Haircut), `price` (harga), `duration_minutes` (durasi)
3. **`bookings`**
   - `id`, `user_id`, `service_id`, `booking_date`, `booking_time`, `status` (enum: 'pending', 'confirmed', 'completed', 'cancelled')
4. **`financial_records`**
   - `id`, `booking_id`, `amount`, `type` (enum: 'income', 'expense'), `created_at`

*Logic Otomasi Keuangan*: Kita akan menggunakan **PostgreSQL Trigger** di Supabase (atau API Route Next.js). Saat status di tabel `bookings` berubah menjadi `completed`, trigger otomatis berjalan untuk melakukan `INSERT` data sebesar `price` layanan ke dalam tabel `financial_records`.

## 4. Struktur Folder & Arsitektur (Next.js)

```text
RumahCukurs/
├── src/
│   ├── app/                    # Next.js App Router (Halaman Web)
│   │   ├── (auth)/             # Grup halaman login & register
│   │   ├── admin/              # Halaman Dashboard Admin
│   │   │   ├── dashboard/
│   │   │   ├── bookings/
│   │   │   └── finance/
│   │   ├── customer/           # Halaman Dashboard Pelanggan
│   │   ├── api/                # Backend API Routes (Serverless Functions untuk Netlify)
│   │   │   ├── bookings/
│   │   │   └── services/
│   │   └── page.tsx            # Landing page utama
│   ├── components/             # Reusable UI Components
│   │   ├── ui/                 # Tombol, Input, Modal, dll
│   │   └── layouts/            # Sidebar, Navbar
│   └── lib/                    # Konfigurasi Supabase / Prisma client
├── public/                     # Gambar dan aset statis
├── tailwind.config.ts          # Konfigurasi styling
└── package.json
```

## 5. Langkah-langkah Pembuatan (Action Plan)

1. **Inisiasi Proyek**: Menjalankan perintah `npx create-next-app@latest` untuk setup Next.js + Tailwind CSS.
2. **Setup Database**: Membuat proyek di Supabase, menjalankan tabel skema, dan membuat *Database Trigger* untuk keuangan.
3. **Pembuatan Komponen UI**: Mendesain tampilan Admin dan Customer.
4. **Integrasi Backend**: Menghubungkan fungsi Login, Booking, dan Dashboard ke database.
5. **Deployment**: Push kode ke GitHub, lalu hubungkan ke Netlify untuk *auto-deployment* secara gratis.
