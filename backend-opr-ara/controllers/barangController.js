const db = require('../config/mysql');
const LogAset = require('../models/LogAset'); // Mengarah ke koleksi equipment_logs
const MaintenanceLog = require('../models/MaintenanceLog'); // 👈 1. PASTIKAN BARIS INI SUDAH ADA!

// 1. Mendapatkan semua aset barang dari MySQL
const getAllBarang = async (req, res) => {
    try {
        // KODE OPTIMAL: Menampilkan data barang lengkap beserta info stok dan lokasinya via JOIN
        const queryGet = `
            SELECT 
                tmb.id_master_barang, 
                tmb.nama_barang, 
                tmb.id_pengadaan,
                tsl.id_stok_lokasi,
                tsl.jumlah_stok,
                tsl.status_ketersediaan,
                tlb.nama_lokasi
            FROM tabel_master_barang tmb
            LEFT JOIN tabel_stok_lokasi_barang tsl ON tmb.id_master_barang = tsl.id_master_barang
            LEFT JOIN tabel_lokasi_barang tlb ON tsl.id_lokasi_barang = tlb.id_lokasi_barang
        `;
        const [rows] = await db.query(queryGet);
        res.status(200).json({
            success: true,
            message: "Daftar barang aset berhasil diambil lengkap dengan lokasi dan status!",
            data: rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. Menambahkan aset barang baru secara mandiri oleh OPR (Sesuai Aturan Normalisasi)
const createBarang = async (req, res) => {
    console.log("=====================================");
    console.log("PAKET DATA DARI FRONTEND (POST BARANG):", req.body);
    console.log("=====================================");

    const { nama_barang, total_stok, status_ketersediaan, id_kategori, id_lokasi_barang, operator } = req.body;

    try {
        // Langkah A: Masukkan ke tabel_master_barang (Hanya nama_barang, id_pengadaan murni NULL karena input manual mandiri)
        const queryMaster = `INSERT INTO tabel_master_barang (nama_barang) VALUES (?)`;
        const [resMaster] = await db.query(queryMaster, [nama_barang]);
        const idMasterBarangBaru = resMaster.insertId;

        // Langkah B: Masukkan ke tabel_stok_lokasi_barang (Junction Lokasi & Stok)
        const queryStok = `
            INSERT INTO tabel_stok_lokasi_barang (id_master_barang, id_lokasi_barang, jumlah_stok, status_ketersediaan) 
            VALUES (?, ?, ?, ?)
        `;
        await db.query(queryStok, [idMasterBarangBaru, id_lokasi_barang, total_stok, status_ketersediaan || 'Tersedia']);

        // Langkah C: Masukkan ke tabel_relasi_kategori (Junction Kategori)
        const queryKategori = `INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (?, ?)`;
        await db.query(queryKategori, [idMasterBarangBaru, id_kategori]);

        // 🔴 Trigger pencatatan otomatis audit log riwayat ke MongoDB (equipment_logs)
        await LogAset.create({
            id_master_barang: idMasterBarangBaru,
            nama_barang: nama_barang,
            aksi: 'TAMBAH_BARANG',
            keterangan: `Barang baru '${nama_barang}' berhasil di-input manual oleh OPR ke lokasi ID [${id_lokasi_barang}] dengan stok awal ${total_stok} unit.`,
            operator: operator || 'Stafli OPR'
        });

        res.status(201).json({
            success: true,
            message: "Aset barang baru berhasil ditambahkan ke 3 tabel relasi MySQL dan log MongoDB berhasil disimpan!",
            insertedId: idMasterBarangBaru
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. 🔥 FUNGSI BARU: Mengubah status ketersediaan barang menjadi 'Rusak' (Maintenance Log)
const laporkanKerusakan = async (req, res) => {
    console.log("=====================================");
    console.log("LAPORAN KERUSAKAN MASUK:", req.body);
    console.log("=====================================");

    const { id_stok_lokasi, keterangan_rusak, operator } = req.body;
    
    try {
        // Langkah A: Cari tahu detail nama barang & lokasinya dulu di MySQL
        const queryCari = `
            SELECT tsl.id_master_barang, tmb.nama_barang, tlb.nama_lokasi 
            FROM tabel_stok_lokasi_barang tsl
            JOIN tabel_master_barang tmb ON tsl.id_master_barang = tmb.id_master_barang
            JOIN tabel_lokasi_barang tlb ON tsl.id_lokasi_barang = tlb.id_lokasi_barang
            WHERE tsl.id_stok_lokasi = ?
        `;
        const [barangRows] = await db.query(queryCari, [id_stok_lokasi]);
        
        if (barangRows.length === 0) {
            return res.status(404).json({ success: false, message: "Data stok di lokasi tersebut tidak ditemukan!" });
        }
        
        const dataBarang = barangRows[0];

        // Langkah B: UPDATE status ketersediaan di MySQL menjadi 'Rusak'
        await db.query(
            "UPDATE tabel_stok_lokasi_barang SET status_ketersediaan = 'Rusak' WHERE id_stok_lokasi = ?", 
            [id_stok_lokasi]
        );

        // 🛠️ PERBAIKAN UTAMA DI SINI (LANGKAH C):
        // 🔴 SEKARANG RESMI DIUBAH MENJADI MaintenanceLog, BUKAN LogAset LAGI!
        await MaintenanceLog.create({
            id_master_barang: dataBarang.id_master_barang,
            nama_barang: dataBarang.nama_barang,
            keterangan_rusak: keterangan_rusak, // Sesuai kolom di model MaintenanceLog.js kamu
            operator: operator || 'Staf OPR Lapangan'
        });

        res.status(200).json({
            success: true,
            message: `Sukses! Status ketersediaan ${dataBarang.nama_barang} berhasil diubah menjadi 'Rusak' & kronologi disimpan di MongoDB koleksi maintenance_logs.`
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4. FUNGSI: Mengembalikan status barang dari 'Rusak' menjadi 'Tersedia' (Selesai Perbaikan)
const selesaiPerbaikan = async (req, res) => {
    // 💡 Sekarang kita minta input 'solusi' juga dari body Thunder Client
    const { id_stok_lokasi, solusi, operator } = req.body;
    
    try {
        // 1. Cari tahu detail barang di MySQL
        const queryCari = `
            SELECT tsl.id_master_barang, tmb.nama_barang, tlb.nama_lokasi 
            FROM tabel_stok_lokasi_barang tsl
            JOIN tabel_master_barang tmb ON tsl.id_master_barang = tmb.id_master_barang
            JOIN tabel_lokasi_barang tlb ON tsl.id_lokasi_barang = tlb.id_lokasi_barang
            WHERE tsl.id_stok_lokasi = ?
        `;
        const [barangRows] = await db.query(queryCari, [id_stok_lokasi]);
        if (barangRows.length === 0) {
            return res.status(404).json({ success: false, message: "Data tidak ditemukan!" });
        }
        const dataBarang = barangRows[0];

        // 2. UPDATE status di MySQL kembali menjadi 'Tersedia'
        await db.query(
            "UPDATE tabel_stok_lokasi_barang SET status_ketersediaan = 'Tersedia' WHERE id_stok_lokasi = ?", 
            [id_stok_lokasi]
        );

        // 3. 🔴 UPDATE DATA DI MONGODB (Koleksi maintenance_logs)
        // Mencari log rusak yang statusnya masih 'Pending' untuk barang ini, lalu di-update jadi 'Selesai'
        await MaintenanceLog.findOneAndUpdate(
            { id_master_barang: dataBarang.id_master_barang, status: 'Pending' },
            { 
                status: 'Selesai',
                solusi: solusi || 'Telah diperbaiki dan dicek ulang oleh internal OPR.',
                tanggal_selesai_log: new Date()
            },
            { sort: { tanggal_masuk_log: -1 } } // Mengambil laporan pending yang paling baru
        );

        // 4. 💾 LOG KE MONGODB (Koleksi equipment_logs sebagai timeline pergerakan aset global)
        await LogAset.create({
            id_master_barang: dataBarang.id_master_barang,
            nama_barang: dataBarang.nama_barang,
            aksi: 'UPDATE_STOK',
            ketersediaan: 'Tersedia',
            keterangan: `MAINTENANCE SELESAI: '${dataBarang.nama_barang}' di lokasi [${dataBarang.nama_lokasi}] telah selesai diperbaiki dengan solusi [${solusi}]. Status aset kembali Tersedia.`,
            operator: operator || 'Staf OPR Lapangan'
        });

        res.status(200).json({
            success: true,
            message: `Sukses! Status ${dataBarang.nama_barang} kembali 'Tersedia'. Log perbaikan di maintenance_logs telah di-update menjadi 'Selesai'.`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getAllBarang,
    createBarang,
    laporkanKerusakan, // Jangan lupa diexport biar tidak memicu error argument handler!
    selesaiPerbaikan // 👈 WAJIB DITAMBAHKAN DI SINI WOK!
};