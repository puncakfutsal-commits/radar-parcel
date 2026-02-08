const SHEET_URL = "PASTE_LINK_GOOGLE_SHEET_KAMU";
const ADMIN_WA  = "6282278298916"; // nomor WA admin

/* ======================
   GET → KIRIM STOK KE WEB
====================== */
function doGet(e) {
  const ss = SpreadsheetApp.openByUrl(SHEET_URL);
  const stokSheet = ss.getSheetByName("Stok");
  const data = stokSheet.getDataRange().getValues();
  data.shift();

  let stok = {};
  data.forEach(r => stok[r[0]] = r[1]);

  return ContentService
    .createTextOutput(JSON.stringify(stok))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ======================
   POST → ORDER / PAID
====================== */
function doPost(e) {
  const ss = SpreadsheetApp.openByUrl(SHEET_URL);
  const dataSheet = ss.getSheetByName("Data");
  const stokSheet = ss.getSheetByName("Stok");

  const body = JSON.parse(e.postData.contents);

  // SIMPAN DATA ORDER
  dataSheet.appendRow([
    new Date(),
    body.produk,
    body.harga,
    body.qty,
    body.status
  ]);

  // KURANGI STOK JIKA ORDER
  if (body.status === "ORDER") {
    const stokData = stokSheet.getDataRange().getValues();
    for (let i = 1; i < stokData.length; i++) {
      if (stokData[i][0] === body.produk) {
        stokSheet.getRange(i + 1, 2)
          .setValue(stokData[i][1] - body.qty);
        break;
      }
    }
  }

  // NOTIFIKASI WA ADMIN
  let msg =
`🔔 ${body.status === "PAID" ? "PEMBAYARAN MASUK" : "ORDER BARU"}
Produk : ${body.produk}
Harga  : Rp ${body.harga.toLocaleString("id-ID")}
Qty    : ${body.qty}
Status : ${body.status}`;

  UrlFetchApp.fetch(
    "https://api.whatsapp.com/send?phone=" +
    ADMIN_WA + "&text=" + encodeURIComponent(msg)
  );

  return ContentService
    .createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}
