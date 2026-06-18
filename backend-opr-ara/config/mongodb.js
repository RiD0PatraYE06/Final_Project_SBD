const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
    try {
        // Mengambil URI dari .env, atau gunakan default lokal jika belum disetting
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/DB_MANAJEMEN_PERLENGKAPAN_OPR_ARA';
        
        await mongoose.connect(mongoURI);
        console.log('✅ Mantap! Kabel Node.js ke MongoDB udah Tersambung!');
    } catch (error) {
        console.error('❌ Waduh, koneksi ke MongoDB Gagal:', error.message);
        process.exit(1); // Hentikan aplikasi jika koneksi database krusial ini gagal
    }
};

module.exports = connectMongoDB;