use("manajemen_perlengkapan_opr");

db.createCollection("equipment_logs");

db.equipment_logs.createIndex({ id_barang: 1 });
db.equipment_logs.createIndex({ timestamp: -1 });

db.equipment_logs.insertMany([
{
    id_barang: "BRG126",
    aktivitas: "dipinjam",
    pelaku: "Divisi Acara",
    lokasi: "TW 2",
    kondisi: "baik",
    timestamp: new Date()
},
{
    id_barang: "BRG127",
    aktivitas: "dikembalikan",
    pelaku: "Divisi Media",
    lokasi: "Gudang",
    kondisi: "baik",
    timestamp: new Date()
}
]);
