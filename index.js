const express = require('express');
const session = require('express-session');
const postgres = require('postgres');
const path = require('path');
const multer = require('multer');
const app = express();

app.use(session({ secret: 'desa-wani-lumbumpetigo', resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Membaca CSS/Gambar dari folder utama (naik 1 tingkat)
app.use(express.static(path.join(__dirname, '..')));

const sql = postgres("postgresql://neondb_owner:npg_0hBbRxa4EpoF@ep-jolly-dust-ai4zkz1g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");

// --- 🏠 RUTE HALAMAN (Naik ke folder utama pakai ../) ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../beranda.html')));
app.get('/profil', (req, res) => res.sendFile(path.join(__dirname, '../profil.html')));
app.get('/apbdes', (req, res) => res.sendFile(path.join(__dirname, '../apbdes.html')));
app.get('/infografis', (req, res) => res.sendFile(path.join(__dirname, '../infografis.html')));
app.get('/input', (req, res) => res.sendFile(path.join(__dirname, '../input.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../masuk.html')));

// Rute PDF agar bisa didownload
app.get('/jumlah-dan-persentase-penduduk.pdf', (req, res) => {
  res.sendFile(path.join(__dirname, '../jumlah-dan-persentase-penduduk.pdf'));
});

// --- 🔐 LOGIN ---
app.post('/login', (req, res) => {
  if (req.body.pass === "pandu123") {
    req.session.isLoggedIn = true; res.redirect('/admin');
  } else { res.redirect('/login'); }
});

app.get('/admin', (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect('/login');
  res.send("<h1>⚙️ Admin Desa</h1><a href='/'>Kembali ke Web</a>");
});

module.exports = app; // WAJIB UNTUK VERCEL
