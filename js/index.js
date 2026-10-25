/* ==========================================================
   index.js - Etalase: ambil produk (Fetch API), cari, dan filter
   Bagian 1: pengaturan
   Bagian 2: fungsi murni (tanpa DOM, dites di prak6/test.js)
   Bagian 3: pengambilan data
   Bagian 4: tampilan (DOM) dan event listener
   ========================================================== */
'use strict';

/* ---------- 1. PENGATURAN ---------- */

// limit=0 meminta semua produk, select membatasi field agar respons kecil
const API_URL = 'https://dummyjson.com/products?limit=0&select=title,price,stock,category,thumbnail';
const BATAS_WAKTU_MS = 10000;
const BATAS_STOK_MENIPIS = 10;

// Kategori yang relevan dengan proyek: perangkat untuk membuka chatbot akademik.
// Kosongkan array ([]) kalau ingin menampilkan semua produk DummyJSON.
const KATEGORI_PROYEK = ['smartphones', 'laptops', 'tablets', 'mobile-accessories'];

const NAMA_KATEGORI = {
  smartphones: 'Smartphone',
  laptops: 'Laptop',
  tablets: 'Tablet',
  'mobile-accessories': 'Aksesori ponsel'
};

/* ---------- 2. FUNGSI MURNI ---------- */

function labelKategori(slug) {
  if (NAMA_KATEGORI[slug]) return NAMA_KATEGORI[slug];
  const teks = slug.replace(/-/g, ' ');
  return teks.charAt(0).toUpperCase() + teks.slice(1);
}

function formatHarga(usd) {
  return '$' + Number(usd).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function stokMenipis(stok) {
  return Number.isFinite(stok) && stok < BATAS_STOK_MENIPIS;
}

// Dipakai agar data yang tampil sesuai tema proyek.
// Kalau tidak ada produk yang cocok, semua produk dipakai supaya halaman tidak kosong.
function ambilKategoriProyek(semua) {
  if (KATEGORI_PROYEK.length === 0) return semua;
  const terpilih = semua.filter((p) => KATEGORI_PROYEK.includes(p.category));
  return terpilih.length > 0 ? terpilih : semua;
}

function daftarKategori(produk) {
  return [...new Set(produk.map((p) => p.category))].sort();
}

function saringProduk(produk, kataKunci, kategori) {
  const kata = kataKunci.trim().toLowerCase();
  return produk.filter((p) => {
    const cocokKategori = !kategori || p.category === kategori;
    const cocokNama = !kata || p.title.toLowerCase().includes(kata);
    return cocokKategori && cocokNama;
  });
}

function pesanError(err) {
  if (err.name === 'AbortError') return 'Server tidak menjawab dalam 10 detik.';
  if (err.name === 'TypeError') return 'Tidak bisa terhubung ke server. Periksa koneksi internet.';
  return 'Data gagal dimuat (' + err.message + ').';
}

/* ---------- 3. PENGAMBILAN DATA ---------- */

async function ambilProduk() {
  const pengendali = new AbortController();
  const timer = setTimeout(() => pengendali.abort(), BATAS_WAKTU_MS);
  try {
    const respons = await fetch(API_URL, { signal: pengendali.signal });
    // fetch tidak error untuk status 404 atau 500, jadi dicek manual
    if (!respons.ok) throw new Error('HTTP ' + respons.status);
    const data = await respons.json();
    if (!Array.isArray(data.products)) throw new Error('format data tidak sesuai');
    return data.products;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- 4. TAMPILAN (DOM) ---------- */

function mulaiEtalase() {
  const elCari = document.getElementById('cari');
  const elKategori = document.getElementById('kategori');
  const elJumlah = document.getElementById('jumlah');
  const elStatus = document.getElementById('status');
  const elDaftar = document.getElementById('daftar-produk');

  let produkTersedia = [];
  let siap = false;

  function buatTombol(teks, aksi) {
    const tombol = document.createElement('button');
    tombol.type = 'button';
    tombol.className = 'btn btn-outline';
    tombol.textContent = teks;
    tombol.addEventListener('click', aksi);
    return tombol;
  }

  // jenis: 'loading' | 'error' | 'kosong'
  function tampilkanStatus(jenis, pesan, tombol) {
    const isi = [];
    if (jenis === 'loading') {
      const putar = document.createElement('span');
      putar.className = 'spinner';
      putar.setAttribute('aria-hidden', 'true');
      isi.push(putar);
    }
    const teks = document.createElement('span');
    teks.textContent = pesan;
    isi.push(teks);
    if (tombol) isi.push(tombol);

    elStatus.replaceChildren(...isi);
    elStatus.className = 'status' + (jenis === 'loading' ? '' : ' status-' + jenis);
    elStatus.setAttribute('role', jenis === 'error' ? 'alert' : 'status');
    elStatus.hidden = false;
  }

  function sembunyikanStatus() {
    elStatus.hidden = true;
    elStatus.replaceChildren();
  }

  function buatKartu(produk) {
    const kartu = document.createElement('li');
    kartu.className = 'product-card';

    const gambar = document.createElement('img');
    gambar.alt = produk.title;
    gambar.width = 300;
    gambar.height = 300;
    gambar.loading = 'lazy';
    if (produk.thumbnail) gambar.src = produk.thumbnail;
    gambar.addEventListener('error', () => gambar.classList.add('gambar-gagal'));

    const badan = document.createElement('div');
    badan.className = 'product-body';

    const kategori = document.createElement('p');
    kategori.className = 'product-meta';
    kategori.textContent = labelKategori(produk.category);

    const nama = document.createElement('h2');
    nama.className = 'product-name';
    nama.textContent = produk.title;

    const stok = document.createElement('p');
    stok.className = 'product-stock';
    stok.append('Stok: ' + produk.stock);
    if (stokMenipis(produk.stock)) {
      const lencana = document.createElement('span');
      lencana.className = 'badge-stok';
      lencana.textContent = 'Stok menipis';
      stok.append(lencana);
    }

    const harga = document.createElement('p');
    harga.className = 'product-price';
    harga.textContent = formatHarga(produk.price);

    const tautan = document.createElement('a');
    tautan.className = 'product-link';
    tautan.href = 'form.html?nama=' + encodeURIComponent(produk.title);
    tautan.textContent = 'Buat caption';
    tautan.setAttribute('aria-label', 'Buat caption untuk ' + produk.title);

    badan.append(kategori, nama, stok, harga, tautan);
    kartu.append(gambar, badan);
    return kartu;
  }

  function aturUlang() {
    elCari.value = '';
    elKategori.value = '';
    perbarui();
    elCari.focus();
  }

  function perbarui() {
    if (!siap) return;
    const hasil = saringProduk(produkTersedia, elCari.value, elKategori.value);
    elDaftar.replaceChildren(...hasil.map(buatKartu));
    elJumlah.textContent = 'Menampilkan ' + hasil.length + ' dari ' + produkTersedia.length + ' produk';

    if (hasil.length === 0) {
      tampilkanStatus(
        'kosong',
        'Tidak ada produk yang cocok. Ubah kata kunci atau pilih kategori lain.',
        buatTombol('Atur ulang', aturUlang)
      );
    } else {
      sembunyikanStatus();
    }
  }

  function isiPilihanKategori() {
    const opsi = daftarKategori(produkTersedia).map((slug) => {
      const o = document.createElement('option');
      o.value = slug;
      o.textContent = labelKategori(slug);
      return o;
    });
    const semua = elKategori.options[0];
    elKategori.replaceChildren(semua, ...opsi);
    elKategori.value = '';
  }

  async function muat() {
    siap = false;
    elDaftar.replaceChildren();
    elJumlah.textContent = '';
    tampilkanStatus('loading', 'Memuat data produk...');
    try {
      const semua = await ambilProduk();
      produkTersedia = ambilKategoriProyek(semua);
      isiPilihanKategori();
      siap = true;
      perbarui();
    } catch (err) {
      console.error('Gagal memuat produk:', err);
      tampilkanStatus('error', pesanError(err), buatTombol('Coba lagi', muat));
    }
  }

  elCari.addEventListener('input', perbarui);
  elKategori.addEventListener('change', perbarui);
  muat();
}

if (typeof document !== 'undefined') {
  mulaiEtalase();
}

// Agar fungsi murni bisa dites dengan Node (prak6/test.js). Di browser baris ini diabaikan.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    labelKategori, formatHarga, stokMenipis, ambilKategoriProyek,
    daftarKategori, saringProduk, pesanError
  };
}