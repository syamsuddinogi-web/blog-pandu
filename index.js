// --- 📡 API DATA PENDUDUK (DARI EXCEL) ---
app.get('/api/penduduk', async (req, res) => {
  try {
    // Mengambil data dari Neon
    const data = await sql`SELECT * FROM penduduk ORDER BY id ASC`;
    
    // Pastikan data selalu terkirim sebagai angka agar tidak error saat dihitung di HTML
    const cleanData = data.map(d => ({
      id: d.id,
      nama_dusun: d.nama_dusun || "Dusun",
      jumlah_kk: Number(d.jumlah_kk || 0),
      laki_laki: Number(d.laki_laki || 0),
      perempuan: Number(d.perempuan || 0)
    }));

    res.status(200).json(cleanData);
  } catch (err) {
    // Jika database error, kirim status 500 tapi jangan biarkan server mati
    console.error("Error Database:", err.message);
    res.status(500).json({ error: "Gagal memuat data penduduk" });
  }
});
