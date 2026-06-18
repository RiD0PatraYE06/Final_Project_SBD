const validateBarangInput = (req, res, next) => {
    const { nama_barang, total_stok, status_ketersediaan, id_kategori, id_lokasi_barang } = req.body;

    // Array penampung status yang diizinkan (mirip fungsi ENUM)
    const statusValid = ['Tersedia', 'Dipinjam', 'Rusak', 'N/A', 'Pending', 'Selesai_Produksi'];

    if (!nama_barang || total_stok === undefined || !status_ketersediaan || !id_kategori || !id_lokasi_barang) {
        return res.status(400).json({
            success: false,
            message: "Gagal memproses data! Semua kolom (nama_barang, total_stok, status_ketersediaan, id_kategori, id_lokasi_barang) wajib diisi."
        });
    }

    // Cek apakah status yang dikirim dari form HTML ada di dalam list array
    if (!statusValid.includes(status_ketersediaan)) {
        return res.status(400).json({
            success: false,
            message: `Status '${status_ketersediaan}' tidak valid! Pilih di antara: ${statusValid.join(', ')}`
        });
    }
    
    next();
};

const validateRequestInput = (req, res, next) => {
    const { id_pic_request, nama_barang_request, jumlah_kebutuhan } = req.body;

    if (!id_pic_request || !nama_barang_request || !jumlah_kebutuhan) {
        return res.status(400).json({
            success: false,
            message: "Gagal memproses data! Kolom id_pic_request, nama_barang_request, dan jumlah_kebutuhan wajib diisi."
        });
    }
    next();
};

module.exports = {
    validateBarangInput,
    validateRequestInput
};