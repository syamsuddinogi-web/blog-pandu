const express = require('express');
const session = require('express-session');
const postgres = require('postgres');
const app = express();

app.use(session({ secret: 'rahasia-pandu', resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));

const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");
const ADMIN_PASSWORD = "pandu123";
const auth = (req, res, next) => { if (req.session.isLoggedIn) next(); else res.redirect('/login'); };

// --- 🌐 HALAMAN PEMBACA (DENGAN TOMBOL LIKE) ---
app.get('/blog', async (req, res) => {
  try {
    const posts = await sql`SELECT * FROM posts ORDER BY id DESC`;
    let html = `
      <link href="https://cdn.jsdelivr.net" rel="stylesheet">
      <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom mb-5"><div class="container"><a class="navbar-brand fw-bold text-primary" href="/blog">📰 Blog Pandu</a><div class="navbar-nav"><a class="nav-link" href="/blog">Home</a><a class="nav-link" href="/about">Tentang Saya</a></div></div></nav>
      <div class="container" style="max-width: 800px;">
    `;
    posts.forEach(p => {
      html += `
        <div class="card mb-5 border-0 shadow-sm">
          ${p.image_url ? `<img src="${p.image_url}" class="card-img-top" style="height:350px; object-fit:cover;">` : ''}
          <div class="card-body p-4">
            <h2 class="fw-bold">${p.title}</h2>
            <p class="text-muted" style="line-height:1.8;">${p.content}</p>
            <hr>
            <div class="d-flex align-items-center gap-3">
               <a href="/like/${p.id}" class="btn btn-outline-danger btn-sm">❤️ Suka</a>
               <span class="fw-bold text-muted">${p.likes || 0} Orang menyukai ini</span>
            </div>
          </div>
        </div>
      `;
    });
    res.send(html + "</div><footer class='text-center py-5 text-muted'>&copy; 2024 Blog Pandu</footer></body>");
  } catch (err) { res.send(err.message); }
});

// --- ❤️ PROSES LIKE (UPDATE DATA KE NEON) ---
app.get('/like/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Perintah SQL untuk menambah 1 angka likes
    await sql`UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = ${id}`;
    res.redirect('/blog');
  } catch (err) { res.send(err.message); }
});

// --- 👤 HALAMAN TENTANG SAYA ---
app.get('/about', (req, res) => {
  res.send(`<link href="https://cdn.jsdelivr.net" rel="stylesheet"><nav class="navbar navbar-dark bg-dark mb-5"><div class="container"><a class="navbar-brand" href="/blog">📰 Blog Pandu</a></div></nav><div class="container text-center" style="max-width: 600px;"><div class="card p-5 shadow-lg border-0"><img src="https://api.dicebear.com" style="width:120px; margin:auto;" class="mb-4"><h1>Halo, Saya Pandu! 👋</h1><p class="lead">Full-Stack Web Developer. Blog ini adalah karya pertama saya menggunakan Node.js dan Neon Cloud.</p><a href="/blog" class="btn btn-primary mt-3">Kembali Baca Blog</a></div></div></body>`);
});

// --- 🛠️ LOGIN & ADMIN (TETAP SAMA) ---
app.get('/login', (req, res) => { res.send(`<link href="https://cdn.jsdelivr.net" rel="stylesheet"><body class="bg-light d-flex align-items-center vh-100"><div class="card shadow mx-auto" style="width: 300px;"><div class="card-body"><h4>🔐 Login</h4><form action="/login" method="POST"><input type="password" name="pass" class="form-control mb-2" required><button class="btn btn-primary w-100">Masuk</button></form></div></div></body>`); });
app.post('/login', (req, res) => { if (req.body.pass === ADMIN_PASSWORD) { req.session.isLoggedIn = true; res.redirect('/'); } else { res.redirect('/login'); } });
app.get('/', auth, async (req, res) => {
    const posts = await sql`SELECT * FROM posts ORDER BY id DESC`;
    let html = `<link href="https://cdn.jsdelivr.net" rel="stylesheet"><div class="container py-4"><h1>🚀 Admin</h1><a href="/logout">Logout</a><hr><form action="/tambah" method="POST" class="mb-5"><input name="judul" class="form-control mb-2" placeholder="Judul" required><input name="image_url" class="form-control mb-2" placeholder="URL Foto"><textarea name="konten" class="form-control mb-2" required></textarea><button class="btn btn-success">Posting</button></form>`;
    posts.forEach(p => { html += `<div class="border p-2 mb-2">${p.title} (${p.likes || 0} ❤️) <a href="/hapus/${p.id}">Hapus</a></div>`; });
    res.send(html + "</div></body>");
});
app.post('/tambah', auth, async (req, res) => { await sql`INSERT INTO posts (title, content, image_url, category_id) VALUES (${req.body.judul}, ${req.body.konten}, ${req.body.image_url}, 1)`; res.redirect('/'); });
app.get('/hapus/:id', auth, async (req, res) => { await sql`DELETE FROM posts WHERE id = ${req.params.id}`; res.redirect('/'); });
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/login'); });

// --- 1. HALAMAN UTAMA SEKARANG JADI BLOG PUBLIK (BEBAS AKSES) ---
app.get('/', async (req, res) => {
  try {
    const posts = await sql`SELECT * FROM posts ORDER BY id DESC`;
    let html = `<link href="https://cdn.jsdelivr.net" rel="stylesheet">
                <nav class="navbar navbar-light bg-light border-bottom mb-5"><div class="container"><span class="navbar-brand mb-0 h1 text-primary">📰 Blog Pandu</span><a href="/admin" class="btn btn-sm btn-outline-secondary">Login Admin</a></div></nav>
                <div class="container" style="max-width: 800px;">`;
    
    posts.forEach(p => {
      html += `<div class="card mb-5 border-0 shadow-sm overflow-hidden">
                ${p.image_url ? `<img src="${p.image_url}" class="card-img-top" style="height:300px; object-fit:cover;">` : ''}
                <div class="card-body p-4">
                  <h2 class="fw-bold">${p.title}</h2>
                  <p class="text-muted">${p.content}</p>
                  <a href="/like/${p.id}" class="btn btn-outline-danger btn-sm">❤️ Suka (${p.likes || 0})</a>
                </div>
              </div>`;
    });
    res.send(html + "</div></body>");
  } catch (err) { res.send(err.message); }
});

// --- 2. PINDAHKAN HALAMAN KELOLA (ADMIN) KE /ADMIN ---
app.get('/admin', auth, async (req, res) => {
  // Pindahkan kode tampilan admin kamu (yang ada tombol hapusnya) ke sini
  // ... (kode admin kamu sebelumnya)
});

