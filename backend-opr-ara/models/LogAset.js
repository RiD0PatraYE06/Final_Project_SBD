const mongoose = require('mongoose');

// Ganti atau tambahkan baris ini di bagian atas:
const MaintenanceLog = require('../models/MaintenanceLog');

const LogAsetSchema = new mongoose.Schema({
    id_master_barang: {
        type: Number,
        required: true
    },
    nama_barang: {
        type: String,
        required: true
    },
    aksi: {
        type: String, 
        enum: ['TAMBAH_BARANG', 'UPDATE_STOK', 'REQUEST_BARANG', 'PENGADAAN_VENDOR'],
        required: true
    },
    keterangan: {
        type: String,
        required: true
    },
    operator: {
        type: String,
        default: 'Sistem Otomatis'
    },
    tanggal_dibuat: {
        type: Date,
        default: Date.now
    }
}, { 
    // 👈 KUNCINYA DI SINI: Memaksa Mongoose memakai nama koleksi ini di MongoDB
    collection: 'equipment_logs' 
});

module.exports = mongoose.model('LogAset', LogAsetSchema);