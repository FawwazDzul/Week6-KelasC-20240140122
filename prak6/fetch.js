/* ==========================================================
   fetch.js - uji coba Fetch API dari terminal
   Jalankan : node prak6/fetch.js
   Syarat   : Node.js 18 atau lebih baru (fetch sudah bawaan)
   Hasil hanya tampil di terminal. Versi yang tampil di halaman web
   ada di js/index.js.
   ========================================================== */

const API_URL = process.env.API_URL ||
  'https://dummyjson.com/products?limit=5&select=title,price,stock,category';

async function ujiFetch() {
  console.log('Mengambil data dari', API_URL);
  try {
    const respons = await fetch(API_URL);
    console.log('Status:', respons.status);

    // fetch tidak error untuk 404 atau 500, jadi status dicek manual
    if (!respons.ok) throw new Error('HTTP ' + respons.status);

    const data = await respons.json();
    console.log('Total produk di server:', data.total, '| diambil:', data.products.length);
    console.table(data.products.map((p) => ({
      nama: p.title,
      harga_usd: p.price,
      stok: p.stock,
      kategori: p.category
    })));
  } catch (err) {
    console.error('Gagal mengambil data:', err.message);
    process.exitCode = 1;
  }
}

ujiFetch();