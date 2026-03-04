const express = require('express');
const session = require('express-session');
const postgres = require('postgres');
const path = require('path');
const multer = require('multer');

const app = express();

// 1. KONFIGURASI MIDDLEWARE
app.use(session({ 
  secret: 'desa-wani-lumbumpetigo', 
  resave: false, 
  saveUninitialized: true 
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// PENTING: ../ agar bisa membaca CSS/Gambar di folder utama (di luar folder api)
app.use(express.static(path.join(__dirname, '..')));

// Konfigurasi Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Database Connection
const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");

// --- 📡 API DATA ---
app.get('/api/statistik', async (req, res) => {
  try {
    const data = await sql`SELECT * FROM penduduk`;
    const totalL = data.reduce((sum, item) => sum + (item.laki_laki || 0), 0);
    const totalP = data.reduce((sum, item) => sum + (item.perempuan || 0), 0);
    res.json({ totalL, totalP, total: totalL + totalP, rincian: data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 📤 RUTE UPLOAD PDF ---
app.post('/upload-pdf', upload.single('file_pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("Tidak ada file yang dipilih.");
    res.send(`Berhasil menerima file: ${req.file.originalname}.`);
  } catch (err) {
    res.status(500).send("Gagal upload: " + err.message);
  }
});

// --- 🏠 RUTE HALAMAN UTAMA (Ditambahkan ../ agar naik 1 folder) ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../beranda.html')));
app.get('/profil', (req, res) => res.sendFile(path.join(__dirname, '../profil.html')));
app.get('/apbdes', (req, res) => res.sendFile(path.join(__dirname, '../apbdes.html')));
app.get('/infografis', (req, res) => res.sendFile(path.join(__dirname, '../infografis.html')));
app.get('/input', (req, res) => res.sendFile(path.join(__dirname, '../input.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../masuk.html')));

// --- 📄 RUTE KHUSUS PDF ---
app.get('/jumlah-dan-persentase-penduduk.pdf', (req, res) => {
  const filePath = path.join(__dirname, '../jumlah-dan-persentase-penduduk.pdf');
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send("File PDF tidak ditemukan.");
  });
});

// --- 🔐 SISTEM LOGIN ---
app.post('/login', (req, res) => {
  if (req.body.pass === "pandu123") {
    req.session.isLoggedIn = true;
    res.redirect('/admin');
  } else { res.redirect('/login'); }
});

app.get('/admin', (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect('/login');
  res.send("<h1>⚙️ Admin Desa</h1><a href='/'>Kembali ke Web</a>");
});

// EXPORT UNTUK VERCEL
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log("🚀 SID Online di http://localhost:3000"));
}
