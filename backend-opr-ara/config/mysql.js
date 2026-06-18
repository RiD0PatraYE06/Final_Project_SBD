const mysql = require('mysql2');
require('dotenv').config();

// Membuat kolam koneksi (Connection Pool) agar backend efisien
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Mengubah ke format promise supaya nanti kita bisa pakai async/await saat bikin query
const db = pool.promise();

// Tes koneksi secara real-time saat server backend dinyalakan
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Waduh, koneksi ke MySQL XAMPP Gagal:', err.message);
    } else {
        console.log('✅ Mantap! Kabel Node.js ke MySQL XAMPP udah Tersambung!');
        connection.release(); // Kembalikan koneksi ke kolam
    }
});

module.exports = db;