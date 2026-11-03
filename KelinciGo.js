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
    !nama || !whatsapp || !jemput ||
    !tujuan || !tanggal || !jam || !penumpang
  ) {
    alert("Mohon lengkapi semua data!");
    return;
  }

  if (penumpang < 1 || penumpang > 30) {
    alert("Jumlah penumpang harus 1 sampai 30.");
    return;
  }

  const statusAwal = "Menunggu konfirmasi";

  const dataPesanan = {
    nama,
    whatsapp,
    jemput,
    tujuan,
    tanggal,
    jam,
    penumpang,
    status: statusAwal,
    dibuatPada: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    // Buat ID pesanan terlebih dahulu
    const pesananRef = db.collection("orders").doc();
    const kode = pesananRef.id;

    // Simpan pesanan lengkap
    await pesananRef.set(dataPesanan);

    // Simpan status pelacakan dengan ID yang sama
    await db.collection("tracking").doc(kode).set({
      status: statusAwal
    });

    // Tampilkan kartu kode pesanan
    document.getElementById("hasilPesanan").innerHTML = `
      <div class="order-code-card">
        <div class="order-code-header">
          <strong style="color:#168747">🐰 KelinciGo</strong>
          <span style="color:#168747;font-size:12px">
            ● Pesanan berhasil
          </span>
        </div>

        <p class="order-code-label">KODE PESANAN</p>

        <div class="order-code-number">${kode}</div>

        <p class="order-code-info">
          Simpan kode ini untuk mengecek status pesanan.
        </p>

        <button class="copy-code-btn"
          onclick="salinKodePesanan('${kode}')">
          📋 Salin Kode Pesanan
        </button>
    `;

    document.getElementById("hasilPesanan")
      .scrollIntoView({ behavior: "smooth" });

    alert("Pesanan berhasil dikirim!");

  } catch (error) {
    console.error("Firebase error:", error);
    alert(
      "Pesanan gagal dikirim.\n" +
      error.code + "\n" + error.message
    );
  }
}
