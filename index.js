const express = require('express');
const session = require('express-session');
const postgres = require('postgres');
const path = require('path');
const app = express();

// 1. KONFIGURASI DASAR
app.use(session({ secret: 'desa-wani-lumbumpetigo', resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// 2. KONEKSI NEON (Pastikan URL ini benar)
const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");

// --- 🏠 HALAMAN UTAMA (HTML KAMU) ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'beranda.html')));
app.get('/infografis', (req, res) => res.sendFile(path.join(__dirname, 'infografis.html')));
app.get('/apbdes', (req, res) => res.sendFile(path.join(__dirname, 'apbdes.html')));

// --- 📡 API DATA PENDUDUK (DARI EXCEL) ---
app.get('/api/penduduk', async (req, res) => {
  try {
    const data = await sql`SELECT * FROM penduduk ORDER BY id ASC`;
    const cleanData = data.map(d => ({
      id: d.id,
      nama_dusun: d.nama_dusun || "Dusun",
      jumlah_kk: Number(d.jumlah_kk || 0),
      laki_laki: Number(d.laki_laki || 0),
      perempuan: Number(d.perempuan || 0)
    }));
    res.status(200).json(cleanData);
  } catch (err) {
    console.error("Error Database:", err.message);
    res.status(200).json([]); // Kirim data kosong agar TIDAK CRASH
  }
});

// --- 📡 API DATA APBDES ---
app.get('/api/apbdes', async (req, res) => {
  try {
    const data = await sql`SELECT * FROM apbdes ORDER BY id ASC`;
    res.status(200).json(data);
  } catch (err) {
    res.status(200).json([]);
  }
});

// EXPORT UNTUK VERCEL
module.exports = app;
// app.listen(3000); // Matikan listen di Vercel agar tidak bentrok
