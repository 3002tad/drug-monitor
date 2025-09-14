// server/services/render.js
const axios = require('axios');

const PORT = process.env.PORT || 8080;
const BASE_URI = process.env.BASE_URI || 'http://localhost';

function homeRoutes(req, res, next) {
  axios.get(`${BASE_URI}:${PORT}/api/drugs`)
    .then((response) => {
      res.render('index', { drugs: response.data, title: 'Home' });
    })
    .catch((err) => { err.status = 500; err.message = err.message || 'Failed to load home page.'; next(err); });
}

function addDrug(req, res) {
  res.render('add_drug', { title: 'Add Drug' });
}

function updateDrug(req, res, next) {
  axios.get(`${BASE_URI}:${PORT}/api/drugs`, { params: { id: req.query.id } })
    .then(({ data }) => {
      res.render('update_drug', { drug: data, title: 'Edit Drug' });
    })
    .catch((err) => { err.status = 500; err.message = err.message || 'Failed to load update page.'; next(err); });
}

function manage(req, res, next) {
  axios.get(`${BASE_URI}:${PORT}/api/drugs`)
    .then(({ data }) => {
      res.render('manage', { drugs: data, title: 'Manage' });
    })
    .catch((err) => { err.status = 500; err.message = err.message || 'Failed to load manage page.'; next(err); });
}

// Purchase: card = pills per card, pack = cards per pack
function purchase(req, res, next) {
  const days = Math.max(1, Number(req.query.days || 30));

  axios.get(`${BASE_URI}:${PORT}/api/drugs`)
    .then(({ data }) => {
      const rows = (data || []).map(d => {
        const perDay = Number(d.perDay) || 0;
        const pillsNeeded = perDay * days;

        const pillsPerCard = Number(d.card) || 0;   // viên/vỉ
        const cardsPerPack = Number(d.pack) || 0;   // vỉ/hộp
        const pillsPerPack = pillsPerCard * cardsPerPack;

        // Bảo vệ input xấu
        if (pillsNeeded <= 0 || pillsPerCard <= 0 || cardsPerPack <= 0) {
          return {
            _id: d._id,
            name: d.name,
            dosage: d.dosage,
            perDay,
            pillsNeeded,
            pillsPerCard,
            cardsPerPack,
            pillsPerPack,
            cardsBuy: 0,
            cardsBoughtPills: 0,
            cardsLeftover: 0,
            cardsEff: 0,
            packsBuy: 0,
            packsBoughtPills: 0,
            packsLeftover: 0,
            packsEff: 0,
          };
        }

        // Phương án mua theo vỉ (cards-only)
        const cardsBuy = Math.ceil(pillsNeeded / pillsPerCard);
        const cardsBoughtPills = cardsBuy * pillsPerCard;
        const cardsLeftover = cardsBoughtPills - pillsNeeded;
        const cardsEff = cardsBoughtPills ? (pillsNeeded / cardsBoughtPills) * 100 : 0;

        // Phương án mua theo hộp (packs-only)
        const packsBuy = Math.ceil(pillsNeeded / pillsPerPack);
        const packsBoughtPills = packsBuy * pillsPerPack;
        const packsLeftover = packsBoughtPills - pillsNeeded;
        const packsEff = packsBoughtPills ? (pillsNeeded / packsBoughtPills) * 100 : 0;

        return {
          _id: d._id,
          name: d.name,
          dosage: d.dosage,
          perDay,
          pillsNeeded,
          pillsPerCard,
          cardsPerPack,
          pillsPerPack,
          cardsBuy,
          cardsBoughtPills,
          cardsLeftover,
          cardsEff,
          packsBuy,
          packsBoughtPills,
          packsLeftover,
          packsEff,
        };
      }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      res.render('purchase', {
        title: 'Purchase',
        days,
        drugs: rows
      });
    })
    .catch((err) => {
      err.status = 500;
      err.message = err.message || 'Failed to load purchase page.';
      next(err);
    });
}

function checkDosage(req, res, next) {
  axios.get(`${BASE_URI}:${PORT}/api/drugs`)
    .then(({ data }) => {
      const dosageRegex = /^\d+-morning,\d+-afternoon,\d+-night$/;

      const rows = (data || []).map(d => {
        const str = String(d.dosage || '').trim();
        const ok = dosageRegex.test(str);

        let morning = null, afternoon = null, night = null, perDayFromDosage = null;
        if (ok) {
          // parse "X-morning,Y-afternoon,Z-night"
          const parts = str.split(',');
          const getNum = (label) => {
            const p = parts.find(s => s.includes(label));
            return p ? Number(p.split('-')[0]) : 0;
          };
          morning = getNum('morning');
          afternoon = getNum('afternoon');
          night = getNum('night');
          perDayFromDosage = morning + afternoon + night;
        }

        const perDaySaved = Number(d.perDay);
        const perDayMatches = (perDayFromDosage != null) ? (perDayFromDosage === perDaySaved) : null;

        return {
          _id: d._id,
          name: d.name,
          dosage: d.dosage,
          perDaySaved,
          valid: ok,
          morning, afternoon, night,
          perDayFromDosage,
          perDayMatches
        };
      }).sort((a,b)=> (a.name||'').localeCompare(b.name||''));

      res.render('check_dosage', { title: 'Check Dosage', items: rows });
    })
    .catch((err) => {
      err.status = 500;
      err.message = err.message || 'Failed to load Check Dosage page.';
      next(err);
    });
}

module.exports = {
  homeRoutes,
  addDrug,
  updateDrug,
  checkDosage,
  manage,
  purchase,
};
