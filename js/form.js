/* ==========================================================
   form.js - Generator caption produk
   Bagian 1: aturan validasi dan template (ubah di sini)
   Bagian 2: fungsi murni (tanpa DOM, dites di prak6/test.js)
   Bagian 3: tampilan (DOM) dan event listener
   ========================================================== */
'use strict';

/* ---------- 1. ATURAN DAN TEMPLATE ---------- */

const rules = {
  nama: { min: 3, max: 60 },
  harga: { min: 1000, max: 100000000 }
};

// Kunci harus sama dengan value pada <option> di form.html
const templates = {
  promo: ({ nama, harga, hashtag }) => [
    '🔥 PROMO SPESIAL! 🔥',
    nama + ' sekarang cuma ' + harga + '.',
    'Stok terbatas, pesan sebelum kehabisan! ⏰',
    '',
    hashtag + ' #Promo #DiskonHariIni'
  ].join('\n'),

  santai: ({ nama, harga, hashtag }) => [
    'Lagi cari ' + nama + '? 🙌',
    'Nih, cuma ' + harga + ' aja. Cocok buat nemenin hari-harimu ✨',
    'Yuk, cek sekarang!',
    '',
    hashtag + ' #RekomendasiProduk'
  ].join('\n'),

  formal: ({ nama, harga, hashtag }) => [
    '🛍️ Kami menghadirkan ' + nama + ' dengan harga ' + harga + '.',
    'Kualitas terjamin dan siap dikirim. Hubungi kami untuk informasi pemesanan.',
    '',
    hashtag + ' #ProdukBerkualitas'
  ].join('\n')
};

/* ---------- 2. FUNGSI MURNI ---------- */

function formatRupiah(angka) {
  return 'Rp ' + String(angka).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// "kopi susu aren" menjadi "#KopiSusuAren"; simbol dan aksen dibuang
function buatHashtag(nama) {
  const kata = nama
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  const gabungan = kata
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1).toLowerCase())
    .join('');
  return '#' + gabungan;
}

// Menerima "15000" atau "15.000". Selain itu dianggap tidak valid (NaN).
function bacaHarga(teks) {
  const bersih = teks.trim();
  if (/^\d+$/.test(bersih)) return Number(bersih);
  if (/^\d{1,3}(\.\d{3})+$/.test(bersih)) return Number(bersih.replace(/\./g, ''));
  return NaN;
}

// Mengembalikan pesan error, atau string kosong kalau valid
function validasiNama(nilai) {
  const teks = nilai.trim();
  if (teks === '') return 'Nama produk wajib diisi.';
  if (teks.length < rules.nama.min) return 'Nama produk minimal ' + rules.nama.min + ' karakter.';
  if (teks.length > rules.nama.max) {
    return 'Nama produk maksimal ' + rules.nama.max + ' karakter (sekarang ' + teks.length + ').';
  }
  if (!/\p{L}/u.test(teks)) return 'Nama produk harus mengandung huruf.';
  return '';
}

function validasiHarga(nilai) {
  if (nilai.trim() === '') return 'Harga wajib diisi.';
  const angka = bacaHarga(nilai);
  if (Number.isNaN(angka)) {
    return 'Harga harus berupa angka bulat tanpa huruf, koma, atau simbol. Contoh: 15000 atau 15.000.';
  }
  if (angka < rules.harga.min) return 'Harga minimal ' + formatRupiah(rules.harga.min) + '.';
  if (angka > rules.harga.max) return 'Harga maksimal ' + formatRupiah(rules.harga.max) + '.';
  return '';
}

function buatCaption(nama, harga, kunciTemplate) {
  const buat = templates[kunciTemplate];
  if (!buat) throw new Error('Template "' + kunciTemplate + '" tidak ditemukan');
  const namaRapi = nama.trim().replace(/\s+/g, ' ');
  return buat({
    nama: namaRapi,
    harga: formatRupiah(harga),
    hashtag: buatHashtag(namaRapi)
  });
}

/* ---------- 3. TAMPILAN (DOM) ---------- */

function mulaiForm() {
  const form = document.getElementById('form-caption');
  const inputNama = document.getElementById('nama');
  const inputHarga = document.getElementById('harga');
  const pilihTemplate = document.getElementById('template');
  const elKosong = document.getElementById('kosong');
  const elHasil = document.getElementById('hasil');
  const elRingkasan = document.getElementById('ringkasan');
  const elCaption = document.getElementById('caption');
  const tombolSalin = document.getElementById('btn-salin');
  const elStatusSalin = document.getElementById('status-salin');

  function tampilkanError(input, pesan) {
    document.getElementById('err-' + input.id).textContent = pesan;
    input.setAttribute('aria-invalid', pesan ? 'true' : 'false');
    input.classList.toggle('invalid', Boolean(pesan));
  }

  function periksaNama() {
    const pesan = validasiNama(inputNama.value);
    tampilkanError(inputNama, pesan);
    return pesan === '';
  }

  function periksaHarga() {
    const pesan = validasiHarga(inputHarga.value);
    tampilkanError(inputHarga, pesan);
    return pesan === '';
  }

  function tampilkanHasil() {
    const harga = bacaHarga(inputHarga.value);
    const gaya = pilihTemplate.options[pilihTemplate.selectedIndex].text;
    const nama = inputNama.value.trim().replace(/\s+/g, ' ');

    elRingkasan.textContent = 'Buatkan caption ' + gaya + ' untuk ' + nama + ', ' + formatRupiah(harga) + '.';
    elCaption.textContent = buatCaption(inputNama.value, harga, pilihTemplate.value);
    elStatusSalin.textContent = '';
    elKosong.hidden = true;
    elHasil.hidden = false;
  }

  async function salin(teks) {
    try {
      await navigator.clipboard.writeText(teks);
      return true;
    } catch (err) {
      // Cadangan untuk browser atau konteks yang menolak Clipboard API
      const area = document.createElement('textarea');
      area.value = teks;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      let berhasil = false;
      try { berhasil = document.execCommand('copy'); } catch (e) { berhasil = false; }
      area.remove();
      return berhasil;
    }
  }

  // Validasi langsung saat mengetik
  inputNama.addEventListener('input', periksaNama);
  inputHarga.addEventListener('input', periksaHarga);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const namaValid = periksaNama();
    const hargaValid = periksaHarga();
    if (!namaValid) { inputNama.focus(); return; }
    if (!hargaValid) { inputHarga.focus(); return; }
    tampilkanHasil();
  });

  form.addEventListener('reset', () => {
    tampilkanError(inputNama, '');
    tampilkanError(inputHarga, '');
    elHasil.hidden = true;
    elKosong.hidden = false;
  });

  tombolSalin.addEventListener('click', async () => {
    const berhasil = await salin(elCaption.textContent);
    elStatusSalin.textContent = berhasil ? 'Caption tersalin.' : 'Gagal menyalin. Salin manual dengan menyorot teks.';
  });

  // Dari Etalase: form.html?nama=... mengisi nama produk otomatis
  const namaAwal = new URLSearchParams(window.location.search).get('nama');
  if (namaAwal) {
    inputNama.value = namaAwal;
    periksaNama();
    inputHarga.focus();
  }
}

if (typeof document !== 'undefined') {
  mulaiForm();
}

// Agar fungsi murni bisa dites dengan Node (prak6/test.js). Di browser baris ini diabaikan.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    rules, templates, formatRupiah, buatHashtag, bacaHarga,
    validasiNama, validasiHarga, buatCaption
  };
}