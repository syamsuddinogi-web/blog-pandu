app.get('/api/penduduk', async (req, res) => {
  try {
    const data = await sql`SELECT * FROM penduduk ORDER BY id ASC`;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
