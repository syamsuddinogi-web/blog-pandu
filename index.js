const express = require('express');
const session = require('express-session');
const postgres = require('postgres');
const app = express();

// Konfigurasi Middleware
app.use(session({ secret: 'desa-digital-pandu', resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));

// Koneksi ke Neon Cloud
const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");

const ADMIN_PASSWORD = "pandu123";
const auth = (req, res, next) => { if (req.session.isLoggedIn) next(); else res.redirect('/login'); };

// 1. FUNGSI LAYOUT (NAVBAR & FOOTER)
const layout = (content) => `
  <link href="https://cdn.jsdelivr.net" rel="stylesheet">
  <nav class="navbar navbar-expand-lg navbar-dark bg-success shadow-sm mb-5">
    <div class="container">
      <a class="navbar-brand fw-bold" href="/">🌳 SID DESAKU</a>
      <div class="navbar-nav ms-auto">
        <a class="nav-link" href="/">Beranda</a>
        <a class="nav-link text-warning fw-bold" href="/lapak">🛒 Lapak Desa</a>
        <a class="nav-link" href="/admin">Kelola</a>
      </div>
    </div>
  </nav>
  <div class="container py-3">${content}</div>
  <footer class="text-center py-5 text-muted border-top mt-5">&copy; 2024 SID Desa - Digitalisasi by Pandu</footer>
`;

// 2. HALAMAN UTAMA (KABAR DESA)
app.get('/', async (req, res) => {
  try {
    const posts = await sql`SELECT p.*, c.name as kategori FROM posts p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC`;
    let content = `<h2 class="mb-4 fw-bold">🏠 Kabar Desa Terbaru</h2><div class="row">`;
    posts.forEach(p => {
      content += `<div class="col-md-6 mb-4"><div class="card h-100 border-0 shadow-sm p-3">
        ${p.image_url ? `<img src="${p.image_url}" class="card-img-top mb-3" style="height:200px; object-fit:cover; border-radius:10px;">` : ''}
        <span class="badge bg-success mb-2" style="width:fit-content;">${p.kategori}</span>
        <h4>${p.title}</h4><p class="text-muted small">${p.content.substring(0, 150)}...</p>
        <div class="d-flex justify-content-between align-items-center mt-auto">
          <a href="/like/${p.id}" class="btn btn-sm btn-outline-danger">❤️ ${p.likes || 0}</a>
        </div>
      </div></div>`;
    });
    res.send(layout(content + "</div>"));
  } catch (err) { res.send(layout("<h5>Data sedang dimuat atau database belum siap...</h5>")); }
});

// 3. HALAMAN LAPAK UMKM
app.get('/lapak', async (req, res) => {
  try {
    const products = await sql`SELECT * FROM posts WHERE category_id = (SELECT id FROM categories WHERE name LIKE '%Lapak%' LIMIT 1)`;
    let content = `<h2 class="mb-4 fw-bold text-success">🛒 Lapak UMKM Desa</h2><div class="row">`;
    products.forEach(p => {
      content += `<div class="col-md-4 mb-4"><div class="card shadow-sm border-0 h-100 p-3 text-center">
        ${p.image_url ? `<img src="${p.image_url}" class="card-img-top rounded mb-3">` : ''}
        <h5>${p.title}</h5>
        <p class="text-success fw-bold">Rp ${p.price || '-'}</p>
        <a href="https://wa.me" class="btn btn-success w-100 btn-sm mt-auto">Beli di WA</a>
      </div></div>`;
    });
    res.send(layout(content + "</div>"));
  } catch (err) { res.send(layout("Halaman Lapak sedang dipersiapkan...")); }
});

// 4. LOGIN & ADMIN
app.get('/login', (req, res) => {
  res.send(layout(`<div class="card p-4 mx-auto shadow" style="max-width:350px;"><h3>🔐 Login Admin</h3><form action="/login" method="POST"><input type="password" name="pass" class="form-control mb-3" required><button class="btn btn-success w-100">Masuk</button></form></div>`));
});

app.post('/login', (req, res) => {
  if (req.body.pass === ADMIN_PASSWORD) { req.session.isLoggedIn = true; res.redirect('/admin'); }
  else { res.redirect('/login'); }
});

app.get('/admin', auth, async (req, res) => {
  try {
    const cats = await sql`SELECT * FROM categories`;
    const posts = await sql`SELECT p.*, c.name as kategori FROM posts p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC`;
    let opts = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    let content = `
      <div class="d-flex justify-content-between"><h2>⚙️ Admin Panel</h2><a href="/logout" class="btn btn-danger btn-sm">Keluar</a></div>
      <div class="card p-3 my-4 shadow-sm">
        <h5>Buat Postingan Baru</h5>
        <form action="/tambah" method="POST">
          <input name="judul" class="form-control mb-2" placeholder="Judul" required>
          <select name="category_id" class="form-select mb-2">${opts}</select>
          <input name="price" class="form-control mb-2" placeholder="Harga (Jika Lapak)">
          <input name="image_url" class="form-control mb-2" placeholder="URL Foto">
          <textarea name="konten" class="form-control mb-2" placeholder="Isi..." required></textarea>
          <button class="btn btn-success w-100">Posting</button>
        </form>
      </div>
      <ul class="list-group">${posts.map(p => `<li class="list-group-item d-flex justify-content-between"><span>[${p.kategori}] ${p.title}</span> <a href="/hapus/${p.id}" class="text-danger">Hapus</a></li>`).join('')}</ul>`;
    res.send(layout(content));
  } catch (err) { res.send(err.message); }
});

// 5. PROSES CRUD & EXPORT
app.post('/tambah', auth, async (req, res) => {
  const { judul, konten, image_url, category_id, price } = req.body;
  await sql`INSERT INTO posts (title, content, image_url, category_id, price) VALUES (${judul}, ${konten}, ${image_url}, ${category_id}, ${price})`;
  res.redirect('/admin');
});
app.get('/hapus/:id', auth, async (req, res) => { await sql`DELETE FROM posts WHERE id = ${req.params.id}`; res.redirect('/admin'); });
app.get('/like/:id', async (req, res) => { await sql`UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = ${req.params.id}`; res.redirect('/'); });
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// PENTING: Export untuk Vercel
module.exports = app;

app.listen(3000, () => console.log("🚀 SID Pandu Jalan!"));
