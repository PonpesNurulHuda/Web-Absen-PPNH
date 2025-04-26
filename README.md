# Web Absensi Pondok Pesantren

## Deskripsi

Aplikasi web sederhana untuk mengelola dan menampilkan data absensi santri di sebuah pondok pesantren. Aplikasi ini dibangun menggunakan HTML, CSS (dengan Bootstrap), dan JavaScript vanilla untuk frontend, serta menggunakan file JSON sebagai sumber data dummy.

## Fitur

*   **Dashboard Utama (`index.html`):** Halaman selamat datang dan navigasi utama.
*   **Data Santri (`data_santri.html`):**
    *   Menampilkan daftar semua santri beserta ID dan tingkatannya dalam format tabel.
    *   Filter berdasarkan Tingkatan.
    *   Tombol "Detail" (fungsi detail belum diimplementasikan sepenuhnya).
*   **Data Tingkatan (`data_tingkatan.html`):**
    *   Menampilkan daftar semua tingkatan yang tersedia.
    *   Menampilkan jumlah santri per tingkatan.
    *   Tombol "Detail" untuk melihat detail absensi per tingkatan.
*   **Detail Tingkatan (`tingkatan_detail.html`):**
    *   Menampilkan daftar santri yang terdaftar pada tingkatan yang dipilih.
    *   Menampilkan tabel absensi santri untuk tingkatan tersebut.
    *   Tabel absensi menampilkan data untuk beberapa hari terakhir (default 7 hari terakhir yang ada data).
    *   Kolom tanggal diformat sebagai `DD MMM` (misal: `25 APR`).
    *   Status absensi disingkat (H: Hadir, I: Izin, S: Sakit, A: Alpa).
    *   Filter absensi berdasarkan:
        *   Jam Pelajaran (Sore, Malam Jam 1, Malam Jam 2 - sesuai tingkatan).
        *   Rentang Tanggal (Hari Ini, Kemarin, Minggu Ini, Bulan Ini, Semua Data).

## Teknologi yang Digunakan

*   **Frontend:**
    *   HTML5
    *   CSS3
    *   JavaScript (Vanilla JS)
    *   [Bootstrap 5.3](https://getbootstrap.com/) (via CDN) - Untuk styling dan komponen UI.
*   **Data:**
    *   JSON (`data_santri.json`, `data_absensi.json`) - Sebagai penyimpanan data dummy.

## Struktur File

```
.
├── index.html              # Halaman Dashboard Utama
├── data_santri.html        # Halaman Daftar Santri
├── data_tingkatan.html     # Halaman Daftar Tingkatan
├── tingkatan_detail.html   # Halaman Detail Tingkatan & Absensi
├── style.css               # Custom CSS (saat ini minimal)
├── script.js               # Logika JavaScript untuk semua halaman
├── data_santri.json        # Data dummy santri
└── data_absensi.json       # Data dummy absensi
```

## Data Files

*   **`data_santri.json`**: Berisi array objek santri. Setiap objek memiliki:
    *   `id`: Nomor unik santri (integer).
    *   `nama`: Nama lengkap santri (string).
    *   `tingkatan`: Tingkatan yang diikuti santri (string, misal: "TPQ 1", "Alfiyyah").
*   **`data_absensi.json`**: Berisi array objek absensi. Setiap objek memiliki:
    *   `santri_id`: ID santri yang bersangkutan (integer, merujuk ke `id` di `data_santri.json`).
    *   `tingkatan`: Tingkatan saat absensi dicatat (string).
    *   `tanggal`: Tanggal absensi (string, format `YYYY-MM-DD`).
    *   `jam_pelajaran`: Jam pelajaran absensi (string, misal: "Sore", "Malam Jam 1").
    *   `status`: Status kehadiran (string: "Hadir", "Izin", "Sakit", "Alpa").

## Setup dan Menjalankan Aplikasi

Karena aplikasi ini menggunakan `fetch` API di JavaScript untuk memuat file JSON lokal, Anda tidak bisa membukanya langsung dari file system (`file://...`) karena akan terblokir oleh kebijakan keamanan browser (CORS).

Anda perlu menjalankannya melalui server HTTP lokal. Cara termudah adalah menggunakan modul `http.server` bawaan Python (jika Anda memiliki Python 3 terinstall):

1.  **Buka Terminal atau Command Prompt.**
2.  **Navigasi ke direktori utama proyek ini:**
    ```bash
    cd /path/ke/folder/webAbsensi
    ```
3.  **Jalankan server HTTP Python:**
    ```bash
    python3 -m http.server 8000
    # atau jika python3 tidak dikenali, coba:
    # python -m http.server 8000
    ```
4.  **Buka browser Anda** dan akses alamat: `http://localhost:8000`

Server akan berjalan di terminal tersebut. Biarkan terminal tetap terbuka selama Anda menggunakan aplikasi. Untuk menghentikan server, kembali ke terminal dan tekan `Ctrl + C`.

## Potensi Pengembangan Selanjutnya

*   Implementasi fungsi tombol "Detail" pada halaman Data Santri.
*   Penggunaan modal (popup) Bootstrap untuk menampilkan detail daripada halaman terpisah.
*   Integrasi dengan backend (misalnya Node.js/Express, Python/Flask/Django, PHP) dan database (SQL atau NoSQL) untuk pengelolaan data yang sebenarnya.
*   Sistem login dan autentikasi.
*   Fitur input/edit data absensi dan data santri.
*   Fitur rekapitulasi absensi yang lebih canggih (per santri, per tingkatan, per periode).
*   Peningkatan UI/UX.