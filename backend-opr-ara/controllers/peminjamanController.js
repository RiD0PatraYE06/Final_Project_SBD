const db = require('../config/mysql');
const LogAset = require('../models/LogAset');

// ====================================================================
// A. MEMBUAT MASTER NOTA PEMINJAMAN (HEADER)
// ====================================================================
const buatPeminjaman = async (req, res) => {
    const { id_anggota_opr } = req.body;
    try {
        const queryHeader = `INSERT INTO tabel_peminjaman (id_anggota_opr) VALUES (?)`;
        const [result] = await db.query(queryHeader, [id_anggota_opr]);
        
        res.status(201).json({
            success: true,
            message: "Nota induk peminjaman berhasil dibuat secara otomatis!",
            id_peminjaman: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ====================================================================
// B. MEMBUAT RINCIAN BARANG YANG DIPINJAM (DETAIL + ACID TRANSACTION)
// ====================================================================
const tambahDetailPeminjaman = async (req, res) => {
    const { id_peminjaman, id_stok_lokasi, jumlah_pinjam, kondisi_keluar } = req.body;
    const qtyPinjam = jumlah_pinjam || 1;

    // 🔑 LANGKAH 1: Ambil koneksi khusus (connection client) dari pool untuk mengunci jalur transaksi
    const connection = await db.getConnection();

    try {
        // 🔑 LANGKAH 2: Buka gerbang transaksi (Mulai mode All-or-Nothing)
        await connection.beginTransaction();

        // 1. Cari info barang & stok aktual (Gunakan objek 'connection', bukan 'db')
        const queryCari = `
            SELECT tsl.id_master_barang, tmb.nama_barang, tlb.nama_lokasi, tsl.jumlah_stok 
            FROM tabel_stok_lokasi_barang tsl
            JOIN tabel_master_barang tmb ON tsl.id_master_barang = tmb.id_master_barang
            JOIN tabel_lokasi_barang tlb ON tsl.id_lokasi_barang = tlb.id_lokasi_barang
            WHERE tsl.id_stok_lokasi = ?
        `;
        const [barangRows] = await connection.query(queryCari, [id_stok_lokasi]);
        if (barangRows.length === 0) {
            await connection.rollback(); // Batalkan jika data kosong
            return res.status(404).json({ success: false, message: "Stok lokasi barang tidak ditemukan!" });
        }
        const dataBarang = barangRows[0];

        // Validasi Stok Minus
        if (dataBarang.jumlah_stok < qtyPinjam) {
            await connection.rollback(); // Batalkan transaksi jika stok tidak cukup
            return res.status(400).json({
                success: false,
                message: `Maaf Wok, stok tidak mencukupi! Sisa: ${dataBarang.jumlah_stok} unit.`
            });
        }

        // 2. KUERI PERTAMA: Masukkan data transaksi ke tabel_detail_pinjam
        const queryDetail = `
            INSERT INTO tabel_detail_pinjam (id_peminjaman, id_stok_lokasi, jumlah_pinjam, kondisi_keluar) 
            VALUES (?, ?, ?, ?)
        `;
        await connection.query(queryDetail, [id_peminjaman, id_stok_lokasi, qtyPinjam, kondisi_keluar]);

        // 3. KUERI KEDUA: Potong jumlah_stok barang tersebut di lokasi asal
        const queryKurangStok = `
            UPDATE tabel_stok_lokasi_barang 
            SET jumlah_stok = jumlah_stok - ?,
                status_ketersediaan = IF(jumlah_stok - ? <= 0, 'Habis', 'Dipinjam')
            WHERE id_stok_lokasi = ?
        `;
        await connection.query(queryKurangStok, [qtyPinjam, qtyPinjam, id_stok_lokasi]);

        // 4. KUERI KETIGA: Kirim audit log ke Hybrid NoSQL MongoDB (equipment_logs)
        // Jika MongoDB crash di tahap ini, catch block akan otomatis me-rollback MySQL di bawah!
        await LogAset.create({
            id_master_barang: dataBarang.id_master_barang,
            nama_barang: dataBarang.nama_barang,
            aksi: 'UPDATE_STOK',
            keterangan: `ASET DIPINJAM: '${dataBarang.nama_barang}' sebanyak ${qtyPinjam} unit (Nota #${id_peminjaman}).`,
            operator: 'Sistem Logistik Otomatis'
        });

        // 🔑 LANGKAH 3: JIKALAU SEMUA KUERI DI ATAS SUKSES, KUNCI PERUBAHAN KE DATABASE PERMANEN
        await connection.commit();

        res.status(201).json({
            success: true,
            message: `Sukses (ACID Transaction)! Peminjaman '${dataBarang.nama_barang}' aman tercatat.`
        });

    } catch (error) {
        // 🛑 LANGKAH 4: JIKA ADA SATU SAJA OPERASI YANG EROR, BATALKAN SEMUA PERUBAHAN DI ATAS!
        await connection.rollback();
        res.status(500).json({ success: false, error: "Transaction Gagal & Di-rollback: " + error.message });
    } finally {
        // 🔓 LANGKAH 5: Selalu lepaskan koneksi kembali ke pool agar bisa digunakan oleh request lain
        connection.release();
    }
};

// ====================================================================
// C. MELAKUKAN PENGEMBALIAN BARANG (SINKRONISASI + ACID TRANSACTION)
// ====================================================================
const kembaliPeminjaman = async (req, res) => {
    const { id_peminjaman, id_stok_lokasi, jumlah_kembali, kondisi_masuk, operator } = req.body;
    const connection = await db.getConnection(); // Ambil koneksi khusus pool

    try {
        await connection.beginTransaction(); // Mulai transaksi pengembalian

        const queryCari = `
            SELECT tsl.id_master_barang, tmb.nama_barang, tlb.nama_lokasi 
            FROM tabel_stok_lokasi_barang tsl
            JOIN tabel_master_barang tmb ON tsl.id_master_barang = tmb.id_master_barang
            JOIN tabel_lokasi_barang tlb ON tsl.id_lokasi_barang = tlb.id_lokasi_barang
            WHERE tsl.id_stok_lokasi = ?
        `;
        const [barangRows] = await connection.query(queryCari, [id_stok_lokasi]);
        if (barangRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "Data tidak ditemukan!" });
        }
        const dataBarang = barangRows[0];

        // 1. Update tgl_kembali di tabel induk
        await connection.query("UPDATE tabel_peminjaman SET tgl_kembali = NOW() WHERE id_peminjaman = ?", [id_peminjaman]);

        // 2. Update kondisi_masuk di tabel detail
        await connection.query(
            "UPDATE tabel_detail_pinjam SET kondisi_masuk = ? WHERE id_peminjaman = ? AND id_stok_lokasi = ?", 
            [kondisi_masuk, id_peminjaman, id_stok_lokasi]
        );

        // 3. Tambahkan kembali stok fisik barangnya
        await connection.query(
            "UPDATE tabel_stok_lokasi_barang SET jumlah_stok = jumlah_stok + ?, status_ketersediaan = 'Tersedia' WHERE id_stok_lokasi = ?", 
            [jumlah_kembali || 1, id_stok_lokasi]
        );

        // 4. Log ke MongoDB
        await LogAset.create({
            id_master_barang: dataBarang.id_master_barang,
            nama_barang: dataBarang.nama_barang,
            aksi: 'UPDATE_STOK',
            keterangan: `PENGEMBALIAN ASET: '${dataBarang.nama_barang}' sebanyak ${jumlah_kembali || 1} unit (Nota #${id_peminjaman}).`,
            operator: operator || 'Staf OPR Lapangan'
        });

        await connection.commit(); // Kunci semua perubahan pengembalian secara bersamaan
        res.status(200).json({ success: true, message: "Sukses (ACID Transaction)! Pengembalian sukses disinkronkan." });

    } catch (error) {
        await connection.rollback(); // Batalkan semua kueri pengembalian jika salah satu macet
        res.status(500).json({ success: false, error: "Transaction Kembali Gagal & Di-rollback: " + error.message });
    } finally {
        connection.release(); // Kembalikan slot koneksi
    }
};

module.exports = { buatPeminjaman, tambahDetailPeminjaman, kembaliPeminjaman };