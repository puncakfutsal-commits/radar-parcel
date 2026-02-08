/***********************
 * KONFIGURASI UTAMA
 ***********************/
const SHEET_URL = "https://docs.google.com/spreadsheets/d/ISI_ID_SHEET_KAMU/edit";
const ADMIN_WA  = "6282278298916"; // ganti nomor admin

/***********************
 * GET STOK (UNTUK WEBSITE)
 ***********************/
function doGet(e) {
  const ss = SpreadsheetApp.openByUrl(SHEET_URL);
  const sheet = ss.getSheetByName("Stok");

  if (!sheet) {
    return ContentService
      .createTextOutput("Sheet Stok tidak ditemukan")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  const values = sheet.getDataRange().getValues();
  values.shift(); // hapus header

  let stok = {};
  values.forEach(row => {
    const nama = row[0];
    const sisa = row[1];
    stok[nama] = sisa;
  });

  return ContentService
    .createTextOutput(JSON.stringify(stok))
    .setMimeType(ContentService.MimeType.JSON);
}

/***********************
 * POST ORDER DARI WEBSITE
 ***********************/
function doPost(e) {
  const ss = SpreadsheetApp.openByUrl(SHEET_URL);
  const dataSheet = ss.getSheetByName("Data");
  const stokSheet = ss.getSheetByName("Stok");

  if (!dataSheet || !stokSheet) {
    return ContentService
      .createTextOutput("Sheet Data / Stok tidak ditemukan")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  const payload = JSON.parse(e.postData.contents);

  const produk = payload.produk;
  const harga  = Number(payload.harga);
  const qty    = Number(payload.qty);
  const status = payload.status || "ORDER";

  // SIMPAN KE SHEET DATA
  dataSheet.appendRow([
    new Date(),
    produk,
    harga,
    qty,
    status
  ]);

  // KURANGI STOK
  const stokData = stokSheet.getDataRange().getValues();
  for (let i = 1; i < stokData.length; i++) {
    if (stokData[i][0] === produk) {
      const sisa = stokData[i][1] - qty;
      stokSheet.getRange(i + 1, 2).setValue(sisa);
      break;
    }
  }

  // BUAT LINK WA ADMIN (AMAN, TANPA BLOK)
  const msg =
`🔔 ORDER BARU MASUK

Produk : ${produk}
Qty    : ${qty}
Total  : Rp ${(harga * qty).toLocaleString('id-ID')}
Status : ${status}`;

  const waLink =
    "https://wa.me/" + ADMIN_WA +
    "?text=" + encodeURIComponent(msg);

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      wa: waLink
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/***********************
 * NOTIFIKASI SAAT STATUS DIUBAH KE PAID
 ***********************/
function onEdit(e) {
  if (!e) return;

  const sh = e.range.getSheet();
  if (sh.getName() !== "Data") return;
  if (e.range.getColumn() !== 5) return;
  if (e.value !== "PAID") return;

  const row = e.range.getRow();
  const produk = sh.getRange(row, 2).getValue();
  const harga  = sh.getRange(row, 3).getValue();
  const qty    = sh.getRange(row, 4).getValue();

  const msg =
`✅ PEMBAYARAN DITERIMA

Produk : ${produk}
Qty    : ${qty}
Total  : Rp ${(harga * qty).toLocaleString('id-ID')}`;

  const waLink =
    "https://wa.me/" + ADMIN_WA +
    "?text=" + encodeURIComponent(msg);

  // simpan link WA di kolom F
  sh.getRange(row, 6).setValue(waLink);
}
