module.exports = function(req, res, next) {
  const { name, dosage, card, pack, perDay } = req.body;

  // a. Name > 5 ký tự
  if (!name || name.length <= 5) {
    return res.status(400).send({ error: "Name must be more than 5 characters." });
  }

  // b. Dosage theo format: XX-morning,XX-afternoon,XX-night
  const dosageRegex = /^\d+-morning,\d+-afternoon,\d+-night$/;
  if (!dosageRegex.test(dosage)) {
    return res.status(400).send({ error: "Dosage must follow format XX-morning,XX-afternoon,XX-night." });
  }

  // c. Card > 1000
  if (card <= 1000) {
    return res.status(400).send({ error: "Card must be greater than 1000." });
  }

  // d. Pack > 0
  if (pack <= 0) {
    return res.status(400).send({ error: "Pack must be greater than 0." });
  }

  // e. PerDay > 0 và < 90
  if (perDay <= 0 || perDay >= 90) {
    return res.status(400).send({ error: "PerDay must be between 1 and 89." });
  }

  next();
};