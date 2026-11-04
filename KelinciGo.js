
/* =========================================
   KELINCI GO
   Kapasitas: 24 penumpang per kereta
   Maksimal: 50 kereta
========================================= */

const KAPASITAS_KERETA = 24;
const MAKS_KERETA = 50;


/* =========================================
   BUKA FORM PESANAN
========================================= */

function bukaPesanan() {
  const form = document.getElementById("formPesanan");

  if (!form) {
    alert("Form pemesanan tidak ditemukan.");
    return;
  }

  form.style.display = "block";

  form.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  hitungKapasitas();
}


/* =========================================
   JUMLAH KERETA
========================================= */

function ubahKereta(perubahan) {
  const jumlahElement =
    document.getElementById("jumlahKereta");

  if (!jumlahElement) return;

  let jumlah =
    parseInt(jumlahElement.textContent) || 1;

  jumlah += perubahan;

  if (jumlah < 1) jumlah = 1;

  if (jumlah > MAKS_KERETA) {
    jumlah = MAKS_KERETA;
  }

  jumlahElement.textContent = jumlah;

  hitungKapasitas();
}


/* =========================================
   HITUNG KAPASITAS
========================================= */

function hitungKapasitas() {
  const jumlahElement =
    document.getElementById("jumlahKereta");

  const kapasitasElement =
    document.getElementById("totalKapasitas");

  if (!jumlahElement || !kapasitasElement) {
    return;
  }

  const jumlah =
    parseInt(jumlahElement.textContent) || 1;

  const total =
    jumlah * KAPASITAS_KERETA;

  kapasitasElement.textContent =
    total + " penumpang";
}


/* =========================================
   SALIN KODE PESANAN
========================================= */

async function salinKodePesanan(kode) {
  if (!kode) {
    alert("Kode pesanan tidak ditemukan.");
    return;
  }

  try {
    await navigator.clipboard.writeText(kode);

    alert("Kode pesanan berhasil disalin!");

  } catch (error) {
    const textarea =
      document.createElement("textarea");

    textarea.value = kode;

    document.body.appendChild(textarea);

    textarea.select();

    const berhasil =
      document.execCommand("copy");

    textarea.remove();

    if (berhasil) {
      alert("Kode pesanan berhasil disalin!");
    } else {
      alert("Kode pesanan:\n" + kode);
    }
  }
}


/* =========================================
   KIRIM PESANAN
========================================= */

async function kirimPesanan() {

  const nama =
    document.getElementById("nama")?.value.trim();

  const whatsapp =
    document.getElementById("whatsapp")?.value.trim();

  const jemput =
    document.getElementById("jemput")?.value.trim();

  const tujuan =
    document.getElementById("tujuan")?.value.trim();

  const tanggal =
    document.getElementById("tanggal")?.value;

  const jam =
    document.getElementById("jam")?.value;

  const jumlahKereta =
    parseInt(
      document.getElementById("jumlahKereta")?.textContent
    );

  const penumpang =
    Number(
      document.getElementById("penumpang")?.value
    );


  /* Validasi form */

  if (
    !nama ||
    !whatsapp ||
    !jemput ||
    !tujuan ||
    !tanggal ||
    !jam ||
    !document.getElementById("penumpang")?.value
  ) {
    alert("Mohon lengkapi semua data!");
    return;
  }


  /* Validasi kereta */

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


  /* Validasi penumpang */

  if (
    !Number.isInteger(penumpang) ||
    penumpang < 1 ||
    penumpang > totalKapasitas
  ) {
    alert(
      "Jumlah penumpang maksimal " +
      totalKapasitas +
      " orang sesuai kapasitas kereta."
    );

    return;
  }


  /* Validasi teks */

  if (
    nama.length > 100 ||
    whatsapp.length < 8 ||
    whatsapp.length > 20 ||
    jemput.length > 200 ||
    tujuan.length > 200
  ) {
    alert("Periksa kembali data yang kamu masukkan.");
    return;
  }


  /* Periksa Firebase */

  if (
    typeof db === "undefined" ||
    !db ||
    typeof db.collection !== "function"
  ) {
    alert("Firebase belum terhubung.");
    return;
  }


  /* Tombol loading */

  const tombol =
    document.querySelector(
      '#formPesanan button[onclick="kirimPesanan()"]'
    );

  const teksTombol =
    tombol?.textContent || "Kirim Pesanan";

  if (tombol) {
    tombol.disabled = true;
    tombol.textContent = "Mengirim...";
  }


  try {

    /* Data pesanan */

    const statusAwal =
      "Menunggu konfirmasi";

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


    /* Buat kode pesanan */

    const pesananRef =
      db.collection("orders").doc();

    const kode =
      pesananRef.id;


    /* Tracking */

    const trackingRef =
      db.collection("tracking").doc(kode);




/* Simpan pesanan dengan nomor berurutan */

let kode;

const counterRef = db
  .collection("counters")
  .doc("nomorPesanan");

await db.runTransaction(async (transaction) => {
  const counterSnap = await transaction.get(counterRef);

  if (!counterSnap.exists) {
    throw new Error("Counter nomor pesanan belum dibuat.");
  }

  const nomorBerikutnya =
    counterSnap.data().lastNumber + 1;

  kode = `KG-${nomorBerikutnya}`;

  const pesananRef = db
    .collection("orders")
    .doc(kode);

  const trackingRef = db
    .collection("tracking")
    .doc(kode);

  transaction.update(counterRef, {
    lastNumber: nomorBerikutnya
  });

  transaction.set(pesananRef, dataPesanan);

  transaction.set(trackingRef, {
    status: statusAwal,
    nama: nama,
    tujuan: tujuan,
    tanggal: tanggal,
    jam: jam,
    jumlahKereta: jumlahKereta,
    penumpang: penumpang
  });
});

/* kode sekarang KG-1, KG-2, dan seterusnya */
     

    /* Tampilkan hasil */

    const hasil =
      document.getElementById("hasilPesanan");

    if (hasil) {

      hasil.innerHTML = `
        <div class="order-code-card">

          <h3>🐰 Pesanan Berhasil</h3>

          <p>Kode pesanan:</p>

          <strong>${kode}</strong>

          <p>
            Jumlah kereta:
            ${jumlahKereta}
          </p>

          <p>
            Kapasitas per kereta:
            24 penumpang
          </p>

          <p>
            Total kapasitas:
            ${totalKapasitas} penumpang
          </p>

          <p>
            Jumlah penumpang:
            ${penumpang} orang
          </p>

          <p>
            Status:
            ${statusAwal}
          </p>

          <button
            type="button"
            class="copy-code-btn"
            id="salinKodeBtn">
            📋 Salin Kode Pesanan
          </button>

        </div>
      `;

      const salinBtn =
        document.getElementById("salinKodeBtn");

      if (salinBtn) {
        salinBtn.onclick = function() {
          salinKodePesanan(kode);
        };
      }

      hasil.scrollIntoView({
        behavior: "smooth"
      });
    }

    alert("Pesanan berhasil dikirim!");

  } catch (error) {

    console.error("Firebase error:", error);

    alert(
      "Pesanan gagal dikirim.\n" +
      (error.code || "") +
      "\n" +
      (error.message || "")
    );

  } finally {

    if (tombol) {
      tombol.disabled = false;
      tombol.textContent = teksTombol;
    }

  }

}


/* =========================================
   SAAT HALAMAN DIBUKA
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {
    hitungKapasitas();
  }
);
