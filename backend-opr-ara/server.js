const express = require('express');
require('dotenv').config();

// 1. Pastikan kedua file config ini di-require agar koneksinya langsung dites saat start
const db = require('./config/mysql');          // Memicu tes koneksi MySQL
const connectMongoDB = require('./config/mongodb'); // Ambil fungsi koneksi MongoDB

const logger = require('./middleware/logger');       
const apiRoutes = require('./routes/api'); 

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Jalankan koneksi MongoDB
connectMongoDB();

// Middleware
app.use(express.json());
app.use(logger); 

// Jalur utama API
app.use('/api', apiRoutes); 

app.get('/', (req, res) => {
    res.json({ message: "Wih, mantap! Server Backend OPR ARA berhasil merespons!" });
});

app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Server stand-by dan berjalan di port ${PORT}`);
    console.log(`===============================================`);
});