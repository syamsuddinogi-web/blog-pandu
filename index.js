const express = require('express');
const session = require('express-session');
const postgres = require('postgres');
const app = express();

app.use(session({ secret: 'rahasia-pandu', resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));

const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");
const ADMIN_PASSWORD = "pandu123";

// Fungsi Satpam (Hanya untuk Admin)
const auth = (req, res, next) => { if (req.session.isLoggedIn) next(); else res.redirect('/login'); };

// --- 🏠 1. HALAMAN UTAMA (PUBLIK - BEBAS AKSES) ---
app.get('/', async (req, res) => {
  try {
    const posts = await sql`SELECT * FROM posts ORDER BY id DESC`;
    let html = `<link href="https://cdn.jsdelivr.net" rel="stylesheet">
                <nav class="navbar navbar-light bg-light border-bottom mb-5"><div class="container"><span class="navbar-brand mb-0 h1 text-primary">📰 Blog Pandu Official</span><a href="/login" class="btn btn-sm btn-outline-secondary">Login Admin</a></div></nav>
                <div class="container" style="max-width: 800px;">`;
    posts.forEach(p => {
      html += `<div class="card mb-5 border-0 shadow-sm overflow-hidden">
                ${p.image_url ? `<img src="${p.image_url}" class="card-img-top" style="height:350px; object-fit:cover;">` : ''}
                <div class="card-body p-4">
                  <h2 class="fw-bold">${p.title}</h2>
                  <p class="text-muted" style="line-height:1.8;">${p.content}</p>
                  <a href="/like/${p.id}" class="btn btn-outline-danger btn-sm">❤️ Suka (${p.likes || 0})</a>
                </div>
              </div>`;
    });
    res.send(html + "</div><footer class='text-center py-5 text-muted'>&copy; 2024 Blog Pandu</footer></body>");
  } catch (err) { res.send(err.message); }
});

// --- 🔐 2. HALAMAN LOGIN & LOGOUT ---
app.get('/login', (req, res) => {
  res.send(`<link href="https://cdn.jsdelivr.net" rel="stylesheet"><body class="bg-light d-flex align-items-center vh-100"><div class="card shadow mx-auto" style="width: 300px;"><div class="card-body"><h4>🔐 Login Admin</h4><form action="/login" method="POST"><input type="password" name="pass" class="form-control mb-2" required><button class="btn btn-primary w-100">Masuk</button></form><br><a href="/" class="d-block text-center text-decoration-none">← Kembali ke Blog</a></div></div></body>`);
});
app.post('/login', (req, res) => { if (req.body.pass === ADMIN_PASSWORD) { req.session.isLoggedIn = true; res.redirect('/admin'); } else { res.send("<script>alert('Password Salah!'); window.location='/login';</script>"); } });
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// --- 🛠️ 3. HALAMAN KELOLA (ADMIN - DIPROTEKSI) ---
app.get('/admin', auth, async (req, res) => {
  try {
    const posts = await sql`SELECT * FROM posts ORDER BY id DESC`;
    let html = `<link href="https://cdn.jsdelivr.net" rel="stylesheet"><nav class="navbar navbar-dark bg-dark mb-4"><div class="container"><span class="navbar-brand">🚀 Admin Panel</span><div class="d-flex gap-2"><a href="/" class="btn btn-outline-info btn-sm">Lihat Blog</a><a href="/logout" class="btn btn-outline-danger btn-sm">Keluar</a></div></div></nav><div class="container py-4">
    <div class="card p-3 mb-4"><h5>✍️ Tambah Artikel</h5><form action="/tambah" method="POST" class="row g-2"><div class="col-md-6"><input name="judul" class="form-control" placeholder="Judul" required></div><div class="col-md-6"><input name="image_url" class="form-control" placeholder="URL Gambar"></div><div class="col-12"><textarea name="konten" class="form-control" placeholder="Isi..." required></textarea></div><button class="btn btn-success">Posting ke Neon Cloud</button></form></div>`;
    posts.forEach(p => { html += `<div class="alert alert-secondary d-flex justify-content-between"><span><b>${p.title}</b> (${p.likes || 0} ❤️)</span> <a href="/hapus/${p.id}" class="text-danger">Hapus</a></div>`; });
    res.send(html + "</div></body>");
  } catch (err) { res.send(err.message); }
});

// --- ⚙️ 4. PROSES DATA ---
app.post('/tambah', auth, async (req, res) => { await sql`INSERT INTO posts (title, content, image_url, category_id) VALUES (${req.body.judul}, ${req.body.konten}, ${req.body.image_url}, 1)`; res.redirect('/admin'); });
app.get('/hapus/:id', auth, async (req, res) => { await sql`DELETE FROM posts WHERE id = ${req.params.id}`; res.redirect('/admin'); });
app.get('/like/:id', async (req, res) => { await sql`UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = ${req.params.id}`; res.redirect('/'); });

// EXPORT UNTUK VERCEL
module.exports = app;

app.listen(3000, () => console.log("🚀 Server Jalan!"));
