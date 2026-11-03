function bukaPesanan() {
  const form = document.getElementById("formPesanan");

  form.style.display = "block";

  form.scrollIntoView({
    behavior: "smooth"
  });
}


async function kirimPesanan() {
  const nama = document.getElementById("nama").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const jemput = document.getElementById("jemput").value.trim();
  const tujuan = document.getElementById("tujuan").value.trim();
  const tanggal = document.getElementById("tanggal").value;
  const jam = document.getElementById("jam").value;
  const penumpang = Number(
    document.getElementById("penumpang").value
  );

  if (
    !nama ||
    !whatsapp ||
    !jemput ||
    !tujuan ||
    !tanggal ||
    !jam ||
    !penumpang
  ) {
    alert("Mohon lengkapi semua data!");
    return;
  }

  if (penumpang > 30 || penumpang < 1) {
    alert("Jumlah penumpang harus 1 sampai 30.");
    return;
  }

  const dataPesanan = {
    nama: nama,
    whatsapp: whatsapp,
    jemput: jemput,
    tujuan: tujuan,
    tanggal: tanggal,
    jam: jam,
    penumpang: penumpang,
    status: "Menunggu konfirmasi",
    dibuatPada: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("orders").add(dataPesanan);

    alert(
      "Pesanan berhasil dikirim!\n\n" +
      "Nama: " + nama +
      "\nPenjemputan: " + jemput +
      "\nTujuan: " + tujuan +
      "\nTanggal: " + tanggal +
      "\nJam: " + jam +
      "\nPenumpang: " + penumpang
    );

} catch (error) {
  console.error("Firebase error:", error);

  alert(
    "Pesanan gagal!\n\n" +
    "Kode: " + error.code +
    "\nPesan: " + error.message
  );
}

}
