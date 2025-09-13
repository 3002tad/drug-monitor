// server/model/model.js
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // tránh trùng tên thuốc
    trim: true,
    minlength: 6, // > 5 ký tự
  },
  dosage: {
    type: String,
    required: true,
    match: [/^\d+-morning,\d+-afternoon,\d+-night$/, 'Invalid dosage format'],
  },
  card: {
    type: Number,
    required: true,
    min: 1001, // > 1000
  },
  pack: {
    type: Number,
    required: true,
    min: 1, // > 0
  },
  perDay: {
    type: Number,
    required: true,
    min: 1,
    max: 89, // < 90
  },
});

module.exports = mongoose.model('drugs', schema);