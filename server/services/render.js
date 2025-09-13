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
  const days = Number(req.query.days || 30);

  axios.get(`${BASE_URI}:${PORT}/api/drugs`)
    .then(({ data }) => {
      const items = data.map((d) => {
        const perDay = Number(d.perDay);
        const pillsNeeded = perDay * days;

        const pillsPerCard = Number(d.card);          // viên/vỉ
        const cardsPerPack = Number(d.pack);          // vỉ/hộp
        const pillsPerPack = pillsPerCard * cardsPerPack;

        const cardsToBuy = Math.ceil(pillsNeeded / pillsPerCard);
        const packsToBuy = Math.ceil(pillsNeeded / pillsPerPack);

        return { ...d, days, pillsNeeded, cardsToBuy, packsToBuy, pillsPerCard, cardsPerPack, pillsPerPack };
      });

      res.render('purchase', { title: 'Purchase', drugs: items, days });
    })
    .catch((err) => { err.status = 500; err.message = err.message || 'Failed to load purchase page.'; next(err); });
}

module.exports = {
  homeRoutes,
  addDrug,
  updateDrug,
  manage,
  purchase,
};
