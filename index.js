const express = require('express');
const session = require('express-session');
const postgres = require('postgres');
const path = require('path');
const app = express();

// 1. KONFIGURASI
app.use(session({ secret: 'desa-wani-lumbumpetigo', resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.')); // Agar file pendukung bisa terbaca

const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");
const ADMIN_PASSWORD = "pandu123";

// Satpam Admin
const auth = (req, res, next) => { if (req.session.isLoggedIn) next(); else res.redirect('/login'); };

// --- 🏠 1. HALAMAN UTAMA (TAMPILAN DESAIN MEWAH KAMU) ---
app.get('/', (req, res) => {
  // Mengirim file beranda.html yang kamu buat tadi
  res.sendFile(path.join(__dirname, 'beranda.html'));
});

// --- 🛒 2. HALAMAN LAPAK (TAMPILAN SISTEM) ---
app.get('/lapak', async (req, res) => {
  try {
    const products = await sql`SELECT * FROM posts WHERE category_id = 2 ORDER BY id DESC`;
    let html = `<link href="https://cdn.jsdelivr.net" rel="stylesheet">
                <nav class="navbar navbar-dark bg-success mb-4"><div class="container"><a class="navbar-brand fw-bold" href="/">🌳 SID DESAKU</a></div></nav>
                <div class="container"><h2>🛒 Lapak UMKM Desa</h2><div class="row">`;
    products.forEach(p => {
      html += `<div class="col-md-4 mb-3"><div class="card p-3 shadow-sm border-0">
                <h5 class="fw-bold">${p.title}</h5><p class="text-success fw-bold">Rp ${p.price || '-'}</p>
                <a href="https://wa.me" class="btn btn-success btn-sm w-100">Beli di WA</a>
              </div></div>`;
    });
    res.send(html + "</div></div>");
  } catch (err) { res.send("Lapak sedang dipersiapkan..."); }
});

// --- 🔐 3. LOGIN & ADMIN ---
app.get('/login', (req, res) => {
  res.send(`<link href="https://cdn.jsdelivr.net" rel="stylesheet"><body class="bg-light d-flex align-items-center vh-100"><div class="card shadow mx-auto p-4" style="width:300px;"><h4>🔐 Login Admin</h4><form action="/login" method="POST"><input type="password" name="pass" class="form-control mb-2" required><button class="btn btn-success w-100">Masuk</button></form></div></body>`);
});
app.post('/login', (req, res) => { if (req.body.pass === ADMIN_PASSWORD) { req.session.isLoggedIn = true; res.redirect('/admin'); } else { res.redirect('/login'); } });

app.get('/admin', auth, async (req, res) => {
  const posts = await sql`SELECT p.*, c.name FROM posts p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC`;
  let html = `<link href="https://cdn.jsdelivr.net" rel="stylesheet"><div class="container py-4">
    <div class="d-flex justify-content-between"><h2>⚙️ Kelola SID</h2><a href="/" class="btn btn-outline-secondary">Lihat Web</a></div>
    <hr><ul class="list-group">${posts.map(p => `<li class="list-group-item d-flex justify-content-between"><span>[${p.name}] ${p.title}</span> <a href="/hapus/${p.id}" class="text-danger">Hapus</a></li>`).join('')}</ul>
  </div>`;
  res.send(html);
});

app.get('/hapus/:id', auth, async (req, res) => { await sql`DELETE FROM posts WHERE id = ${req.params.id}`; res.redirect('/admin'); });

// EXPORT UNTUK VERCEL
module.exports = app;
app.listen(3000, () => console.log("🚀 SID Desa Wani Lumbumpetigo Berjalan!"));
