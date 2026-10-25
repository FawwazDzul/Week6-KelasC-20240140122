/* ==========================================================
   test.js - latihan pengujian fungsi murni (tanpa library)
   Jalankan : node prak6/test.js
   Yang dites: fungsi di js/index.js dan js/form.js yang tidak
   menyentuh DOM. Kode DOM dites manual lewat browser.
   ========================================================== */
const assert = require('node:assert/strict');
const etalase = require('../js/index.js');
const caption = require('../js/form.js');

let gagal = 0;
function uji(nama, fungsi) {
  try {
    fungsi();
    console.log('  ok     ' + nama);
  } catch (err) {
    gagal++;
    console.log('  GAGAL  ' + nama + '\n         ' + err.message.split('\n')[0]);
  }
}

const contohProduk = [
  { title: 'iPhone 15', category: 'smartphones', price: 999, stock: 5 },
  { title: 'Galaxy Tab S9', category: 'tablets', price: 799.5, stock: 40 },
  { title: 'MacBook Air', category: 'laptops', price: 1299, stock: 10 },
  { title: 'Red Lipstick', category: 'beauty', price: 12.99, stock: 91 }
];

console.log('Etalase');
uji('formatHarga memberi dua desimal dan pemisah ribuan', () => {
  assert.equal(etalase.formatHarga(9.9), '$9.90');
  assert.equal(etalase.formatHarga(1899.99), '$1,899.99');
});
uji('stokMenipis: di bawah 10 menipis, 10 ke atas aman', () => {
  assert.equal(etalase.stokMenipis(9), true);
  assert.equal(etalase.stokMenipis(10), false);
  assert.equal(etalase.stokMenipis(undefined), false);
});
uji('saringProduk mencari nama tanpa membedakan huruf besar kecil', () => {
  const hasil = etalase.saringProduk(contohProduk, '  IPHONE ', '');
  assert.deepEqual(hasil.map((p) => p.title), ['iPhone 15']);
});
uji('saringProduk menggabungkan kata kunci dan kategori', () => {
  assert.equal(etalase.saringProduk(contohProduk, 'mac', 'laptops').length, 1);
  assert.equal(etalase.saringProduk(contohProduk, 'mac', 'tablets').length, 0);
});
uji('ambilKategoriProyek membuang kategori di luar tema', () => {
  const hasil = etalase.ambilKategoriProyek(contohProduk);
  assert.equal(hasil.some((p) => p.category === 'beauty'), false);
  assert.equal(hasil.length, 3);
});
uji('ambilKategoriProyek memakai semua produk bila tidak ada yang cocok', () => {
  const lain = [{ title: 'Apple', category: 'groceries', price: 1, stock: 1 }];
  assert.equal(etalase.ambilKategoriProyek(lain).length, 1);
});
uji('pesanError membedakan timeout, jaringan, dan HTTP', () => {
  const batas = new Error('x'); batas.name = 'AbortError';
  assert.match(etalase.pesanError(batas), /10 detik/);
  assert.match(etalase.pesanError(new TypeError('Failed to fetch')), /koneksi internet/);
  assert.match(etalase.pesanError(new Error('HTTP 500')), /HTTP 500/);
});

console.log('Caption');
uji('formatRupiah memakai titik sebagai pemisah ribuan', () => {
  assert.equal(caption.formatRupiah(1000), 'Rp 1.000');
  assert.equal(caption.formatRupiah(15000), 'Rp 15.000');
  assert.equal(caption.formatRupiah(100000000), 'Rp 100.000.000');
});
uji('buatHashtag mengubah nama menjadi CamelCase', () => {
  assert.equal(caption.buatHashtag('kopi susu aren'), '#KopiSusuAren');
});
uji('buatHashtag membuang simbol dan aksen', () => {
  assert.equal(caption.buatHashtag('Kopi & Susu 2!'), '#KopiSusu2');
  assert.equal(caption.buatHashtag('Café Crème'), '#CafeCreme');
});
uji('validasiNama: wajib, panjang, dan harus ada huruf', () => {
  assert.notEqual(caption.validasiNama(''), '');
  assert.notEqual(caption.validasiNama('  ab  '), '');
  assert.notEqual(caption.validasiNama('a'.repeat(61)), '');
  assert.notEqual(caption.validasiNama('12345'), '');
  assert.equal(caption.validasiNama('Kopi'), '');
  assert.equal(caption.validasiNama('a'.repeat(60)), '');
});
uji('bacaHarga menerima angka polos dan format titik ribuan saja', () => {
  assert.equal(caption.bacaHarga('15000'), 15000);
  assert.equal(caption.bacaHarga('15.000'), 15000);
  assert.equal(caption.bacaHarga('1.500.000'), 1500000);
  for (const salah of ['abc', '1.5', '15,000', '1e5', 'Rp 1000', '-5000']) {
    assert.ok(Number.isNaN(caption.bacaHarga(salah)), salah + ' seharusnya ditolak');
  }
});
uji('validasiHarga: batas bawah dan atas', () => {
  assert.notEqual(caption.validasiHarga(''), '');
  assert.notEqual(caption.validasiHarga('999'), '');
  assert.notEqual(caption.validasiHarga('100000001'), '');
  assert.equal(caption.validasiHarga('1000'), '');
  assert.equal(caption.validasiHarga('100.000.000'), '');
});
uji('buatCaption memuat nama, harga, dan hashtag di setiap template', () => {
  for (const kunci of Object.keys(caption.templates)) {
    const hasil = caption.buatCaption('kopi  susu aren', 15000, kunci);
    assert.ok(hasil.includes('kopi susu aren'), kunci + ': nama');
    assert.ok(hasil.includes('Rp 15.000'), kunci + ': harga');
    assert.ok(hasil.includes('#KopiSusuAren'), kunci + ': hashtag');
  }
});
uji('buatCaption menolak template yang tidak ada', () => {
  assert.throws(() => caption.buatCaption('Kopi', 5000, 'tidak-ada'));
});

console.log('\n' + (gagal === 0 ? 'Semua tes lulus.' : gagal + ' tes gagal.'));
process.exitCode = gagal === 0 ? 0 : 1;