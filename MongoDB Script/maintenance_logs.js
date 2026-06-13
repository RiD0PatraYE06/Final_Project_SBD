use("manajemen_perlengkapan_opr");

db.createCollection("maintenance_logs");

db.maintenance_logs.createIndex({ id_barang: 1 });
db.maintenance_logs.createIndex({ status: 1 });

db.maintenance_logs.insertMany([
{
    id_barang: "BRG126",
    jenis: "Perbaikan",
    deskripsi: "Kabel speaker rusak",
    status: "selesai",
    vendor: "SoundPro",
    biaya: 250000,
    tanggal: new Date()
}
]);
