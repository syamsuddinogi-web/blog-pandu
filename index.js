// --- 👤 HALAMAN PROFIL PENULIS (TENTANG SAYA) ---
app.get('/about', (req, res) => {
  res.send(`
    <link href="https://cdn.jsdelivr.net" rel="stylesheet">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-5">
      <div class="container">
        <a class="navbar-brand" href="/blog">📰 Blog Pandu</a>
        <div class="navbar-nav">
          <a class="nav-link" href="/blog">Home</a>
          <a class="nav-link active" href="/about">Tentang Saya</a>
        </div>
      </div>
    </nav>
    <div class="container" style="max-width: 800px;">
      <div class="card border-0 shadow-lg p-5 text-center">
        <img src="https://api.dicebear.com" style="width:150px; margin:auto; background:#eee; border-radius:50%; padding:10px;" class="mb-4">
        <h1 class="fw-bold">Halo, Saya Pandu! 👋</h1>
        <p class="text-muted fs-5">Full-Stack Web Developer & Creator</p>
        <hr class="my-4" style="width: 100px; margin: auto; border-top: 3px solid #007bff;">
        <p class="lead mt-3">
          Selamat datang di blog pribadi saya! Saya adalah seorang pengembang web yang suka mengeksplorasi teknologi terbaru. 
          Blog ini dibangun menggunakan <b>Node.js</b>, <b>Express</b>, dan database cloud <b>Neon</b>.
        </p>
        <div class="mt-4">
          <a href="https://github.com" target="_blank" class="btn btn-dark">GitHub Saya</a>
          <a href="/blog" class="btn btn-primary">Baca Tulisan Saya</a>
        </div>
      </div>
    </div>
    <footer class='text-center py-5 text-muted mt-5'>&copy; 2024 Blog Pandu - Created with ❤️</footer>
  `);
});
// Ubah bagian nav di rute /blog menjadi seperti ini:
<nav class="navbar navbar-light bg-light border-bottom mb-5">
  <div class="container">
    <span class="navbar-brand mb-0 h1 text-primary">📰 Blog Pandu Official</span>
    <div>
      <a href="/about" class="btn btn-sm btn-link text-decoration-none text-dark">Tentang Saya</a>
      <a href="/" class="btn btn-sm btn-outline-secondary">Admin</a>
    </div>
  </div>
</nav>
