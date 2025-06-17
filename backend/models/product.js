const mongoose = require('mongoose');

// === Схема товара === //
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  article: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: false, default: '' },
  properties: {
    type: [String], // <-- МАССИВ СТРОК
    default: []
  },
  category: { type: String, required: true },
  image: { type: String, required: true } // путь к изображению
});

// === Создание модели === //
module.exports = mongoose.model('Product', productSchema);