function onEdit(e) {
  const sheet = e.range.getSheet();
  const col = e.range.getColumn();
  const row = e.range.getRow();

  // Hanya sheet Data & kolom STATUS (E)
  if (sheet.getName() !== "Data" || col !== 5) return;

  const status = e.value;
  if (status !== "PAID") return;

  const tanggal = sheet.getRange(row,1).getValue();
  const parcel  = sheet.getRange(row,2).getValue();
  const harga   = sheet.getRange(row,3).getValue();
  const qty     = sheet.getRange(row,4).getValue();

  const ADMIN_WA = "6282278298916"; // GANTI NOMOR ADMIN

  const msg =
`✅ PEMBAYARAN MASUK

Parcel : ${parcel}
Qty    : ${qty}
Harga  : Rp ${harga.toLocaleString('id-ID')}
Tanggal: ${tanggal}`;

  const url = "https://wa.me/"+ADMIN_WA+"?text="+encodeURIComponent(msg);

  // LOG aja dulu (WA manual klik)
  Logger.log(url);
}
