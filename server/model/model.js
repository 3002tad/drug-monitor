// server/model/model.js
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 6,
  },
  dosage: {
    type: String,
    required: true,
    match: [/^\d+-morning,\d+-afternoon,\d+-night$/, 'Invalid dosage format'],
  },
  // card = số viên trong 1 vỉ
  card: {
    type: Number,
    required: true,
    min: 1, // > 0
  },
  // pack = số vỉ trong 1 hộp
  pack: {
    type: Number,
    required: true,
    min: 1, // > 0
  },
  perDay: {
    type: Number,
    required: true,
    min: 1,
    max: 89,
  },
});

module.exports = mongoose.model('drugs', schema);