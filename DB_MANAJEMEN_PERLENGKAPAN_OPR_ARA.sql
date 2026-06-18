-- ========================================================
-- SISTEM DATABASE MANAJEMEN LOGISTIK & PERLENGKAPAN OPR ARA 7
-- PROYEK DATABASE IMPLEMENTASI MULTI-LOKASI STOK BARANG
-- ========================================================

-- 1. Membuat dan menggunakan Database
CREATE DATABASE IF NOT EXISTS DB_MANAJEMEN_PERLENGKAPAN_OPR_ARA;
USE DB_MANAJEMEN_PERLENGKAPAN_OPR_ARA;

-- ========================================================
-- KELOMPOK 1: TABEL-TABEL MASTER (BERDIRI SENDIRI)
-- ========================================================

CREATE TABLE tabel_divisi_lain ( 
    id_divisi_lain INT AUTO_INCREMENT PRIMARY KEY,
    nama_divisi VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tabel_vendor ( 
    id_vendor INT AUTO_INCREMENT PRIMARY KEY,
    nama_vendor VARCHAR(100) NOT NULL,
    kontak_vendor VARCHAR(50),
    jenis_vendor VARCHAR(50) 
);

CREATE TABLE tabel_anggota_opr ( 
    id_anggota_opr INT AUTO_INCREMENT PRIMARY KEY,
    nama_anggota VARCHAR(100) NOT NULL,
    contact_anggota_opr VARCHAR(20) NOT NULL UNIQUE,
    jabatan ENUM('Kepala Subdivisi', 'Staf Ahli', 'Staf') NOT NULL 
);

CREATE TABLE tabel_kategori ( 
    id_kategori INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tabel_lokasi_barang ( 
    id_lokasi_barang INT AUTO_INCREMENT PRIMARY KEY,
    nama_lokasi VARCHAR(100) NOT NULL, 
    kategori_lokasi ENUM('Perpustakaan', 'Tower 2', 'Tempat Roadshow', 'Anggota OPR', 'Lokasi Lain') NOT NULL,
    keterangan_tambahan TEXT
);


-- ========================================================
-- KELOMPOK 2: ALUR HULU (REQUEST & PENGADAAN BARANG)
-- ========================================================

CREATE TABLE tabel_pic_request ( 
    id_pic_request INT AUTO_INCREMENT PRIMARY KEY,
    id_divisi_lain INT NOT NULL,
    nama_pic VARCHAR(100) NOT NULL,
    contact_pic VARCHAR(20) NOT NULL UNIQUE,
    CONSTRAINT fk_pic_divisi FOREIGN KEY (id_divisi_lain) REFERENCES tabel_divisi_lain(id_divisi_lain) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE tabel_request ( 
    id_request INT AUTO_INCREMENT PRIMARY KEY,
    id_pic_request INT NOT NULL,
    nama_barang_request VARCHAR(150) NOT NULL,
    jumlah_kebutuhan INT NOT NULL CHECK (jumlah_kebutuhan > 0),
    tgl_request DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_request ENUM('Pending', 'Disetujui', 'Ditolak') DEFAULT 'Pending',
    CONSTRAINT fk_request_pic FOREIGN KEY (id_pic_request) REFERENCES tabel_pic_request(id_pic_request) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE tabel_pengadaan ( 
    id_pengadaan INT AUTO_INCREMENT PRIMARY KEY,
    id_request INT NOT NULL,
    metode_pengadaan ENUM('Ready/Gudang', 'Beli', 'Sewa_Vendor', 'Buat Sendiri') NOT NULL,
    status_desain ENUM('N/A', 'Menunggu_Desain', 'Desain_Siap', 'Selesai_Produksi') DEFAULT 'N/A',
    id_vendor INT DEFAULT NULL,
    tgl_eksekusi DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pengadaan_request FOREIGN KEY (id_request) REFERENCES tabel_request(id_request) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pengadaan_vendor FOREIGN KEY (id_vendor) REFERENCES tabel_vendor(id_vendor) ON UPDATE CASCADE ON DELETE SET NULL
);


-- ========================================================
-- KELOMPOK 3: INVENTARIS MULTI-LOKASI & ALUR HILIR
-- ========================================================

CREATE TABLE tabel_master_barang (
    id_master_barang INT AUTO_INCREMENT PRIMARY KEY,
    nama_barang VARCHAR(150) NOT NULL UNIQUE, 
    id_pengadaan INT DEFAULT NULL,
    CONSTRAINT fk_master_pengadaan FOREIGN KEY (id_pengadaan) REFERENCES tabel_pengadaan(id_pengadaan) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE tabel_stok_lokasi_barang ( 
    id_stok_lokasi INT AUTO_INCREMENT PRIMARY KEY,
    id_master_barang INT NOT NULL,  
    id_lokasi_barang INT NOT NULL,  
    jumlah_stok INT DEFAULT 1 CHECK (jumlah_stok >= 0),
    status_ketersediaan ENUM('Tersedia', 'Dipinjam', 'Habis', 'Perlu_Refill', 'Rusak') DEFAULT 'Tersedia',
    CONSTRAINT fk_stok_ke_master FOREIGN KEY (id_master_barang) REFERENCES tabel_master_barang(id_master_barang) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_stok_ke_lokasi FOREIGN KEY (id_lokasi_barang) REFERENCES tabel_lokasi_barang(id_lokasi_barang) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE tabel_relasi_kategori (
    id_relasi_kategori INT AUTO_INCREMENT PRIMARY KEY,
    id_master_barang INT NOT NULL,
    id_kategori INT NOT NULL,
    CONSTRAINT fk_pivot_master_barang FOREIGN KEY (id_master_barang) REFERENCES tabel_master_barang(id_master_barang) ON DELETE CASCADE,
    CONSTRAINT fk_pivot_kategori FOREIGN KEY (id_kategori) REFERENCES tabel_kategori(id_kategori) ON DELETE CASCADE
);

CREATE TABLE tabel_pemenuhan_permintaan (
    id_pemenuhan_permintaan INT AUTO_INCREMENT PRIMARY KEY,
    id_request INT NOT NULL, 
    id_stok_lokasi INT NOT NULL,
    jumlah_dipenuhi INT NOT NULL CHECK (jumlah_dipenuhi > 0),
    tgl_dipenuhi DATETIME DEFAULT CURRENT_TIMESTAMP,
    catatan_fulfillment TEXT DEFAULT NULL,
    CONSTRAINT fk_pp_request FOREIGN KEY (id_request) REFERENCES tabel_request(id_request) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_pp_stok_lokasi FOREIGN KEY (id_stok_lokasi) REFERENCES tabel_stok_lokasi_barang(id_stok_lokasi) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE tabel_peminjaman (
    id_peminjaman INT AUTO_INCREMENT PRIMARY KEY,
    id_anggota_opr INT NOT NULL,
    tgl_pinjam DATETIME DEFAULT CURRENT_TIMESTAMP,
    tgl_kembali DATETIME DEFAULT NULL,
    CONSTRAINT fk_peminjaman_anggota FOREIGN KEY (id_anggota_opr) REFERENCES tabel_anggota_opr(id_anggota_opr) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE tabel_detail_pinjam (
    id_detail_pinjam INT AUTO_INCREMENT PRIMARY KEY, 
    id_peminjaman INT NOT NULL,
    id_stok_lokasi INT NOT NULL,
    jumlah_pinjam INT NOT NULL DEFAULT 1 CHECK (jumlah_pinjam > 0),
    kondisi_keluar VARCHAR(150) NOT NULL,
    kondisi_masuk VARCHAR(150) DEFAULT 'Belum Kembali',
    CONSTRAINT fk_detail_peminjaman FOREIGN KEY (id_peminjaman) REFERENCES tabel_peminjaman(id_peminjaman) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_detail_stok_lokasi FOREIGN KEY (id_stok_lokasi) REFERENCES tabel_stok_lokasi_barang(id_stok_lokasi) ON UPDATE CASCADE ON DELETE RESTRICT
);