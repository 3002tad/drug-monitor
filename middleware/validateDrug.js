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

  // c) Card > 1000
  if (!Number.isFinite(card) || card <= 1000) {
    return res.status(400).send({ error: "Card must be greater than 1000." });
  }

  // d) Pack > 0
  if (!Number.isFinite(pack) || pack <= 0) {
    return res.status(400).send({ error: "Pack must be greater than 0." });
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