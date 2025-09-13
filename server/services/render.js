// server/services/render.js
const axios = require('axios');

// Lấy BASE_URI và PORT từ env hoặc mặc định
const PORT = process.env.PORT || 8080;
const BASE_URI = process.env.BASE_URI || 'http://localhost';

exports.homeRoutes = function (req, res, next) {
  axios.get(`${BASE_URI}:${PORT}/api/drugs`)
    .then(function (response) {
      res.render('index', { drugs: response.data, title: 'Home' });
    })
    .catch(function (err) {
      err.status = 500;
      err.message = err.message || 'Failed to load home page.';
      next(err);
    });
};

exports.addDrug = function (req, res) {
  res.render('add_drug', { title: 'Add Drug' });
};

exports.updateDrug = function (req, res, next) {
  axios.get(`${BASE_URI}:${PORT}/api/drugs`, { params: { id: req.query.id } })
    .then(({ data }) => {
      res.render('update_drug', { drug: data, title: 'Edit Drug' });
    })
    .catch(err => {
      err.status = 500;
      err.message = err.message || 'Failed to load update page.';
      next(err);
    });
};

exports.manage = function (req, res, next) {
  axios.get(`${BASE_URI}:${PORT}/api/drugs`)
    .then(({ data }) => {
      res.render('manage', { drugs: data, title: 'Manage' });
    })
    .catch(err => {
      err.status = 500;
      err.message = err.message || 'Failed to load manage page.';
      next(err);
    });
};

exports.purchase = function (req, res, next) {
  const days = Number(req.query.days || 30);

  axios.get(`${BASE_URI}:${PORT}/api/drugs`)
    .then(({ data }) => {
      const items = data.map(d => {
        const perDay = Number(d.perDay);
        const pillsNeeded = perDay * days;

        const card = Number(d.card); // viên mỗi vỉ
        const pack = Number(d.pack); // viên mỗi hộp

        const cardsToBuy = Math.ceil(pillsNeeded / card);
        const packsToBuy = Math.ceil(pillsNeeded / pack);

        const packsPerCard = Math.ceil(card / pack); // thông tin bổ sung

        return {
          ...d,
          days,
          pillsNeeded,
          cardsToBuy,
          packsToBuy,
          packsPerCard
        };
      });

      res.render('purchase', { title: 'Purchase', drugs: items, days });
    })
    .catch(err => {
      err.status = 500;
      err.message = err.message || 'Failed to load purchase page.';
      next(err);
    });
};