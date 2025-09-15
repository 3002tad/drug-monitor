// server/routes/routes.js
const express = require('express');
const route = express.Router();

// Import đúng các hàm render (nếu sai đường dẫn => undefined)
const services = require('../services/render');

// Debug nhỏ để thấy các key có thực sự được export không
// (Bạn có thể comment dòng này sau khi xác nhận)
console.log('render services exported keys:', Object.keys(services));

const controller = require('../controller/controller');
const extraApi = require('../controller/extraApi');
// validateDrug nằm ở project root /middleware, còn file này ở /server/routes => ../../
const validateDrug = require('../../middleware/validateDrug');

// Web pages
route.get('/', services.homeRoutes);
route.get('/add-drug', services.addDrug);
route.get('/update-drug', services.updateDrug);
route.get('/check-dosage', services.checkDosage);
route.get('/manage', services.manage);
route.get('/purchase', services.purchase);

// API
route.post('/api/drugs', validateDrug, controller.create);
route.get('/api/drugs', controller.find);
route.put('/api/drugs/:id', validateDrug, controller.update);
route.delete('/api/drugs/:id', controller.delete);

route.get('/api/dosage/check', extraApi.checkDosageAPI);
route.get('/api/purchase/plan', extraApi.purchasePlanAPI);

module.exports = route;