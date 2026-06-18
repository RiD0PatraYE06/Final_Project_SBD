const db = require('../config/mysql');
const CoordinationLog = require('../models/CoordinationLog');
const LogAset = require('../models/LogAset'); // Untuk equipment_logs di akhir alur

// Tambahan Fungsi GET untuk mendukung rute api.js kamu
const getAllRequest = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tabel_request');
        res.status(200).json({
            success: true,
            message: "Daftar request lintas divisi berhasil diambil!",
            data: rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ALUR 1 & 2: Divisi Lain Mengajukan Request (Masuk ke tabel_request & Catat ke coordination_logs)
const ajukanRequest = async (req, res) => {
    const { id_pic_request, nama_divisi, nama_pic, nama_barang_request, jumlah_kebutuhan } = req.body;
    try {
        // Insert ke MySQL tabel_request
        const queryReq = `
            INSERT INTO tabel_request (id_pic_request, nama_barang_request, jumlah_kebutuhan, status_request) 
            VALUES (?, ?, ?, 'Pending')
        `;
        const [result] = await db.query(queryReq, [id_pic_request, nama_barang_request, jumlah_kebutuhan]);

        // 🟢 MASUK KE MONGODB COORDINATION_LOGS
        await CoordinationLog.create({
            id_request: result.insertId,
            nama_divisi: nama_divisi,
            nama_pic: nama_pic,
            nama_barang_request: nama_barang_request,
            jumlah: jumlah_kebutuhan,
            aksi: 'AJUKAN_REQUEST',
            keterangan: `Divisi ${nama_divisi} lewat PIC ${nama_pic} mengajukan permintaan ${nama_barang_request} sebanyak ${jumlah_kebutuhan} unit.`
        });

        res.status(201).json({ success: true, message: "Request berhasil dicatat di MySQL dan MongoDB!", id_request: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ALUR 3 & 4: OPR Setuju & Data Masuk ke tabel_pengadaan
const setujuiRequest = async (req, res) => {
    const { id_request, metode_pengadaan, id_vendor, operator_opr, nama_divisi, nama_pic, nama_barang, jumlah } = req.body;
    try {
        // UPDATE MySQL tabel_request jadi 'Disetujui'
        await db.query('UPDATE tabel_request SET status_request = "Disetujui" WHERE id_request = ?', [id_request]);

        // INSERT MySQL tabel_pengadaan
        const queryPengadaan = `
            INSERT INTO tabel_pengadaan (id_request, metode_pengadaan, status_desain, id_vendor) 
            VALUES (?, ?, 'N/A', ?)
        `;
        await db.query(queryPengadaan, [id_request, metode_pengadaan, id_vendor || null]);

        // 🟢 MASUK KE MONGODB COORDINATION_LOGS (Status koordinasi naik tingkat ke pengadaan)
        await CoordinationLog.create({
            id_request: id_request,
            nama_divisi: nama_divisi,
            nama_pic: nama_pic,
            nama_barang_request: nama_barang,
            jumlah: jumlah,
            aksi: 'SETUJUI_REQUEST',
            keterangan: `OPR menyetujui request. Alur dilanjutkan ke Pengadaan dengan metode: ${metode_pengadaan}.`,
            operator_opr: operator_opr
        });

        res.status(200).json({ success: true, message: "Request disetujui, alur pengadaan dimulai!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ALUR 5: Salah satu OPR input barang yang sudah ready (FINAL UPDATE DATABASE)
const finalisasiBarangPengadaan = async (req, res) => {
    const { id_request, nama_barang, total_stok, id_kategori, id_lokasi_barang, operator_opr } = req.body;
    try {
        // 🛠️ DETAIL FIX 1: Ambil id_pengadaan terlebih dahulu berdasarkan id_request
        const [pengadaanRows] = await db.query(
            'SELECT id_pengadaan FROM tabel_pengadaan WHERE id_request = ? ORDER BY id_pengadaan DESC LIMIT 1', 
            [id_request]
        );
        const idPengadaan = pengadaanRows.length > 0 ? pengadaanRows[0].id_pengadaan : null;

        // 1. Masukkan ke tabel_master_barang lengkap dengan id_pengadaan (Menjaga Relasi!)
        const [resMaster] = await db.query(
            `INSERT INTO tabel_master_barang (nama_barang, id_pengadaan) VALUES (?, ?)`, 
            [nama_barang, idPengadaan]
        );
        const idMasterBarangBaru = resMaster.insertId;

        // 2. Masukkan ke tabel_stok_lokasi_barang
        const [resStok] = await db.query(`
            INSERT INTO tabel_stok_lokasi_barang (id_master_barang, id_lokasi_barang, jumlah_stok, status_ketersediaan) 
            VALUES (?, ?, ?, 'Tersedia')
        `, [idMasterBarangBaru, id_lokasi_barang, total_stok]);
        const idStokLokasiBaru = resStok.insertId;

        // 3. Masukkan ke tabel_relasi_kategori
        await db.query(`INSERT INTO tabel_relasi_kategori (id_master_barang, id_kategori) VALUES (?, ?)`, [idMasterBarangBaru, id_kategori]);

        // 🛠️ DETAIL FIX 2: Catat Transaksi Akhir ke tabel_pemenuhan_permintaan (Fulfillment)
        await db.query(`
            INSERT INTO tabel_pemenuhan_permintaan (id_request, id_stok_lokasi, jumlah_dipenuhi, catatan_fulfillment)
            VALUES (?, ?, ?, ?)
        `, [id_request, idStokLokasiBaru, total_stok, `Dipenuhi otomatis oleh OPR via Pengadaan Barang.`]);

        // 🔴 KARENA FISIK BARANG SEKARANG SUDAH ADA, CATAT KE EQUIPMENT_LOGS
        await LogAset.create({
            id_master_barang: idMasterBarangBaru,
            nama_barang: nama_barang,
            aksi: 'TAMBAH_BARANG',
            keterangan: `Barang hasil pengadaan request #${id_request} ('${nama_barang}') telah masuk gudang operasional sebesar ${total_stok} unit.`,
            operator: operator_opr || 'Staf OPR'
        });

        res.status(201).json({ 
            success: true, 
            message: "Sempurna! Seluruh siklus database terupdate (Master, Stok, Kategori, Fulfillment) dan barang siap digunakan!" 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Tambahkan model LogAset di bagian atas file jika belum ada:
// const LogAset = require('../models/LogAset');

const penuhiRequest = async (req, res) => {
    const { id_request, id_stok_lokasi, jumlah_dipenuhi, catatan_fulfillment } = req.body;

    // 🔑 Ambil koneksi terisolasi untuk transaksi
    const connection = await db.getConnection();

    try {
        // 🔑 Mulai transaksi fulfillment
        await connection.beginTransaction();

        // 1. Cari detail barang
        const queryCari = `
            SELECT tsl.id_master_barang, tmb.nama_barang, tlb.nama_lokasi 
            FROM tabel_stok_lokasi_barang tsl
            JOIN tabel_master_barang tmb ON tsl.id_master_barang = tmb.id_master_barang
            JOIN tabel_lokasi_barang tlb ON tsl.id_lokasi_barang = tlb.id_lokasi_barang
            WHERE tsl.id_stok_lokasi = ?
        `;
        const [barangRows] = await connection.query(queryCari, [id_stok_lokasi]);
        const namaBarang = barangRows.length > 0 ? barangRows[0].nama_barang : 'Aset Pengadaan';
        const idMaster = barangRows.length > 0 ? barangRows[0].id_master_barang : 0;

        // 2. INSERT data serah terima ke tabel_pemenuhan_permintaan
        const queryFulfill = `
            INSERT INTO tabel_pemenuhan_permintaan (id_request, id_stok_lokasi, jumlah_dipenuhi, catatan_fulfillment)
            VALUES (?, ?, ?, ?)
        `;
        await connection.query(queryFulfill, [id_request, id_stok_lokasi, jumlah_dipenuhi, catatan_fulfillment]);

        // 3. Log Audit ke MongoDB
        await LogAset.create({
            id_master_barang: idMaster,
            nama_barang: namaBarang,
            aksi: 'UPDATE_STOK',
            keterangan: `SERAH TERIMA ASET (FULFILL): Menyerahkan ${jumlah_dipenuhi} unit '${namaBarang}' untuk Request ID #${id_request}.`,
            operator: 'Sistem Logistik OPR'
        });

        // 🔑 Kunci transaksi fulfillment secara utuh
        await connection.commit();

        res.status(201).json({
            success: true,
            message: `Sukses (ACID Transaction)! Permintaan ID #${id_request} resmi dipenuhi.`
        });

    } catch (error) {
        // 🛑 Batalkan insert MySQL jika simpan log MongoDB mendadak gagal
        await connection.rollback();
        res.status(500).json({ success: false, error: "Transaction Fulfill Gagal & Di-rollback: " + error.message });
    } finally {
        // 🔓 Kembalikan koneksi ke pool
        connection.release();
    }
};

// ====================================================================
// ❌ FUNGSI PENOLAKAN REQUEST (REVISED & SINKRON TOTAL)
// ====================================================================
const tolakRequest = async (req, res) => {
    console.log("=====================================");
    console.log("PROSES PENOLAKAN REQUEST (REVISED):", req.body);
    console.log("=====================================");

    // Ambil info divisi dan PIC dari request body agar konsisten dengan alur setujuiRequest
    const { id_request, operator_opr, catatan_penolakan, nama_divisi, nama_pic } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. 🔍 Cari data request di MySQL untuk mengambil nama barang dan jumlahnya otomatis
        const [reqRows] = await connection.query("SELECT * FROM tabel_request WHERE id_request = ?", [id_request]);
        if (reqRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "Data request tidak ditemukan di MySQL!" });
        }
        const dataReq = reqRows[0];

        // 2. 📝 UPDATE MySQL: Ubah status_request menjadi 'Ditolak'
        const queryTolak = `
            UPDATE tabel_request 
            SET status_request = 'Ditolak' 
            WHERE id_request = ?
        `;
        await connection.query(queryTolak, [id_request]);

        // 3. 🔴 TRIGGER MONGODB: Masukkan semua field required & gunakan ENUM 'TOLAK_REQUEST'
        await CoordinationLog.create({
            id_request: id_request,
            nama_divisi: nama_divisi,          // Diambil dari req.body Thunder Client
            nama_pic: nama_pic,                // Diambil dari req.body Thunder Client
            nama_barang_request: dataReq.nama_barang_request, // Otomatis ditarik dari baris MySQL
            jumlah: dataReq.jumlah_kebutuhan,  // Otomatis ditarik dari baris MySQL
            aksi: 'TOLAK_REQUEST',             // 🔥 Diubah sesuai standardisasi ENUM kelompokmu
            keterangan: `REQUEST DITOLAK: Permintaan aset '${dataReq.nama_barang_request}' sebanyak ${dataReq.jumlah_kebutuhan} unit RESMI DITOLAK oleh [${operator_opr}]. Alasan: ${catatan_penolakan || 'Tidak ada alasan spesifik.'}`,
            operator_opr: operator_opr
        });

        await connection.commit(); // Kunci komitmen transaksi ACID

        res.status(200).json({
            success: true,
            message: `Sukses (ACID)! Request ID #${id_request} resmi ditolak. Status MySQL berganti jadi 'Ditolak' dan alasan dicatat di MongoDB coordination_logs!`
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, error: "Gagal menolak request: " + error.message });
    } finally {
        connection.release();
    }
};

// ⚠️ JANGAN LUPA tambahkan 'tolakRequest' di module.exports paling bawah file ya, Wok!
// Contoh: module.exports = { getAllRequest, ajukanRequest, setujuiRequest, finalisasiBarangPengadaan, penuhiRequest, tolakRequest };

module.exports = {
    getAllRequest,
    ajukanRequest,
    setujuiRequest,
    finalisasiBarangPengadaan,
    penuhiRequest,
    tolakRequest
};