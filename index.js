const express = require('express');
const session = require('express-session');
const postgres = require('postgres');
const app = express();

// 1. KONFIGURASI DASAR
app.use(session({ secret: 'desa-digital-pandu', resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));

// Koneksi ke Neon Cloud
const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");

const ADMIN_PASSWORD = "pandu123";
const auth = (req, res, next) => { if (req.session.isLoggedIn) next(); else res.redirect('/login'); };

// 2. FUNGSI TEMPLATE NAVBAR & HEADER
const layout = (content) => `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net" rel="stylesheet">
    <title>Sistem Informasi Desa Pandu</title>
    <style>
      .navbar-brand { font-weight: 800; letter-spacing: 1px; }
      .card-img-top { height: 250px; object-fit: cover; }
      .nav-link:hover { color: #ffc107 !important; }
    </style>
  </head>
  <body class="bg-light text-dark">
    <nav class="navbar navbar-expand-lg navbar-dark bg-success sticky-top shadow-sm">
      <div class="container">
        <a class="navbar-brand" href="/">🌳 SID DESAKU</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto text-uppercase" style="font-size: 0.85rem; font-weight: 600;">
            <li class="nav-item"><a class="nav-link" href="/">Beranda</a></li>
            <li class="nav-item"><a class="nav-link" href="/kabar-desa">Kabar Desa</a></li>
            <li class="nav-item"><a class="nav-link" href="/galeri">Galeri</a></li>
            <li class="nav-item"><a class="nav-link" href="/lapak">Lapak</a></li>
            <li class="nav-item"><a class="nav-link text-warning" href="/apbdes">📊 APBDes</a></li>
            <li class="nav-item ms-lg-3"><a class="btn btn-sm btn-outline-light px-3" href="/admin">Kelola</a></li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="container py-5">${content}</div>
    <footer class="text-center py-5 bg-white border-top mt-5">
      <p class="mb-0 text-muted">&copy; 2024 Digitalisasi Desa - Dikembangkan oleh Pandu</p>
    </footer>
    <script src="https://cdn.jsdelivr.net"></script>
  </body>
  </html>
`;

// 3. RUTE PUBLIK (BERANDA)
app.get('/', async (req, res) => {
  try {
    const posts = await sql`SELECT p.*, c.name as kategori FROM posts p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC LIMIT 6`;
    let content = `<h2 class="fw-bold mb-4">🏠 Kabar Terbaru</h2><div class="row">`;
    posts.forEach(p => {
      content += `
        <div class="col-md-4 mb-4">
          <div class="card h-100 border-0 shadow-sm overflow-hidden">
            ${p.image_url ? `<img src="${p.image_url}" class="card-img-top">` : ''}
            <div class="card-body">
              <span class="badge bg-success mb-2">${p.kategori}</span>
              <h5 class="card-title fw-bold">${p.title}</h5>
              <p class="card-text text-muted small">${p.content.substring(0, 100)}...</p>
              <div class="d-flex justify-content-between align-items-center">
                <a href="/like/${p.id}" class="btn btn-sm btn-outline-danger">❤️ ${p.likes || 0}</a>
                <span class="text-muted" style="font-size: 10px;">${new Date(p.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>`;
    });
    res.send(layout(content + `</div>`));
  } catch (err) { res.send(layout(`<h3>Gagal memuat data: ${err.message}</h3>`)); }
});

// 4. RUTE HALAMAN KHUSUS
app.get('/kabar-desa', async (req, res) => {
  const posts = await sql`SELECT p.*, c.name FROM posts p JOIN categories c ON p.category_id = c.id WHERE c.name = '📢 Kabar Desa'`;
  res.send(layout(`<h2 class="mb-4">📢 Kabar Desa</h2><div class="list-group">${posts.map(p => `<div class="list-group-item"><h5>${p.title}</h5><p>${p.content}</p></div>`).join('')}</div>`));
});

app.get('/apbdes', (req, res) => res.send(layout(`<div class="text-center py-5"><h2>📊 Transparansi APBDes</h2><p>Data Anggaran Desa sedang diverifikasi oleh Pemerintah Desa.</p><img src="https://api.dicebear.com" style="width:200px;"></div>`)));

// 5. SISTEM LOGIN & ADMIN
app.get('/login', (req, res) => {
  res.send(layout(`<div class="row justify-content-center"><div class="col-md-4"><div class="card p-4 shadow-sm"><h3>🔐 Login Admin</h3><form action="/login" method="POST"><input type="password" name="pass" class="form-control mb-3" placeholder="Password" required><button class="btn btn-success w-100">Masuk</button></form></div></div></div>`));
});
app.post('/login', (req, res) => { if (req.body.pass === ADMIN_PASSWORD) { req.session.isLoggedIn = true; res.redirect('/admin'); } else { res.redirect('/login'); } });
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

app.get('/admin', auth, async (req, res) => {
  const cats = await sql`SELECT * FROM categories`;
  const posts = await sql`SELECT p.*, c.name as kategori FROM posts p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC`;
  let opts = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  let content = `
    <div class="row"><div class="col-md-4">
      <div class="card p-3 shadow-sm mb-4"><h5>✍️ Posting SID</h5>
        <form action="/tambah" method="POST">
          <input name="judul" class="form-control mb-2" placeholder="Judul" required>
          <select name="category_id" class="form-select mb-2">${opts}</select>
          <input name="image_url" class="form-control mb-2" placeholder="Link Foto">
          <textarea name="konten" class="form-control mb-2" placeholder="Isi..." required></textarea>
          <button class="btn btn-success w-100">Kirim</button>
        </form>
      </div>
    </div><div class="col-md-8"><h3>Daftar Data</h3><table class="table bg-white">
      ${posts.map(p => `<tr><td>[${p.kategori}] ${p.title}</td><td><a href="/hapus/${p.id}" class="text-danger">Hapus</a></td></tr>`).join('')}
    </table></div></div>`;
  res.send(layout(content));
});

// 6. PROSES CRUD
app.post('/tambah', auth, async (req, res) => {
  const { judul, konten, image_url, category_id } = req.body;
  await sql`INSERT INTO posts (title, content, image_url, category_id) VALUES (${judul}, ${konten}, ${image_url}, ${category_id})`;
  res.redirect('/admin');
});
app.get('/hapus/:id', auth, async (req, res) => { await sql`DELETE FROM posts WHERE id = ${req.params.id}`; res.redirect('/admin'); });
app.get('/like/:id', async (req, res) => { await sql`UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = ${req.params.id}`; res.redirect('/'); });

module.exports = app;
app.listen(3000, () => console.log("🚀 SID Pandu Jalan!"));
