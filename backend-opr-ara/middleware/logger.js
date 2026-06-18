const logger = (req, res, next) => {
    const waktu = new Date().toISOString();
    const metode = req.method;
    const url = req.originalUrl;
    
    console.log(`[${waktu}] 📥 ${metode} Request ke pintu: ${url}`);
    next(); // Lanjut ke proses/middleware berikutnya
};

module.exports = logger;