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

// Membaca file statis (HTML, CSS, JS, Gambar, PDF) langsung dari folder utama
app.use(express.static(path.join(__dirname, '.')));

// Konfigurasi Multer untuk Upload (Simpan di RAM/Memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Database Connection
const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");

// --- 📡 API DATA (Letakkan di atas rute statis) ---
app.get('/api/statistik', async (req, res) => {
  try {
    const data = await sql`SELECT * FROM penduduk`;
    const totalL = data.reduce((sum, item) => sum + (item.laki_laki || 0), 0);
    const totalP = data.reduce((sum, item) => sum + (item.perempuan || 0), 0);
    res.json({ totalL, totalP, total: totalL + totalP, rincian: data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/apbdes', async (req, res) => {
  try {
    const data = await sql`SELECT * FROM apbdes ORDER BY id ASC`;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 📤 RUTE UPLOAD PDF ---
app.post('/upload-pdf', upload.single('file_pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("Tidak ada file yang dipilih.");
    
    // Logika simpan ke database atau Vercel Blob bisa ditaruh di sini
    console.log("Diterima:", req.file.originalname);
    
    res.send(`Berhasil menerima file: ${req.file.originalname}. (Catatan: File disimpan sementara di memori)`);
  } catch (err) {
    res.status(500).send("Gagal upload: " + err.message);
  }
});

// --- 🏠 RUTE HALAMAN UTAMA ---
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
app.get('/artikel', (req, res) => res.sendFile(path.join(__dirname, 'artikel.html')));
app.get('/kontak', (req, res) => res.sendFile(path.join(__dirname, 'kontak.html')));
app.get('/digedes', (req, res) => res.sendFile(path.join(__dirname, 'digedes.html')));
app.get('/penduduk2025', (req, res) => res.sendFile(path.join(__dirname, 'penduduk2025.html')));
app.get('/pagu', (req, res) => res.sendFile(path.join(__dirname, 'pagu.html')));
app.get('/input', (req, res) => res.sendFile(path.join(__dirname, 'input.html')));
app.get('/nik', (req, res) => res.sendFile(path.join(__dirname, 'nik.html')));
app.get('/data', (req, res) => res.sendFile(path.join(__dirname, 'data.html')));
app.get('/penduduk', (req, res) => res.sendFile(path.join(__dirname, 'infografis.html')));

// --- 📄 RUTE KHUSUS PDF (Dengan Proteksi Error) ---
app.get('/jumlah-dan-persentase-penduduk.pdf', (req, res) => {
  const filePath = path.join(__dirname, 'jumlah-dan-persentase-penduduk.pdf');
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("File PDF tidak ditemukan di server. Pastikan file sudah di-upload ke folder utama.");
    }
  });
});

// --- 🔐 SISTEM LOGIN ---
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'masuk.html')));
app.post('/login', (req, res) => {
  if (req.body.pass === "pandu123") {
    req.session.isLoggedIn = true;
    res.redirect('/admin');
  } else {
    res.redirect('/login');
  }
});

app.get('/admin', (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect('/login');
  res.send("<h1>⚙️ Admin Desa</h1><p>Data dikelola via Neon Cloud.</p><a href='/'>Kembali ke Web</a>");
});

// EXPORT UNTUK VERCEL
module.exports = app;

// Jalankan server jika di lokal
if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log("🚀 SID Online di http://localhost:3000"));
}
