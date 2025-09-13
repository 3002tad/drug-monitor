// middleware/validateDrug.js
module.exports = function (req, res, next) {
  let { name, dosage, card, pack, perDay } = req.body;

  // Chuẩn hóa & ép kiểu
  name = (name || "").trim();
  dosage = (dosage || "").trim();
  card = Number(card);
  pack = Number(pack);
  perDay = Number(perDay);

  // a) Name > 5
  if (!name || name.length <= 5) {
    return res.status(400).send({ error: "Name must be more than 5 characters." });
  }

  // b) Dosage: XX-morning,XX-afternoon,XX-night (X là số)
  const dosageRegex = /^\d+-morning,\d+-afternoon,\d+-night$/;
  if (!dosageRegex.test(dosage)) {
    return res.status(400).send({ error: "Dosage must follow format XX-morning,XX-afternoon,XX-night." });
  }

  // c) Card > 0  (số viên trong 1 vỉ)
  if (!Number.isFinite(card) || card <= 0) {
    return res.status(400).send({ error: "Card (pills per card) must be greater than 0." });
  }

  // d) Pack > 0  (số vỉ trong 1 hộp)
  if (!Number.isFinite(pack) || pack <= 0) {
    return res.status(400).send({ error: "Pack (cards per pack) must be greater than 0." });
  }

  // e) PerDay > 0 và < 90
  if (!Number.isFinite(perDay) || perDay <= 0 || perDay >= 90) {
    return res.status(400).send({ error: "PerDay must be between 1 and 89." });
  }

  // Ghi lại body chuẩn hóa
  req.body.name = name;
  req.body.dosage = dosage;
  req.body.card = card;
  req.body.pack = pack;
  req.body.perDay = perDay;

  next();
};