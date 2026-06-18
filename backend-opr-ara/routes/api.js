const express = require('express');
const router = express.Router();

// =====================================
// KELOMPOK IMPORT CONTROLLER (Kumpul di Atas)
// =====================================
const barangController = require('../controllers/barangController');
const requestController = require('../controllers/requestController');
const peminjamanController = require('../controllers/peminjamanController'); // 👈 Pindah ke atas sini

// Import Middleware Validator
const { validateBarangInput } = require('../middleware/validator');

// 🟢 Pintu API - Rute Barang (MySQL + NoSQL Log)
router.get('/barang', barangController.getAllBarang);
router.post('/barang', validateBarangInput, barangController.createBarang);
router.post('/barang/maintenance', barangController.laporkanKerusakan);
router.post('/barang/maintenance/selesai', barangController.selesaiPerbaikan);

// 🟢 Pintu API - Rute Request Sesuai Alur Koordinasi Kelompok
router.get('/request', requestController.getAllRequest);
router.post('/request/aju', requestController.ajukanRequest);
router.post('/request/setujui', requestController.setujuiRequest);
router.post('/request/tolak', requestController.tolakRequest);
router.post('/request/finalisasi', requestController.finalisasiBarangPengadaan);
router.post('/request/fulfill', requestController.penuhiRequest);

// 🟢 Pintu API - Rute Peminjaman Internal OPR (Tabel Kosong)
router.post('/peminjaman', peminjamanController.buatPeminjaman);
router.post('/peminjaman/detail', peminjamanController.tambahDetailPeminjaman);
router.post('/peminjaman/kembali', peminjamanController.kembaliPeminjaman);

module.exports = router;