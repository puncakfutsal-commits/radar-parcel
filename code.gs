var SHEET_ID = "1jthydOI1kfzbzGBygjiM7d4bnPiKTtgyvQ8ecNtQNqs";

/* === GET STOK === */
function doGet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName("Stok");

  var data = sh.getDataRange().getValues();
  data.shift();

  var result = {};
  for (var i = 0; i < data.length; i++) {
    result[data[i][0]] = data[i][1];
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/* === POST ORDER === */
function doPost(e) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var dataSh = ss.getSheetByName("Data");
  var stokSh = ss.getSheetByName("Stok");

  var p = JSON.parse(e.postData.contents);

  dataSh.appendRow([
    new Date(),
    p.produk,
    p.harga,
    p.qty,
    p.status
  ]);

  var stok = stokSh.getDataRange().getValues();
  for (var i = 1; i < stok.length; i++) {
    if (stok[i][0] === p.produk) {
      stokSh.getRange(i+1,2)
        .setValue(stok[i][1] - p.qty);
      break;
    }
  }

  return ContentService.createTextOutput("OK");
}
