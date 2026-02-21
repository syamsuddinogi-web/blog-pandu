const express = require('express');
app.use(express.static('.')); // Membaca file di folder utama
const session = require('express-session');
const postgres = require('postgres');
const app = express();


app.use(session({ secret: 'desa-digital-pandu', resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));

const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");

const layout = (content) => `
  <link href="https://cdn.jsdelivr.net" rel="stylesheet">
  <nav class="navbar navbar-expand-lg navbar-dark bg-success shadow-sm mb-4"><div class="container"><a class="navbar-brand fw-bold" href="/">🌳 SID DESAKU</a><div class="navbar-nav ms-auto"><a class="nav-link" href="/">Beranda</a><a class="nav-link" href="/admin">Kelola</a></div></div></nav>
  <div class="container py-3">${content}</div>
  <footer class="text-center py-5 text-muted border-top mt-5">&copy; 2026 SID Desa - Digitalisasi by Pandu</footer>
`;

app.get('/', async (req, res) => {
  try {
    // Ambil Kabar Desa (Kategori 1)
    const kabar = await sql`SELECT * FROM posts WHERE category_id = 1 ORDER BY id DESC`;
    // Ambil Lapak UMKM (Kategori 2)
    const lapak = await sql`SELECT * FROM posts WHERE category_id = 2 ORDER BY id DESC`;

    let html = `<h2 class="fw-bold mb-4 text-success">🏠 Kabar Desa Terbaru</h2><div class="row mb-5">`;
    kabar.forEach(p => {
      html += `<div class="col-md-6 mb-3"><div class="card border-0 shadow-sm p-3"><h4>${p.title}</h4><p class="text-muted small">${p.content}</p></div></div>`;
    });

    html += `</div><h2 class="fw-bold mb-4 text-warning">🛒 Lapak UMKM Desa</h2><div class="row">`;
    lapak.forEach(l => {
      html += `
        <div class="col-6 col-md-3 mb-4">
          <div class="card h-100 border-0 shadow-sm overflow-hidden">
            <img src="${l.image_url || 'https://via.placeholder.com'}" class="card-img-top" style="height:150px; object-fit:cover;">
            <div class="card-body p-2 text-center">
              <h6 class="fw-bold mb-1 text-truncate">${l.title}</h6>
              <p class="text-success fw-bold mb-2">Rp ${l.price || '-'}</p>
              <a href="https://wa.me, saya pesan ${l.title}" class="btn btn-sm btn-success w-100">Beli di WA</a>
            </div>
          </div>
        </div>`;
    });

    html += `</div><div class="mt-5 p-4 bg-white rounded shadow-sm">
      <h4 class="fw-bold mb-3 text-success text-center text-md-start">📍 Lokasi Kantor Desa</h4>
      <div class="ratio ratio-21x9"><iframe src="https://www.google.com" style="border:0;" allowfullscreen="" loading="lazy"></iframe></div>
    </div>`;

    res.send(layout(html));
  } catch (err) { res.send(layout("Data sedang dimuat... " + err.message)); }
});

// Sisanya (Login, Admin, Tambah, Hapus) sesuaikan...
app.get('/login', (req, res) => { res.send(layout(`<form action="/login" method="POST" class="mx-auto" style="max-width:300px;"><h3>🔐 Login</h3><input type="password" name="pass" class="form-control mb-2" required><button class="btn btn-success w-100">Masuk</button></form>`)); });
app.post('/login', (req, res) => { if (req.body.pass === "pandu123") { req.session.isLoggedIn = true; res.redirect('/admin'); } else { res.redirect('/login'); } });
app.get('/admin', async (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect('/login');
  const posts = await sql`SELECT p.*, c.name FROM posts p JOIN categories c ON p.category_id = c.id`;
  res.send(layout(`<h3>⚙️ Admin</h3><ul class="list-group">${posts.map(p => `<li class="list-group-item d-flex justify-content-between">${p.title} (${p.name}) <a href="/hapus/${p.id}" class="text-danger">Hapus</a></li>`).join('')}</ul><a href="/" class="btn btn-link mt-3 text-decoration-none text-muted">← Kembali ke Blog</a>`));
});
