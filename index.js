const express = require('express');
const session = require('express-session');
const postgres = require('postgres');
const app = express();

app.use(session({ secret: 'rahasia-pandu', resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));

const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");
const ADMIN_PASSWORD = "pandu123";
const auth = (req, res, next) => { if (req.session.isLoggedIn) next(); else res.redirect('/login'); };

// --- 🌐 HALAMAN PUBLIK (UNTUK PEMBACA - TANPA LOGIN) ---
app.get('/blog', async (req, res) => {
  try {
    const posts = await sql`SELECT * FROM posts ORDER BY id DESC`;
    let html = `
      <link href="https://cdn.jsdelivr.net" rel="stylesheet">
      <nav class="navbar navbar-light bg-light border-bottom mb-5"><div class="container"><span class="navbar-brand mb-0 h1 text-primary">📰 Blog Pandu Official</span><a href="/" class="btn btn-sm btn-outline-secondary">Login Admin</a></div></nav>
      <div class="container" style="max-width: 800px;">
        <h2 class="mb-4 text-center">Artikel Terbaru</h2>
    `;
    posts.forEach(p => {
      html += `
        <div class="card mb-5 border-0 shadow-sm overflow-hidden">
          ${p.image_url ? `<img src="${p.image_url}" class="card-img-top" style="height:350px; object-fit:cover;">` : ''}
          <div class="card-body p-4">
            <h2 class="card-title fw-bold">${p.title}</h2>
            <p class="card-text text-muted" style="font-size: 1.1rem; line-height: 1.8;">${p.content}</p>
          </div>
        </div>
      `;
    });
    res.send(html + "</div><footer class='text-center py-5 text-muted'>&copy; 2024 Blog Pandu - Powered by Neon Cloud</footer></body>");
  } catch (err) { res.send(err.message); }
});

// --- 🔐 SISTEM LOGIN ADMIN ---
app.get('/login', (req, res) => {
  res.send(`<link href="https://cdn.jsdelivr.net" rel="stylesheet"><body class="bg-light d-flex align-items-center vh-100"><div class="card shadow mx-auto" style="width: 350px;"><div class="card-body"><h3>🔑 Login Admin</h3><form action="/login" method="POST"><input type="password" name="pass" class="form-control mb-3" placeholder="Password" required><button class="btn btn-primary w-100">Masuk</button></form><br><a href="/blog" class="d-block text-center text-decoration-none">← Kembali ke Blog</a></div></div></body>`);
});
app.post('/login', (req, res) => { if (req.body.pass === ADMIN_PASSWORD) { req.session.isLoggedIn = true; res.redirect('/'); } else { res.send("<script>alert('Salah!'); window.location='/login';</script>"); } });
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/blog'); });

// --- 🛠️ DASHBOARD ADMIN (PROTECTED) ---
app.get('/', auth, async (req, res) => {
  try {
    await sql`DEALLOCATE ALL`.catch(() => {});
    const posts = await sql`SELECT * FROM posts ORDER BY id DESC`;
    let html = `<link href="https://cdn.jsdelivr.net" rel="stylesheet"><nav class="navbar navbar-dark bg-dark mb-4"><div class="container"><span class="navbar-brand">🚀 Dashboard Admin</span><div class="d-flex gap-2"><a href="/blog" class="btn btn-outline-info btn-sm">Lihat Web Blog</a><a href="/logout" class="btn btn-outline-danger btn-sm">Keluar</a></div></div></nav><div class="container"><div class="row">
    <div class="col-md-4"><div class="card p-3 shadow-sm"><h5>✍️ Buat Postingan</h5><form action="/tambah" method="POST"><input type="text" name="judul" class="form-control mb-2" placeholder="Judul" required><input type="text" name="image_url" class="form-control mb-2" placeholder="URL Foto"><textarea name="konten" class="form-control mb-2" placeholder="Isi..." required></textarea><button class="btn btn-success w-100">Posting ke Neon</button></form></div></div>
    <div class="col-md-8"><div class="row">`;
    posts.forEach(p => { html += `<div class="col-12 mb-3"><div class="card p-3 shadow-sm h-100 d-flex flex-row gap-3">${p.image_url ? `<img src="${p.image_url}" style="width:100px; height:100px; object-fit:cover; border-radius:5px;">` : ''}<div><h6 class="text-primary">${p.title}</h6><a href="/edit/${p.id}" class="btn btn-sm btn-link p-0 text-decoration-none">Edit</a> | <a href="/hapus/${p.id}" class="btn btn-sm btn-link p-0 text-danger text-decoration-none" onclick="return confirm('Hapus?')">Hapus</a></div></div></div>`; });
    res.send(html + "</div></div></div></div></body>");
  } catch (err) { res.send(err.message); }
});

// --- PROSES CRUD (CREATE, UPDATE, DELETE) ---
app.get('/edit/:id', auth, async (req, res) => {
  const [p] = await sql`SELECT * FROM posts WHERE id = ${req.params.id}`;
  res.send(`<link href="https://cdn.jsdelivr.net" rel="stylesheet"><body class="bg-light py-5"><div class="container" style="max-width: 600px;"><div class="card p-4 shadow"><h3>✏️ Edit Artikel</h3><form action="/update/${p.id}" method="POST"><input type="text" name="judul" value="${p.title}" class="form-control mb-2"><input type="text" name="image_url" value="${p.image_url || ''}" class="form-control mb-2"><textarea name="konten" class="form-control mb-2" style="height:200px;">${p.content}</textarea><button class="btn btn-primary">💾 Simpan</button><a href="/" class="btn btn-link text-muted">Batal</a></form></div></div></body>`);
});
app.post('/update/:id', auth, async (req, res) => { await sql`UPDATE posts SET title=${req.body.judul}, content=${req.body.konten}, image_url=${req.body.image_url} WHERE id=${req.params.id}`; res.redirect('/'); });
app.post('/tambah', auth, async (req, res) => { await sql`INSERT INTO posts (title, content, image_url, category_id) VALUES (${req.body.judul}, ${req.body.konten}, ${req.body.image_url}, 1)`; res.redirect('/'); });
app.get('/hapus/:id', auth, async (req, res) => { await sql`DELETE FROM posts WHERE id = ${req.params.id}`; res.redirect('/'); });

app.listen(3000, () => console.log("🚀 Blog Pandu Online di http://localhost:3000/blog"));
