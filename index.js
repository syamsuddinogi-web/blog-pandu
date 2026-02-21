const express = require('express');
const path = require('path');
const postgres = require('postgres');
const app = express();

// 1. KONEKSI DATABASE (Langsung Tembak)
const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");

// 2. MIDDLEWARE DASAR
app.use(express.static('.'));

// --- 🏠 HALAMAN UTAMA ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'beranda.html')));
app.get('/infografis', (req, res) => res.sendFile(path.join(__dirname, 'infografis.html')));
app.get('/apbdes', (req, res) => res.sendFile(path.join(__dirname, 'apbdes.html')));

// --- 📡 API PENDUDUK (ANTI CRASH) ---
app.get('/api/penduduk', async (req, res) => {
  try {
    const data = await sql`SELECT * FROM penduduk ORDER BY id ASC`;
    res.json(data);
  } catch (err) {
    res.json([{ nama_dusun: "Error Database", laki_laki: 0, perempuan: 0 }]);
  }
});

// --- 📡 API APBDES ---
app.get('/api/apbdes', async (req, res) => {
  try {
    const data = await sql`SELECT * FROM apbdes ORDER BY id ASC`;
    res.json(data);
  } catch (err) {
    res.json([]);
  }
});

// PENTING: Untuk Vercel, cukup export app saja
module.exports = app;
