const express = require('express');
const multer = require('multer');
const Product = require('../models/product.js');
const router = express.Router();

// Настройка multer для загрузки файлов в память (например, для изображений)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST-запрос на добавление нового продукта
router.post('/', upload.single('product-image'), async (req, res) => {
  try {
    const {
      'product-name': name,
      'product-article': article,
      'product-price': price,
      'product-description': description,
      'product-properties': properties,
      'product-category': category,
    } = req.body;

    // Если изображение есть, преобразуем его в base64
    const image = req.file ? req.file.buffer.toString('base64') : null;

    // Создаем новый продукт с полученными данными
    const product = new Product({
      name,
      article,
      price,
      description,
      properties,
      category,
      image,
    });

    // Сохраняем продукт в базе данных
    await product.save();

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// GET-запрос на получение всех продуктов
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;
