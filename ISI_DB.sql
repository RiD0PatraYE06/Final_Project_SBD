-- ========================================================
-- RESTRUCTURED AUTOMATIC DATA SEEDING (URUTAN TERBALIK & BERBEDA)
-- ========================================================

-- ========================================================
-- KELOMPOK 1: SEMUA TABEL MASTER (Berdiri Sendiri / Independen)
-- ========================================================

-- [Master 1] Insert Vendor (Dipindah ke paling atas)
INSERT INTO tabel_vendor (nama_vendor, kontak_vendor, jenis_vendor)
VALUES 
    ('Surabaya Stage & Production', '085258735435', 'Rental Perlengkapan Panggung, Lighting, & Rigging'),
    ('Gubeng Multimedia Audio', '085258842919', 'Penyewaan Sound System Concert & Audio Control');

-- [Master 2] Insert Kategori
INSERT INTO tabel_kategori (nama_kategori)
VALUES 
    ('Furnitur'),
    ('Alat Musik'),
    ('Perangkat Audio'),
    ('Perangkat Elektronik'),
    ('Perangkat Display'),
    ('Perangkat Lighting'),
    ('Kabel'),
    ('Konektor'),
    ('Media Cetak'),
    ('Media Publikasi'),
    ('Hiasan & Dekorasi'),
    ('Lain-lain');

-- [Master 3] Insert Anggota OPR Intern
INSERT INTO tabel_anggota_opr (nama_anggota, contact_anggota_opr, jabatan)
VALUES
    ('Kasubdiv OPR 1', '081601020001', 'Kepala Subdivisi'),
    ('Stafli OPR 1', '081601030001', 'Staf Ahli'),
    ('Stafli OPR 2', '081601030002', 'Staf Ahli'),
    ('Stafli OPR 3', '081601030003', 'Staf Ahli'),
    ('Stafli OPR 4', '081601030004', 'Staf Ahli'),
    ('Staf OPR 1', '081601040001', 'Staf'),
    ('Staf OPR 2', '081601040002', 'Staf'),
    ('Staf OPR 3', '081601040003', 'Staf'),
    ('Staf OPR 4', '081601040004', 'Staf'),
    ('Staf OPR 5', '081601040005', 'Staf'),
    ('Staf OPR 6', '081601040006', 'Staf'),
    ('Staf OPR 7', '081601040007', 'Staf'),
    ('Staf OPR 8', '081601040008', 'Staf');

-- [Master 4] Insert Lokasi Riil Gedung
INSERT INTO tabel_lokasi_barang
    (nama_lokasi,               kategori_lokasi,        keterangan_tambahan)
VALUES
    ('Perpustakaan Lantai 6',   'Perpustakaan',         'Tempat penyimpanan barang-barang di Perpustakaan'),
    ('Lobby TW2',               'Tower 2',              'Lobby di lantai 1 Tower 2'),
    ('Kolam TW2',               'Tower 2',              'Kolam di lantai 1 Tower 2'),
    ('Ruang TU',                'Tower 2',              'Kantor Tata Usaha di lantai 2 Tower 2'),
    ('Auditorium TW 2',         'Tower 2',              'Auditorium di lantai 2 Tower 2'),
    ('Ruang Kelas 702',         'Tower 2',              'Ruang kelas lantai 7'),
    ('Ruang Kelas 703',         'Tower 2',              'Ruang kelas lantai 7'),
    ('Ruang Kelas 704',         'Tower 2',              'Ruang kelas lantai 7'),
    ('Ruang Kelas 705',         'Tower 2',              'Ruang kelas lantai 7'),
    ('Lab SOC',                 'Tower 2',              'Laboratorium Security Operations Center di lantai 9 Tower 2'),
    ('Lab KCKS',                'Tower 2',              'Laboratorium Kota Cerdas dan Keamanan Siber di lantai 9 Tower 2'),
    ('Multifunction Room',      'Tower 2',              'Ruang serbaguna di lantai 11 Tower 2'),
    ('Area Roadshow',           'Tempat Roadshow',      'Sekolah SMA/SMK tempat pelaksanaan kegiatan roadshow'),
    ('Dibawa oleh Staf OPR',    'Anggota OPR',          'Aset yang dipegang langsung oleh internal panitia OPR');

-- [Master 5] Insert Divisi Luar
INSERT INTO tabel_divisi_lain (nama_divisi)
VALUES 
    ('Divisi BPH'),
    -- ========================================================
    ('Divisi OlimpIT'),
    -- ========================================================
    ('Divisi Data Science'),
    -- ========================================================
    ('Divisi CTF'),
    -- ========================================================
    ('Divisi Admin & LO'),
    ('Subdivisi Admin'),
    ('Subdivisi Liaison Officer'), 
    -- ========================================================
    ('Divisi Event'),
    ('Subdivisi Competition'),
    ('Subdivisi ExploIT'), 
    -- ========================================================
    ('Divisi Technical'),
    ('Subdivisi Security and License'),
    -- ========================================================
    ('Divisi Finance'),
    ('Subdivisi Sponsorship'),
    ('Subdivisi Fundraising'),
    -- ========================================================
    ('Divisi IT Dev'),
    -- ========================================================
    ('Divisi Creative'),
    ('Subdivisi Design & Documentation'),
    ('Subdivisi Social Media & Marketing'),
    -- ========================================================
    ('Divisi Public Relation'),
    -- ========================================================
    ('Divisi Roadshow');

-- [Master 6] Insert Master Barang (Gabungan barang esensial & panggung exploit jadi satu insert)
INSERT INTO tabel_master_barang (nama_barang)
VALUES 
    ('Laptop OPR'),
    -- ========================================================
    ('Mic Wireless'),
    ('Speaker'),
    -- ========================================================
    ('TV Monitor 100 Inch'),
    -- ========================================================
    ('Kabel Olor 10 Meter'),
    ('Kabel HDMI 5 Meter'),
    -- ========================================================
    ('Brosur Roadshow'),
    ('Poster Roadshow'),
    ('X-Banner & Stand Roadshow'),
    -- ========================================================
    ('Paket Lighting Panggung'),
    ('Audio Control & Mixer Board'),
    ('Speaker Besar Panggung (Line Array)'),
    ('Karpet Merah Panggung (Meteran)');


-- ========================================================
-- KELOMPOK 2: TABEL TRANSAKSI / OPERASIONAL UTAMA
-- ========================================================

-- [Transaksi 1] Insert Semua PIC Request (Satu divisi langsung dimasukkan semua PIC-nya)
INSERT INTO tabel_pic_request (id_divisi_lain, nama_pic, contact_pic)
VALUES
((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Divisi Roadshow'), 'PIC Roadshow 2', '082100040002'),
((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Divisi OlimpIT'), 'PIC OlimpIT 5', '081100040005'),
((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Divisi Data Science'), 'PIC Data Science 3', '081200040003'),
((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Divisi CTF'), 'PIC CTF 4', '081300040004'),
((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Subdivisi ExploIT'), 'Stafli ExploIT 1', '081502030001'),
((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Subdivisi ExploIT'), 'PIC ExploIT 3', '081502040003');

-- [Transaksi 2] Insert Semua Log Request Hulu (Gabungan Roadshow & Stafli ExploIT)
INSERT INTO tabel_request (id_pic_request, nama_barang_request, jumlah_kebutuhan, status_request)
VALUES
((SELECT id_pic_request FROM tabel_pic_request WHERE nama_pic = 'PIC Roadshow 2'), 'X-Banner & Stand Roadshow', 2, 'Disetujui'),
((SELECT id_pic_request FROM tabel_pic_request WHERE nama_pic = 'Stafli ExploIT 1'), 'Paket Lighting Panggung', 1, 'Disetujui'),
((SELECT id_pic_request FROM tabel_pic_request WHERE nama_pic = 'Stafli ExploIT 1'), 'Audio Control & Mixer Board', 1, 'Disetujui'),
((SELECT id_pic_request FROM tabel_pic_request WHERE nama_pic = 'Stafli ExploIT 1'), 'Speaker Besar Panggung (Line Array)', 4, 'Disetujui'),
((SELECT id_pic_request FROM tabel_pic_request WHERE nama_pic = 'Stafli ExploIT 1'), 'Karpet Merah Panggung (Meteran)', 12, 'Disetujui');

-- [Transaksi 3] Insert Alur Pengadaan Hilir (Mapping dari tabel_request ke Vendor)
INSERT INTO tabel_pengadaan (id_request, metode_pengadaan, status_desain, id_vendor)
VALUES
((SELECT id_request FROM tabel_request WHERE nama_barang_request = 'X-Banner & Stand Roadshow' ORDER BY id_request DESC LIMIT 1), 'Buat Sendiri', 'Selesai_Produksi', NULL),
((SELECT id_request FROM tabel_request WHERE nama_barang_request = 'Paket Lighting Panggung' ORDER BY id_request DESC LIMIT 1), 'Sewa_Vendor', 'N/A', (SELECT id_vendor FROM tabel_vendor WHERE nama_vendor = 'Surabaya Stage & Production')),
((SELECT id_request FROM tabel_request WHERE nama_barang_request = 'Audio Control & Mixer Board' ORDER BY id_request DESC LIMIT 1), 'Sewa_Vendor', 'N/A', (SELECT id_vendor FROM tabel_vendor WHERE nama_vendor = 'Gubeng Multimedia Audio')),
((SELECT id_request FROM tabel_request WHERE nama_barang_request = 'Speaker Besar Panggung (Line Array)' ORDER BY id_request DESC LIMIT 1), 'Sewa_Vendor', 'N/A', (SELECT id_vendor FROM tabel_vendor WHERE nama_vendor = 'Gubeng Multimedia Audio')),
((SELECT id_request FROM tabel_request WHERE nama_barang_request = 'Karpet Merah Panggung (Meteran)' ORDER BY id_request DESC LIMIT 1), 'Sewa_Vendor', 'N/A', (SELECT id_vendor FROM tabel_vendor WHERE nama_vendor = 'Surabaya Stage & Production'));


-- ========================================================
-- KELOMPOK 3: TABEL JUNCTION / RELASI MANY-TO-MANY
-- ========================================================

-- [Junction] Seeding Alokasi Volume Stok Multi-Lokasi (Gabungan Semua Data Stok Barang)
INSERT INTO tabel_stok_lokasi_barang (id_master_barang, id_lokasi_barang, jumlah_stok, status_ketersediaan) VALUES
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Laptop OPR'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Dibawa oleh Staf OPR'), 5, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Mic Wireless'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Ruang Kelas 702'), 2, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Mic Wireless'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Lab SOC'), 2, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Speaker'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Ruang Kelas 702'), 1, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Speaker'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Lab SOC'), 1, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'TV Monitor 100 Inch'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Ruang Kelas 702'), 1, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'TV Monitor 100 Inch'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Lab SOC'), 1, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Kabel Olor 10 Meter'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Ruang TU'), 10, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Kabel HDMI 5 Meter'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Ruang TU'), 3, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Brosur Roadshow'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Dibawa oleh Staf OPR'), 200, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Poster Roadshow'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Dibawa oleh Staf OPR'), 10, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'X-Banner & Stand Roadshow'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Dibawa oleh Staf OPR'), 2, 'Tersedia'),
-- Stok Barang Baru Event Panggung ExploIT (Ikut digabung ke Junction paling bawah)
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Paket Lighting Panggung'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Kolam TW2'), 1, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Audio Control & Mixer Board'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Kolam TW2'), 1, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Speaker Besar Panggung (Line Array)'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Kolam TW2'), 4, 'Tersedia'),
((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Karpet Merah Panggung (Meteran)'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Kolam TW2'), 12, 'Tersedia');


-- =========================================================
-- Barang dengan Multi-Kategori
-- =========================================================

INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (1, 4);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (2, 3);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (2, 4);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (3, 3);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (3, 4);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (4, 4);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (4, 5);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (5, 7);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (6, 7);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (6, 8);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (7, 9);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (7, 10);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (8, 9);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (8, 10);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (9, 9);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (9, 10);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (10, 4);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (10, 6);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (11, 3);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (11, 4);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (12, 3);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (12, 4);
INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (13, 1);