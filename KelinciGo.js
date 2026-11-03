/* =========================================
   KELINCI GO - JAVASCRIPT
   Kapasitas setiap kereta: 24 penumpang
   Maksimal kereta: 50
========================================= */

const KAPASITAS_KERETA = 24;
const MAKS_KERETA = 50;

/* =========================================
   HITUNG TOTAL KAPASITAS
========================================= */

function hitungKapasitas() {
  const inputKereta = document.getElementById("jumlahKereta");
  const outputKapasitas = document.getElementById("totalKapasitas");

  if (!inputKereta || !outputKapasitas) {
    return;
  }

  const jumlahKereta = Number(inputKereta.value);

  if (
    !Number.isInteger(jumlahKereta) ||
    jumlahKereta < 1 ||
    jumlahKereta > MAKS_KERETA
  ) {
    outputKapasitas.textContent = "Jumlah kereta tidak valid";
    return;
  }

  const totalKapasitas = jumlahKereta * KAPASITAS_KERETA;

  outputKapasitas.textContent =
    totalKapasitas + " penumpang";
}

/* =========================================
   SALIN KODE PESANAN
========================================= */

function salinKodePesanan(kode) {
  if (!kode) {
    alert("Kode pesanan tidak ditemukan.");
    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(kode)
      .then(() => {
        alert("Kode pesanan berhasil disalin!");
      })
      .catch(() => {
        salinKodeManual(kode);
      });
  } else {
    salinKodeManual(kode);
  }
}

function salinKodeManual(kode) {
  const textarea = document.createElement("textarea");

  textarea.value = kode;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);

  textarea.select();

  try {
    const berhasil = document.execCommand("copy");

    if (berhasil) {
      alert("Kode pesanan berhasil disalin!");
    } else {
      alert("Silakan salin kode secara manual:\n" + kode);
    }
  } catch (error) {
    alert("Silakan salin kode secara manual:\n" + kode);
  }

  textarea.remove();
}

/* =========================================
   KIRIM PESANAN
========================================= */

async function kirimPesanan() {

  /* Ambil data form */

  const nama = document.getElementById("nama").value.trim();

  const whatsapp = document.getElementById("whatsapp").value.trim();

  const jemput = document.getElementById("jemput").value.trim();

  const tujuan = document.getElementById("tujuan").value.trim();

  const tanggal = document.getElementById("tanggal").value;

  const jam = document.getElementById("jam").value;

  const jumlahKereta = Number(
    document.getElementById("jumlahKereta").value
  );

  const penumpang = Number(
    document.getElementById("penumpang").value
  );


  /* Validasi data kosong */

  if (
    !nama ||
    !whatsapp ||
    !jemput ||
    !tujuan ||
    !tanggal ||
    !jam ||
    !document.getElementById("jumlahKereta").value ||
    !document.getElementById("penumpang").value
  ) {
    alert("Mohon lengkapi semua data!");
    return;
  }


  /* Validasi jumlah kereta */

  if (
    !Number.isInteger(jumlahKereta) ||
    jumlahKereta < 1 ||
    jumlahKereta > MAKS_KERETA
  ) {
    alert("Jumlah kereta harus 1 sampai 50.");
    return;
  }


  /* Hitung kapasitas */

  const totalKapasitas =
    jumlahKereta * KAPASITAS_KERETA;


  /* Validasi jumlah penumpang */

  if (
    !Number.isInteger(penumpang) ||
    penumpang < 1 ||
    penumpang > totalKapasitas
  ) {
    alert(
      "Jumlah penumpang harus 1 sampai " +
      totalKapasitas +
      " orang sesuai kapasitas kereta."
    );

    return;
  }


  /* Validasi nama */

  if (nama.length > 100) {
    alert("Nama maksimal 100 karakter.");
    return;
  }


  /* Validasi WhatsApp */

  if (
    whatsapp.length < 8 ||
    whatsapp.length > 20
  ) {
    alert("Nomor WhatsApp tidak valid.");
    return;
  }


  /* Validasi lokasi */

  if (
    jemput.length > 200 ||
    tujuan.length > 200
  ) {
    alert("Lokasi maksimal 200 karakter.");
    return;
  }


  /* Status awal */

  const statusAwal = "Menunggu konfirmasi";


  /* Data pesanan */

  const dataPesanan = {

    nama: nama,

    whatsapp: whatsapp,

    jemput: jemput,

    tujuan: tujuan,

    tanggal: tanggal,

    jam: jam,

    jumlahKereta: jumlahKereta,

    kapasitasKereta: KAPASITAS_KERETA,

    totalKapasitas: totalKapasitas,

    penumpang: penumpang,

    status: statusAwal,

    dibuatPada:
      firebase.firestore.FieldValue.serverTimestamp()

  };


  /* Periksa Firebase */

  if (
    typeof db === "undefined" ||
    !db ||
    typeof db.collection !== "function"
  ) {
    alert("Firebase belum terhubung. Periksa konfigurasi Firebase.");
    return;
  }


  /* Tombol loading */

  const tombol = document.querySelector(
    '#formPesanan button[onclick="kirimPesanan()"]'
  );

  const teksTombol = tombol
    ? tombol.textContent
    : "";

  if (tombol) {
    tombol.disabled = true;
    tombol.textContent = "Mengirim pesanan...";
  }


  try {

    /* Buat ID pesanan */

    const pesananRef = db.collection("orders").doc();

    const kode = pesananRef.id;


    /* Referensi tracking */

    const trackingRef = db
      .collection("tracking")
      .doc(kode);


    /* Simpan kedua dokumen secara atomik */

    const batch = db.batch();

    batch.set(pesananRef, dataPesanan);

    batch.set(trackingRef, {
      status: statusAwal
    });

    await batch.commit();


    /* Tampilkan hasil */

    const hasil = document.getElementById(
      "hasilPesanan"
    );

    if (hasil) {

      hasil.innerHTML = `
        <div class="order-code-card">

          <div class="order-code-header">

            <strong style="color:#168747">
              🐰 KelinciGo
            </strong>

            <span style="color:#168747;font-size:12px">
              ● Pesanan berhasil
            </span>

          </div>

          <p class="order-code-label">
            KODE PESANAN
          </p>

          <div class="order-code-number">
            ${kode}
          </div>

          <p class="order-code-info">
            Simpan kode ini untuk mengecek status pesanan.
          </p>

          <div class="order-code-info">

            <p>
              Jumlah kereta:
              <strong>${jumlahKereta}</strong>
            </p>

            <p>
              Kapasitas per kereta:
              <strong>24 penumpang</strong>
            </p>

            <p>
              Total kapasitas:
              <strong>${totalKapasitas} penumpang</strong>
            </p>

            <p>
              Jumlah penumpang:
              <strong>${penumpang} orang</strong>
            </p>

          </div>

          <button
            class="copy-code-btn"
            onclick="salinKodePesanan('${kode}')">

            📋 Salin Kode Pesanan

          </button>

        </div>
      `;

      hasil.scrollIntoView({
        behavior: "smooth"
      });

    }


    /* Notifikasi */

    alert("Pesanan berhasil dikirim!");

  } catch (error) {

    console.error(
      "Firebase error:",
      error
    );

    alert(
      "Pesanan gagal dikirim.\n" +
      (error.code || "unknown") +
      "\n" +
      (error.message || "Terjadi kesalahan.")
    );

  } finally {

    /* Aktifkan kembali tombol */

    if (tombol) {
      tombol.disabled = false;
      tombol.textContent = teksTombol;
    }

  }

}


/* =========================================
   HITUNG KAPASITAS SAAT HALAMAN DIBUKA
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  hitungKapasitas();

});
