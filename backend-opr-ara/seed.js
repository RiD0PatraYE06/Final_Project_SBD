const db = require('./config/mysql');
require('dotenv').config();

const runSeeding = async () => {
    console.log('⏳ Memulai proses injeksi data otomatis ke MySQL...');
    
    try {
        // [Master 1] Insert Vendor
        console.log('=> Mengisi tabel_vendor...');
        const qVendor = `
            INSERT INTO tabel_vendor (nama_vendor, kontak_vendor, jenis_vendor)
            VALUES 
                ('Surabaya Stage & Production', '085258735435', 'Rental Perlengkapan Panggung, Lighting, & Rigging'),
                ('Gubeng Multimedia Audio', '085258842919', 'Penyewaan Sound System Concert & Audio Control');
        `;
        await db.query(qVendor);

        // [Master 2] Insert Kategori
        console.log('=> Mengisi tabel_kategori...');
        const qKategori = `
            INSERT INTO tabel_kategori (nama_kategori)
            VALUES 
                ('Furnitur'), ('Alat Musik'), ('Perangkat Audio'), ('Perangkat Elektronik'),
                ('Perangkat Display'), ('Perangkat Lighting'), ('Kabel'), ('Konektor'),
                ('Media Cetak'), ('Media Publikasi'), ('Hiasan & Dekorasi'), ('Lain-lain');
        `;
        await db.query(qKategori);

        // [Master 3] Insert Anggota OPR Intern
        console.log('=> Mengisi tabel_anggota_opr...');
        const qAnggota = `
            INSERT INTO tabel_anggota_opr (nama_anggota, contact_anggota_opr, jabatan)
            VALUES
                ('Kasubdiv OPR', '081601020001', 'Kepala Subdivisi'),
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
        `;
        await db.query(qAnggota);

        // [Master 4] Insert Lokasi Riil Gedung
        console.log('=> Mengisi tabel_lokasi_barang...');
        const qLokasi = `
            INSERT INTO tabel_lokasi_barang (nama_lokasi, kategori_lokasi, keterangan_tambahan)
            VALUES
                ('Perpustakaan Lantai 6', 'Perpustakaan', 'Tempat penyimpanan barang-barang di Perpustakaan'),
                ('Lobby TW2', 'Tower 2', 'Lobby di lantai 1 Tower TW 2'),
                ('Kolam TW2', 'Tower 2', 'Kolam di lantai 1 Tower TW 2'),
                ('Ruang TU', 'Tower 2', 'Kantor Tata Usaha di lantai 2 Tower TW 2'),
                ('Auditorium TW 2', 'Tower 2', 'Auditorium di lantai 2 Tower TW 2'),
                ('Ruang Kelas 702', 'Tower 2', 'Ruang kelas lantai 7'),
                ('Ruang Kelas 703', 'Tower 2', 'Ruang kelas lantai 7'),
                ('Ruang Kelas 704', 'Tower 2', 'Ruang kelas lantai 7'),
                ('Ruang Kelas 705', 'Tower 2', 'Ruang kelas lantai 7'),
                ('Lab SOC', 'Tower 2', 'Laboratorium Security Operations Center di lantai 9 Tower TW 2'),
                ('Lab KCKS', 'Tower 2', 'Laboratorium Kota Cerdas dan Keamanan Siber di lantai 9 Tower TW 2'),
                ('Multifunction Room', 'Tower 2', 'Ruang serbaguna di lantai 11 Tower TW 2'),
                ('Area Roadshow', 'Tempat Roadshow', 'Sekolah SMA/SMK tempat pelaksanaan kegiatan roadshow'),
                ('Dibawa oleh Staf OPR', 'Anggota OPR', 'Aset yang dipegang langsung oleh internal panitia OPR');
        `;
        await db.query(qLokasi);

        // [Master 5] Insert Divisi Luar
        console.log('=> Mengisi tabel_divisi_lain...');
        const qDivisi = `
            INSERT INTO tabel_divisi_lain (nama_divisi)
            VALUES 
                ('Divisi BPH'), ('Divisi OlimpIT'), ('Divisi Data Science'), ('Divisi CTF'),
                ('Divisi Admin & LO'), ('Subdivisi Admin'), ('Subdivisi Liaison Officer'), 
                ('Divisi Event'), ('Subdivisi Competition'), ('Subdivisi ExploIT'), 
                ('Divisi Technical'), ('Subdivisi Security and License'), ('Divisi Finance'),
                ('Subdivisi Sponsorship'), ('Subdivisi Fundraising'), ('Divisi IT Dev'),
                ('Divisi Creative'), ('Subdivisi Design & Documentation'), 
                ('Subdivisi Social Media & Marketing'), ('Divisi Public Relation'), ('Divisi Roadshow');
        `;
        await db.query(qDivisi);

        // [Master 6] Insert Master Barang
        console.log('=> Mengisi tabel_master_barang...');
        const qMasterBarang = `
            INSERT INTO tabel_master_barang (nama_barang)
            VALUES 
                ('Laptop OPR'), ('Mic Wireless'), ('Speaker'), ('TV Monitor 100 Inch'),
                ('Kabel Olor 10 Meter'), ('Kabel HDMI 5 Meter'), ('Brosur Roadshow'),
                ('Poster Roadshow'), ('X-Banner & Stand Roadshow'), ('Paket Lighting Panggung'),
                ('Audio Control & Mixer Board'), ('Speaker Besar Panggung (Line Array)'),
                ('Karpet Merah Panggung (Meteran)');
        `;
        await db.query(qMasterBarang);


        // ========================================================
        // 🔥 TAMBAHAN LOGIKA BARU: MENYUNTIKKAN DATA TRANSAKSI/OPERASIONAL
        // ========================================================

        // [Transaksi 1] Insert Semua PIC Request 
        console.log('=> Mengisi tabel_pic_request...');
        const qPicRequest = `
            INSERT INTO tabel_pic_request (id_divisi_lain, nama_pic, contact_pic)
            VALUES
            ((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Divisi Roadshow'), 'PIC Roadshow 2', '082100040002'),
            ((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Divisi OlimpIT'), 'PIC OlimpIT 5', '081100040005'),
            ((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Divisi Data Science'), 'PIC Data Science 3', '081200040003'),
            ((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Divisi CTF'), 'PIC CTF 4', '081300040004'),
            ((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Subdivisi ExploIT'), 'Stafli ExploIT 1', '081502030001'),
            ((SELECT id_divisi_lain FROM tabel_divisi_lain WHERE nama_divisi = 'Subdivisi ExploIT'), 'PIC ExploIT 3', '081502040003');
        `;
        await db.query(qPicRequest);

        // [Transaksi 2] Insert Semua Log Request Hulu 
        console.log('=> Mengisi tabel_request...');
        const qRequest = `
            INSERT INTO tabel_request (id_pic_request, nama_barang_request, jumlah_kebutuhan, status_request)
            VALUES
            ((SELECT id_pic_request FROM tabel_pic_request WHERE nama_pic = 'PIC Roadshow 2'), 'X-Banner & Stand Roadshow', 2, 'Disetujui'),
            ((SELECT id_pic_request FROM tabel_pic_request WHERE nama_pic = 'Stafli ExploIT 1'), 'Paket Lighting Panggung', 1, 'Disetujui'),
            ((SELECT id_pic_request FROM tabel_pic_request WHERE nama_pic = 'Stafli ExploIT 1'), 'Audio Control & Mixer Board', 1, 'Disetujui'),
            ((SELECT id_pic_request FROM tabel_pic_request WHERE nama_pic = 'Stafli ExploIT 1'), 'Speaker Besar Panggung (Line Array)', 4, 'Disetujui'),
            ((SELECT id_pic_request FROM tabel_pic_request WHERE nama_pic = 'Stafli ExploIT 1'), 'Karpet Merah Panggung (Meteran)', 12, 'Disetujui');
        `;
        await db.query(qRequest);

        // [Transaksi 3] Insert Alur Pengadaan Hilir 
        console.log('=> Mengisi tabel_pengadaan...');
        const qPengadaan = `
            INSERT INTO tabel_pengadaan (id_request, metode_pengadaan, status_desain, id_vendor)
            VALUES
            ((SELECT id_request FROM tabel_request WHERE nama_barang_request = 'X-Banner & Stand Roadshow' ORDER BY id_request DESC LIMIT 1), 'Buat Sendiri', 'Selesai_Produksi', NULL),
            ((SELECT id_request FROM tabel_request WHERE nama_barang_request = 'Paket Lighting Panggung' ORDER BY id_request DESC LIMIT 1), 'Sewa_Vendor', 'N/A', (SELECT id_vendor FROM tabel_vendor WHERE nama_vendor = 'Surabaya Stage & Production')),
            ((SELECT id_request FROM tabel_request WHERE nama_barang_request = 'Audio Control & Mixer Board' ORDER BY id_request DESC LIMIT 1), 'Sewa_Vendor', 'N/A', (SELECT id_vendor FROM tabel_vendor WHERE nama_vendor = 'Gubeng Multimedia Audio')),
            ((SELECT id_request FROM tabel_request WHERE nama_barang_request = 'Speaker Besar Panggung (Line Array)' ORDER BY id_request DESC LIMIT 1), 'Sewa_Vendor', 'N/A', (SELECT id_vendor FROM tabel_vendor WHERE nama_vendor = 'Gubeng Multimedia Audio')),
            ((SELECT id_request FROM tabel_request WHERE nama_barang_request = 'Karpet Merah Panggung (Meteran)' ORDER BY id_request DESC LIMIT 1), 'Sewa_Vendor', 'N/A', (SELECT id_vendor FROM tabel_vendor WHERE nama_vendor = 'Surabaya Stage & Production'));
        `;
        await db.query(qPengadaan);

        // [Transaksi 4] Seeding Alokasi Volume Stok Multi-Lokasi
        console.log('=> Mengisi tabel_stok_lokasi_barang...');
        const qStokLokasi = `
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
            ((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Paket Lighting Panggung'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Kolam TW2'), 1, 'Tersedia'),
            ((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Audio Control & Mixer Board'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Kolam TW2'), 1, 'Tersedia'),
            ((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Speaker Besar Panggung (Line Array)'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Kolam TW2'), 4, 'Tersedia'),
            ((SELECT id_master_barang FROM tabel_master_barang WHERE nama_barang = 'Karpet Merah Panggung (Meteran)'), (SELECT id_lokasi_barang FROM tabel_lokasi_barang WHERE nama_lokasi = 'Kolam TW2'), 12, 'Tersedia');
        `;
        await db.query(qStokLokasi);

        // =========================================================
        // ⚡ UPDATE RELASI: Mengikat id_pengadaan ke tabel_master_barang
        // =========================================================
        console.log('=> Menyinkronkan id_pengadaan ke tabel_master_barang...');
        const qUpdatePengadaanBarang = `
            UPDATE tabel_master_barang 
            SET id_pengadaan = CASE nama_barang
                WHEN 'X-Banner & Stand Roadshow' THEN 1
                WHEN 'Paket Lighting Panggung' THEN 2
                WHEN 'Audio Control & Mixer Board' THEN 3
                WHEN 'Speaker Besar Panggung (Line Array)' THEN 4
                WHEN 'Karpet Merah Panggung (Meteran)' THEN 5
            END
            WHERE nama_barang IN (
                'X-Banner & Stand Roadshow',
                'Paket Lighting Panggung',
                'Audio Control & Mixer Board',
                'Speaker Besar Panggung (Line Array)',
                'Karpet Merah Panggung (Meteran)'
            );
        `;
        await db.query(qUpdatePengadaanBarang);

        console.log('🏁 ✅ BOOM! Seluruh siklus data (Master & Transaksi) sukses di-inject ke MySQL!');
    } catch (error) {
        console.error('❌ Waduh, seeding gagal di tengah jalan:', error.message);
    } finally {
        process.exit();
    }
};

runSeeding();