export const dynamic = 'force-dynamic';
import { createPool } from '@vercel/postgres';
import Link from 'next/link';

const pool = createPool({ connectionString: process.env.syam_POSTGRES_URL });

export default async function Beranda() {
  const { rows: posts } = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* HEADER / NAVIGASI */}
      <nav className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-50">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tighter">BLOG PANDU</h1>
        <div className="space-x-6 font-medium">
          <Link href="/" className="hover:text-blue-500">Beranda</Link>
          <Link href="/profil" className="hover:text-blue-500">Profil</Link>
          <Link href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Admin</Link>
        </div>
      </nav>

      {/* ISI BERANDA (HTML ANDA DI SINI) */}
      <header className="py-20 text-center bg-gray-50">
        <h2 className="text-5xl font-black mb-4">Selamat Datang di Beranda</h2>
        <p className="text-gray-500 max-w-md mx-auto">Ini adalah tampilan halaman utama yang sudah terhubung dengan GitHub dan Vercel.</p>
      </header>

      {/* DAFTAR BERITA OTOMATIS DARI DATABASE */}
      <main className="max-w-2xl mx-auto py-16 px-4">
        <h3 className="text-xl font-bold mb-8 border-b pb-2">Kabar Terbaru</h3>
        <div className="space-y-10">
          {posts.map((post) => (
            <div key={post.id}>
              <h4 className="text-2xl font-bold hover:text-blue-600 cursor-pointer">{post.title}</h4>
              <p className="text-gray-600 mt-2">{post.content}</p>
              <small className="text-gray-400 block mt-2">📅 {new Date(post.created_at).toLocaleDateString('id-ID')}</small>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
