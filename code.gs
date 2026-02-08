function onEdit(e) {
  if (!e) return;

  const sh = e.range.getSheet();
  if (sh.getName() !== "Data") return;
  if (e.range.getColumn() !== 5) return;
  if (e.value !== "PAID") return;

  const row = e.range.getRow();
  const parcel = sh.getRange(row,2).getValue();
  const qty = sh.getRange(row,4).getValue();

  Logger.log("PAID: " + parcel + " qty " + qty);
}
