const mongoose = require('mongoose');

const MaintenanceLogSchema = new mongoose.Schema({
    id_master_barang: {
        type: Number,
        required: true
    },
    nama_barang: {
        type: String,
        required: true
    },
    keterangan_rusak: {
        type: String,
        required: true
    },
    // 🔥 TAMBAHAN LOGIKA TICKETING:
    status: {
        type: String,
        enum: ['Pending', 'Selesai'],
        default: 'Pending' // Pas pertama dilaporkan langsung otomatis 'Pending'
    },
    solusi: {
        type: String,
        default: '-' // Belum ada solusi pas awal rusak
    },
    operator: {
        type: String,
        default: 'Staf OPR Lapangan'
    },
    tanggal_masuk_log: {
        type: Date,
        default: Date.now
    },
    tanggal_selesai_log: {
        type: Date // Akan terisi pas barang sudah beres diperbaiki
    }
}, { 
    collection: 'maintenance_logs' 
});

module.exports = mongoose.model('MaintenanceLog', MaintenanceLogSchema);