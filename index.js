const express = require('express');
const session = require('express-session');
const postgres = require('postgres');
const app = express();

app.use(session({ secret: 'desa-digital-pandu', resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));

const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");
const ADMIN_PASSWORD = "pandu123";

const layout = (content) => `
  <link href="https://cdn.jsdelivr.net" rel="stylesheet">
  <nav class="navbar navbar-dark bg-success shadow-sm mb-4"><div class="container"><a class="navbar-brand fw-bold" href="/">🌳 SID DESAKU</a><div class="navbar-nav ms-auto"><a class="nav-link" href="/">Beranda</a><a class="nav-link" href="/admin">Kelola</a></div></div></nav>
  <div class="container py-3">${content}</div>
  <footer class="text-center py-5 text-muted border-top mt-5">&copy; 2024 SID Desa - Digitalisasi by Pandu</footer>
`;

app.get('/', async (req, res) => {
  try {
    const posts = await sql`SELECT p.*, c.name as kategori FROM posts p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC`;
    let content = `<h2 class="mb-4 fw-bold">🏠 Kabar Desa Terbaru</h2><div class="row">`;
    posts.forEach(p => {
      content += `<div class="col-md-6 mb-4"><div class="card h-100 border-0 shadow-sm p-3">
        <span class="badge bg-success mb-2" style="width:fit-content;">${p.kategori}</span>
        <h4>${p.title}</h4><p class="text-muted small">${p.content}</p>
        <a href="/like/${p.id}" class="btn btn-sm btn-outline-danger mt-auto">❤️ ${p.likes || 0}</a>
      </div></div>`;
    });
    
    // --- TAMBAHKAN PETA DI SINI ---
    content += `</div><div class="mt-5 p-4 bg-white rounded shadow-sm">
      <h4 class="fw-bold mb-3 text-success">📍 Lokasi Kantor Desa</h4>
      <div class="ratio ratio-21x9">
        <iframe src="https://www.google.com" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
      </div>
    </div>`;
    
    res.send(layout(content));
  } catch (err) { res.send(layout("Database sedang dimuat...")); }
});

// Sisanya (Login, Admin, Tambah, Hapus) tetap sama seperti sebelumnya...
app.get('/login', (req, res) => { res.send(layout(`<form action="/login" method="POST" class="mx-auto" style="max-width:300px;"><h3>🔐 Login</h3><input type="password" name="pass" class="form-control mb-2" required><button class="btn btn-success w-100">Masuk</button></form>`)); });
app.post('/login', (req, res) => { if (req.body.pass === ADMIN_PASSWORD) { req.session.isLoggedIn = true; res.redirect('/admin'); } else { res.redirect('/login'); } });
app.get('/admin', async (req, res) => { if (!req.session.isLoggedIn) return res.redirect('/login'); const posts = await sql`SELECT * FROM posts`; res.send(layout(`<h3>⚙️ Admin</h3><ul class="list-group">${posts.map(p => `<li class="list-group-item d-flex justify-content-between">${p.title} <a href="/hapus/${p.id}" class="text-danger">Hapus</a></li>`).join('')}</ul><a href="/" class="btn btn-link mt-3 text-decoration-none text-muted">← Kembali ke Blog</a>`)); });
app.get('/hapus/:id', async (req, res) => { await sql`DELETE FROM posts WHERE id = ${req.params.id}`; res.redirect('/admin'); });
app.get('/like/:id', async (req, res) => { await sql`UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = ${req.params.id}`; res.redirect('/'); });

module.exports = app;
app.listen(3000);
