const express = require('express');
const session = require('express-session');
const postgres = require('postgres');
const path = require('path');
const app = express();

// 1. KONFIGURASI (Agar Gambar & CSS di file HTML kamu terbaca)
app.use(session({ secret: 'desa-wani-lumbumpetigo', resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.')); // Membaca file HTML, CSS, Gambar di folder utama

const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");

// --- 🏠 RUTE HALAMAN-HALAMAN KAMU ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'beranda.html')));
app.get('/profil', (req, res) => res.sendFile(path.join(__dirname, 'profil.html')));
app.get('/apbdes', (req, res) => res.sendFile(path.join(__dirname, 'apbdes.html')));
app.get('/galeri', (req, res) => res.sendFile(path.join(__dirname, 'galeri.html')));
app.get('/lapak', (req, res) => res.sendFile(path.join(__dirname, 'lapak.html')));
app.get('/infografis', (req, res) => res.sendFile(path.join(__dirname, 'infografis.html')));
app.get('/berita', (req, res) => res.sendFile(path.join(__dirname, 'berita.html')));
app.get('/belanja', (req, res) => res.sendFile(path.join(__dirname, 'belanja.html')));
app.get('/ppid', (req, res) => res.sendFile(path.join(__dirname, 'ppid.html')));
app.get('/listing', (req, res) => res.sendFile(path.join(__dirname, 'listing.html')));
app.get('/idm', (req, res) => res.sendFile(path.join(__dirname, 'idm.html')));
app.get('/kalender', (req, res) => res.sendFile(path.join(__dirname, 'kalender.html')));
app.get('/api/apbdes', (req, res) => res.sendFile(path.join(__dirname, 'apbdes.html')));
app.get('/artikel', (req, res) => res.sendFile(path.join(__dirname, 'artikel.html')));
app.get('/kontak', (req, res) => res.sendFile(path.join(__dirname, 'kontak.html')));
app.get('/digedes', (req, res) => res.sendFile(path.join(__dirname, 'digedes.html')));
app.get('/penduduk2025', (req, res) => res.sendFile(path.join(__dirname, 'penduduk2025.html')));
app.get('/banner', (req, res) => res.sendFile(path.join(__dirname, 'banner.html')));
app.get('/website-wani-lumbumpetigo', (req, res) => res.sendFile(path.join(__dirname, 'website-wani-lumbumpetigo.JPG')));



// --- 🔐 SISTEM LOGIN & ADMIN (Tetap Ada) ---
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'masuk.html'))); // Menggunakan masuk.html kamu
app.post('/login', (req, res) => {
  if (req.body.pass === "pandu123") { // Sesuaikan nama field "pass" dengan di masuk.html kamu
    req.session.isLoggedIn = true; res.redirect('/admin');
  } else { res.redirect('/login'); }
});

app.get('/admin', (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect('/login');
  res.send("<h1>⚙️ Selamat Datang di Panel Admin Desa</h1><p>Data dikelola via Neon Cloud.</p><a href='/'>Lihat Web</a>");
});

// EXPORT UNTUK VERCEL
module.exports = app;
app.listen(3000, () => console.log("🚀 SID Wani Lumbumpetigo Online!"));

// --- 📊 HALAMAN STATISTIK PENDUDUK ---
app.get('/penduduk', (req, res) => {
  // Mengirim file html penduduk yang kamu miliki
  res.sendFile(path.join(__dirname, 'infografis.html')); 
});
// --- 📡 API DATA PENDUKUNG (UNTUK HTML) ---
app.get('/api/statistik', async (req, res) => {
  try {
    const data = await sql`SELECT * FROM penduduk`;
    const totalL = data.reduce((sum, item) => sum + item.laki_laki, 0);
    const totalP = data.reduce((sum, item) => sum + item.perempuan, 0);
    res.json({ totalL, totalP, total: totalL + totalP, rincian: data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// --- 📊 API DATA APBDES ---
app.get('/api/apbdes', async (req, res) => {
  try {
    const data = await sql`SELECT * FROM apbdes ORDER BY id ASC`;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Pastikan rute halaman tetap ada
app.get('/apbdes', (req, res) => res.sendFile(path.join(__dirname, 'apbdes.html')));

