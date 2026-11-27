// ======================================================================
// PROGRAM KASIR KOPI KENANGAN (berbasis terminal / CLI)
// Pengembangan UAS Pemrograman Dasar - Kelas T1-D / Kelompok 1
// ======================================================================

/// <reference types="node" />

// Mengimpor modul "readline" bawaan Node.js supaya program bisa membaca ketikan dari keyboard
import * as readline from "readline";

// Membuat objek "rl" yang menghubungkan input (keyboard) dan output (layar terminal)
const rl = readline.createInterface({
  input: process.stdin,   // sumber input: keyboard
  output: process.stdout, // tujuan output: layar terminal
});

// ----------------------------------------------------------------------
// DEKLARASI TIPE DATA (INTERFACE) - JOBDESK: ELVARETTA
// ----------------------------------------------------------------------
// Struktur data untuk menyimpan setiap transaksi ke dalam array
interface Transaksi {
  id: string;
  namaPelanggan: string;
  kategori: number;       // 1 = Kopi, 2 = Non-Kopi, 3 = Makanan
  namaMenu: string;
  hargaSatuan: number;
  ukuran: number;         // 1 = Regular, 2 = Large, 3 = Jumbo
  jumlah: number;
  isMember: boolean;
  metodeBayar: number;    // 1 = Tunai, 2 = E-Wallet, 3 = Kartu Debit
  namaMetode: string;
  subtotal: number;
  persenDiskon: number;
  nilaiDiskon: number;
  pajak: number;
  biayaAdmin: number;
  totalBayar: number;
}

// Struktur hasil kembalian dari fungsi perhitungan transaksi
interface HasilHitung {
  namaMenu: string;
  hargaSatuan: number;
  namaMetode: string;
  subtotal: number;
  persenDiskon: number;
  nilaiDiskon: number;
  pajak: number;
  biayaAdmin: number;
  totalBayar: number;
}

// ----------------------------------------------------------------------
// DATA TETAP (const) & DATA AWAL / SEED (let) - JOBDESK: ELVARETTA
// ----------------------------------------------------------------------
const NAMA_TOKO: string = "KOPI KENANGAN";   // nama toko (tipe string)
const PAJAK_PERSEN: number = 10;             // pajak 10% (tipe number)
const BIAYA_ADMIN_DEBIT: number = 1000;      // biaya admin kartu debit
const TAMBAHAN_LARGE: number = 4000;         // tambahan harga ukuran Large
const TAMBAHAN_JUMBO: number = 8000;         // tambahan harga ukuran Jumbo

// Penyimpanan data transaksi di memori (Array of Object) dengan 5 data awal (seed)
let daftarTransaksi: Transaksi[] = [
  {
    id: "TRX-001",
    namaPelanggan: "Budi",
    kategori: 1,
    namaMenu: "Es Kopi Susu",
    hargaSatuan: 20000,
    ukuran: 1,
    jumlah: 3,
    isMember: true,
    metodeBayar: 1,
    namaMetode: "Tunai",
    subtotal: 60000,
    persenDiskon: 5,
    nilaiDiskon: 3000,
    pajak: 5700,
    biayaAdmin: 0,
    totalBayar: 62700,
  },
  {
    id: "TRX-002",
    namaPelanggan: "Siti",
    kategori: 2,
    namaMenu: "Matcha Latte",
    hargaSatuan: 28000,
    ukuran: 2,
    jumlah: 1,
    isMember: false,
    metodeBayar: 2,
    namaMetode: "E-Wallet",
    subtotal: 28000,
    persenDiskon: 2,
    nilaiDiskon: 560,
    pajak: 2744,
    biayaAdmin: 0,
    totalBayar: 30200,
  },
  {
    id: "TRX-003",
    namaPelanggan: "Andi",
    kategori: 3,
    namaMenu: "Roti Bakar Cokelat",
    hargaSatuan: 18000,
    ukuran: 1,
    jumlah: 2,
    isMember: true,
    metodeBayar: 3,
    namaMetode: "Kartu Debit",
    subtotal: 36000,
    persenDiskon: 0,
    nilaiDiskon: 0,
    pajak: 3600,
    biayaAdmin: 1000,
    totalBayar: 40600,
  },
  {
    id: "TRX-004",
    namaPelanggan: "Dewi",
    kategori: 1,
    namaMenu: "Es Kopi Susu",
    hargaSatuan: 28000,
    ukuran: 3,
    jumlah: 4,
    isMember: true,
    metodeBayar: 2,
    namaMetode: "E-Wallet",
    subtotal: 112000,
    persenDiskon: 17,
    nilaiDiskon: 19040,
    pajak: 9296,
    biayaAdmin: 0,
    totalBayar: 102300,
  },
  {
    id: "TRX-005",
    namaPelanggan: "Raka",
    kategori: 2,
    namaMenu: "Matcha Latte",
    hargaSatuan: 24000,
    ukuran: 1,
    jumlah: 2,
    isMember: false,
    metodeBayar: 1,
    namaMetode: "Tunai",
    subtotal: 48000,
    persenDiskon: 0,
    nilaiDiskon: 0,
    pajak: 4800,
    biayaAdmin: 0,
    totalBayar: 52800,
  },
];

// Penghitung ID otomatis (dimulai dari 6 karena TRX-001 s.d. TRX-005 sudah ada)
let counterId: number = 6;

// ----------------------------------------------------------------------
// FUNGSI BANTU & FUNGSI PERHITUNGAN UTS - JOBDESK: ELVARETTA
// ----------------------------------------------------------------------
// Fungsi bantu "tanya": menampilkan pertanyaan lalu MENUNGGU jawaban user
function tanya(pertanyaan: string): Promise<string> {
  return new Promise((selesai) => {
    rl.question(pertanyaan, (jawaban) => {
      selesai(jawaban.trim());
    });
  });
}

// Fungsi bantu "formatRupiah": mengubah angka 22000 menjadi teks "Rp 22.000"
function formatRupiah(angka: number): string {
  return "Rp " + angka.toLocaleString("id-ID");
}

// Fungsi "hitungRincianTransaksi": membungkus seluruh logika perhitungan dari UTS
// Menerima parameter input transaksi dan mengembalikan objek HasilHitung
function hitungRincianTransaksi(
  kategori: number,
  jumlah: number,
  isMember: boolean,
  ukuran: number,
  metodeBayar: number
): HasilHitung {
  let namaMenu: string = "";
  let hargaSatuan: number = 0;
  let persenDiskon: number = 0;

  // SWITCH #1 (tingkat 1): menentukan menu dan harga berdasarkan kategori
  switch (kategori) {
    case 1: // ----- kategori Kopi -----
      namaMenu = "Es Kopi Susu";
      hargaSatuan = 20000;

      // IF #1 (tingkat 2): promo kopi khusus member
      if (isMember) {
        // IF #2 (tingkat 3): promo berlaku jika beli minimal 3 gelas
        if (jumlah >= 3) {
          // SWITCH #2 (tingkat 4): besar diskon tergantung ukuran gelas
          switch (ukuran) {
            case 1:
              persenDiskon += 5; // tambah diskon 5%
              break;
            case 2:
              persenDiskon += 10; // tambah diskon 10%
              break;
            case 3:
              persenDiskon += 15; // tambah diskon 15%
              break;
            default:
              persenDiskon += 0;
              break;
          }
        }
      }
      break;

    case 2: // ----- kategori Non-Kopi -----
      namaMenu = "Matcha Latte";
      hargaSatuan = 24000;
      break;

    case 3: // ----- kategori Makanan -----
      namaMenu = "Roti Bakar Cokelat";
      hargaSatuan = 18000;
      break;

    default:
      namaMenu = "Tidak Diketahui";
      hargaSatuan = 0;
      break;
  }

  // IF #3: menambah harga sesuai ukuran (khusus minuman)
  if (kategori === 1 || kategori === 2) {
    if (ukuran === 2) {
      hargaSatuan += TAMBAHAN_LARGE; // compound +=
    } else if (ukuran === 3) {
      hargaSatuan += TAMBAHAN_JUMBO; // compound +=
    }
  }

  let namaMetode: string = "";
  let biayaAdmin: number = 0;

  // SWITCH #3: menentukan aturan berdasarkan metode pembayaran
  switch (metodeBayar) {
    case 1:
      namaMetode = "Tunai";
      break;
    case 2:
      namaMetode = "E-Wallet";
      persenDiskon += 2; // promo e-wallet: diskon bertambah 2%
      break;
    case 3:
      namaMetode = "Kartu Debit";
      biayaAdmin = BIAYA_ADMIN_DEBIT;
      break;
    default:
      namaMetode = "Tidak Diketahui";
      break;
  }

  // Perhitungan subtotal, diskon, pajak, dan pembulatan ke atas kelipatan 100
  const subtotal: number = hargaSatuan * jumlah; // operator *
  const nilaiDiskon: number = Math.round((subtotal * persenDiskon) / 100); // operator /

  let totalSetelahDiskon: number = subtotal;
  totalSetelahDiskon -= nilaiDiskon; // compound -=

  const pajak: number = Math.round((totalSetelahDiskon * PAJAK_PERSEN) / 100);

  let totalBayar: number = totalSetelahDiskon + pajak; // operator +
  totalBayar += biayaAdmin; // compound +=

  const sisaPembulatan: number = totalBayar % 100; // operator %
  // IF #4: pembulatan ke atas kelipatan 100
  if (sisaPembulatan !== 0) {
    totalBayar += 100 - sisaPembulatan; // operator -
  }

  return {
    namaMenu,
    hargaSatuan,
    namaMetode,
    subtotal,
    persenDiskon,
    nilaiDiskon,
    pajak,
    biayaAdmin,
    totalBayar,
  };
}

// ----------------------------------------------------------------------
// BAGIAN FITUR CRUD & SEARCH (KERANGKA PROGRESS 2)
// ----------------------------------------------------------------------

// Fitur Create (Jobdesk: Elvaretta - Diimplementasikan penuh pada Progress 3)
async function tambahTransaksi(): Promise<void> {
  console.log("\n[Info] Fitur Tambah Transaksi (Create) siap dikembangkan pada Progress 3.");
}

// Fitur Read Semua Data (Jobdesk: Rasya - Diimplementasikan penuh pada Progress 4)
function tampilSemuaData(): void {
  console.log("\n[Info] Fitur Lihat Semua Transaksi (Read) siap dikembangkan pada Progress 4.");
}

// Fitur Read Detail by ID (Jobdesk: Rasya - Diimplementasikan penuh pada Progress 4)
async function tampilDetailById(): Promise<void> {
  console.log("\n[Info] Fitur Detail Transaksi by ID (Read) siap dikembangkan pada Progress 4.");
}

// Fitur Update Data (Jobdesk: Rasya - Diimplementasikan penuh pada Progress 5)
async function ubahTransaksi(): Promise<void> {
  console.log("\n[Info] Fitur Ubah Transaksi (Update) siap dikembangkan pada Progress 5.");
}

// Fitur Delete Data (Jobdesk: Sapta - Diimplementasikan penuh pada Progress 5)
async function hapusTransaksi(): Promise<void> {
  console.log("\n[Info] Fitur Hapus Transaksi (Delete) siap dikembangkan pada Progress 5.");
}

// Fitur Search Data (Jobdesk: Sapta - Diimplementasikan penuh pada Progress 6)
async function cariTransaksi(): Promise<void> {
  console.log("\n[Info] Fitur Cari Transaksi (Search) siap dikembangkan pada Progress 6.");
}

// ----------------------------------------------------------------------
// MENU UTAMA BERULANG (LOOP) - JOBDESK: ELVARETTA (PROGRESS 2)
// ----------------------------------------------------------------------
async function main(): Promise<void> {
  // Variabel boolean untuk mengontrol perulangan menu utama
  let programBerjalan: boolean = true;

  // Perulangan while: menu terus tampil sampai user memilih 0 (Keluar)
  while (programBerjalan) {
    console.log("\n==========================================");
    console.log("        SELAMAT DATANG DI " + NAMA_TOKO);
    console.log("==========================================");
    console.log("1. Tambah Transaksi Baru (Create)");
    console.log("2. Lihat Semua Transaksi (Read)");
    console.log("3. Lihat Detail Transaksi by ID (Read)");
    console.log("4. Ubah Transaksi (Update)");
    console.log("5. Hapus Transaksi (Delete)");
    console.log("6. Cari Transaksi (Search)");
    console.log("0. Keluar Program");
    console.log("==========================================");

    const inputMenu: string = await tanya("Pilih menu (0-6) : ");
    const pilihanMenu: number = Number(inputMenu);

    // IF #5: validasi input menu (tidak boleh kosong, bukan NaN, dan harus 0-6)
    if (inputMenu === "" || isNaN(pilihanMenu) || pilihanMenu < 0 || pilihanMenu > 6) {
      console.log("Pilihan tidak valid! Silakan masukkan angka 0 sampai 6.");
      continue; // kembali ke awal perulangan while
    }

    // SWITCH #4: mengarahkan eksekusi sesuai menu yang dipilih
    switch (pilihanMenu) {
      case 1:
        await tambahTransaksi();
        break;
      case 2:
        tampilSemuaData();
        break;
      case 3:
        await tampilDetailById();
        break;
      case 4:
        await ubahTransaksi();
        break;
      case 5:
        await hapusTransaksi();
        break;
      case 6:
        await cariTransaksi();
        break;
      case 0:
        console.log("\n==========================================");
        console.log("   Terima kasih, sampai jumpa kembali!");
        console.log("==========================================");
        programBerjalan = false; // menghentikan perulangan while
        break;
      default:
        console.log("Pilihan menu tidak tersedia.");
        break;
    }
  }

  rl.close(); // menutup pembacaan input karena program selesai
}

// Memanggil fungsi main agar program mulai berjalan
main();