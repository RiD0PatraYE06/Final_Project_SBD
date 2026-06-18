const mongoose = require('mongoose');

const CoordinationLogSchema = new mongoose.Schema({
    id_request: { type: Number, default: null },
    nama_divisi: { type: String, required: true }, // Contoh: 'Divisi OlimpIT'
    nama_pic: { type: String, required: true },    // Contoh: 'PIC OlimpIT'
    nama_barang_request: { type: String, required: true },
    jumlah: { type: Number, required: true },
    aksi: { 
        type: String, 
        enum: ['AJUKAN_REQUEST', 'SETUJUI_REQUEST', 'TOLAK_REQUEST', 'PROSES_PENGADAAN'], 
        required: true 
    },
    keterangan: { type: String, required: true },
    operator_opr: { type: String, default: 'Staf OPR' }, // Siapa staf OPR yang memproses
    tanggal_koordinasi: { type: Date, default: Date.now }
}, { 
    collection: 'coordination_logs' // Dipaksa masuk ke tempat kesepakatan timmu!
});

module.exports = mongoose.model('CoordinationLog', CoordinationLogSchema);