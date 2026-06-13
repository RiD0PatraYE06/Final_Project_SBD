use("manajemen_perlengkapan_opr");

db.createCollection("coordination_logs");

db.coordination_logs.createIndex({ timestamp: -1 });

db.coordination_logs.insertMany([
{
    divisi: "OPR",
    anggota: "Rayhan",
    pesan: "Speaker dipindahkan ke Hall A",
    prioritas: "high",
    timestamp: new Date()
}
]);
