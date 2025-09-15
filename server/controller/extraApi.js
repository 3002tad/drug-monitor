// server/controller/extraApi.js
const Drugdb = require('../model/model');

exports.checkDosageAPI = async (req, res) => {
  try {
    const list = await Drugdb.find({}).sort({ name: 1 }).lean();
    const dosageRegex = /^\d+-morning,\d+-afternoon,\d+-night$/;

    const items = (list || []).map(d => {
      const str = String(d.dosage || '').trim();
      const ok = dosageRegex.test(str);

      let morning = null, afternoon = null, night = null, perDayFromDosage = null;
      if (ok) {
        const parts = str.split(',');
        const getNum = (label) => {
          const p = parts.find(x => x.includes(`-${label}`));
          const n = p ? Number(p.split('-')[0]) : NaN;
          return isFinite(n) ? n : null;
        };
        morning   = getNum('morning');
        afternoon = getNum('afternoon');
        night     = getNum('night');
        perDayFromDosage = [morning, afternoon, night].reduce((s,x)=>s+(Number(x)||0), 0);
      }

      return {
        _id: d._id,
        name: d.name,
        dosage: d.dosage,
        valid: ok,
        morning, afternoon, night, perDayFromDosage
      };
    });

    return res.json({ ok: true, items });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || 'Failed to check dosage.' });
  }
};

exports.purchasePlanAPI = async (req, res) => {
  try {
    const days = Math.max(1, Number(req.query.days || 30));
    const list = await Drugdb.find({}).sort({ name: 1 }).lean();

    const rows = (list || []).map(d => {
      const perDay = Number(d.perDay) || 0;
      const pillsNeeded = perDay * days;

      const pillsPerCard = Number(d.card) || 0;
      const cardsPerPack = Number(d.pack) || 0;
      const pillsPerPack = pillsPerCard * cardsPerPack;

      if (pillsNeeded <= 0 || pillsPerCard <= 0 || cardsPerPack <= 0) {
        return {
          _id: d._id, name: d.name, dosage: d.dosage,
          perDay, pillsNeeded,
          pillsPerCard, cardsPerPack, pillsPerPack,
          cardsBuy: 0, cardsBoughtPills: 0, cardsLeftover: 0, cardsEff: 0,
          packsBuy: 0, packsBoughtPills: 0, packsLeftover: 0, packsEff: 0,
        };
      }

      const cardsBuy = Math.ceil(pillsNeeded / pillsPerCard);
      const cardsBoughtPills = cardsBuy * pillsPerCard;
      const cardsLeftover = cardsBoughtPills - pillsNeeded;
      const cardsEff = cardsBoughtPills ? (pillsNeeded / cardsBoughtPills) * 100 : 0;

      const packsBuy = Math.ceil(pillsNeeded / pillsPerPack);
      const packsBoughtPills = packsBuy * pillsPerPack;
      const packsLeftover = packsBoughtPills - pillsNeeded;
      const packsEff = packsBoughtPills ? (pillsNeeded / packsBoughtPills) * 100 : 0;

      return {
        _id: d._id, name: d.name, dosage: d.dosage,
        perDay, pillsNeeded,
        pillsPerCard, cardsPerPack, pillsPerPack,
        cardsBuy, cardsBoughtPills, cardsLeftover, cardsEff,
        packsBuy, packsBoughtPills, packsLeftover, packsEff,
      };
    });

    return res.json({ ok: true, days, rows });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || 'Failed to build purchase plan.' });
  }
};
