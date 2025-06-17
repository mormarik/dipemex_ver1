// server.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const User = require('./models/user');
const Product = require('./models/product');
const Order = require('./models/order');

const app = express();
const port = 3000;

// === Подключение к MongoDB === //
mongoose.connect('mongodb://localhost:27017/your-database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB подключено'))
.catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// === Настройка загрузки изображений === //
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

function checkFileType(file, cb) {
  const allowedTypes = /jpeg|jpg|png|svg/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (allowedTypes.test(extname) && allowedTypes.test(mimetype.split('/')[1])) {
    return cb(null, true);
  }

  cb(new Error('Разрешены только изображения: .png, .jpg, .jpeg, .svg'));
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // до 10MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// === Middleware === //
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === CORS === //
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// === Session middleware === //
app.use(session({
  secret: 'mySuperSecretKey12345!#',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/emex-project' }), // или URI твоей БД
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 часа
    secure: false, // true, если используешь HTTPS
    httpOnly: true,
    sameSite: 'lax'
  },
  name: 'sid'
}));

// === Статические файлы === //
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// === Регистрация === //
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: "Все поля обязательны" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email или username уже используются" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = (username === 'admin' && email === 'admin@yandex.ru') ? 'admin' : 'user';

    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();

    req.session.userId = newUser._id;
    req.session.user = {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    };

    console.log("✅ Пользователь зарегистрирован:", req.session.user);

    res.status(200).json({
      success: true,
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// === Вход === //
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Пользователь не найден' });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: 'Неверный пароль' });

    // ✅ Сохраняем данные пользователя в сессии
    req.session.userId = user._id;
    req.session.user = {
      username: user.username,
      email: user.email,
      role: user.role
    };

    console.log("✅ Вход выполнен:", req.session);

    res.status(200).json({
      success: true,
      user: req.session.user
    });
  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// === Добавление товара === //
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(403).json({ message: 'Не авторизован' });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Только админ может добавлять товары' });
    }

    const { name, article, price, description, properties, category } = req.body;

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ message: 'Цена должна быть числом' });
    }

    const parsedProperties = properties
      ? properties.split(',').map(p => p.trim()).filter(Boolean)
      : [];

    const image = req.file ? `/api/uploads/${req.file.filename}` : '/api/uploads/default.png';

    const newProduct = new Product({
      name,
      article,
      price: parsedPrice,
      description: description || '',
      properties: parsedProperties,
      category,
      image
    });

    await newProduct.save();
    res.status(201).json({ message: 'Товар успешно добавлен' });
  } catch (err) {
    console.error('❌ Ошибка при добавлении товара:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// === Получение всех товаров === //
app.get("/api/products", async (req, res) => {
  const { article } = req.query;

  if (article) {
    try {
      const product = await Product.findOne({ article: article.toString() });

      if (!product) {
        return res.status(404).json({ message: "Товар не найден" });
      }

      return res.json([product]); // ✅ Оборачиваем в массив
    } catch (err) {
      console.error("❌ Ошибка поиска по артикулу:", err);
      return res.status(500).json([]);
    }
  }

  try {
    const products = await Product.find().exec();
    res.json(products);
  } catch (err) {
    console.error("❌ Ошибка получения товаров:", err);
    res.status(500).json([]);
  }
});

// === Проверка сессии === //
app.get('/api/session', (req, res) => {
  console.log("SESSION:", req.session); // 🎯 Отладка
  res.json({
    session: req.session,
    user: req.session.user || 'Не авторизован',
    userId: req.session.userId || null
  });
});

// === Получение всех заказов (админ) === //
app.get('/api/orders', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(403).json({ message: 'Не авторизован' });

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Только админ может просматривать заказы' });
    }

    const orders = await Order.find().populate('userId', 'username email role').exec();
    res.status(200).json(orders);
  } catch (err) {
    console.error('Ошибка получения заказов:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post("/api/orders", async (req, res) => {
  const { fullName, address, phone, email, deliveryMethod, paymentMethod, items } = req.body;

  if (!fullName || !address || !phone || !email || !deliveryMethod || !paymentMethod || !Array.isArray(items)) {
    return res.status(400).json({ message: "Недостаточно данных" });
  }

  const userId = req.session.userId;
  if (!userId) {
    return res.status(403).json({ message: "Вы не авторизованы" });
  }

  let total = 0;

  // Получаем товары из базы
  const products = await Product.find({ _id: { $in: items.map(i => i.productId) } });

  const orderItems = items.map(item => {
    const product = products.find(p => p._id.toString() === item.productId);
    if (!product) return null;

    const quantity = item.quantity || 1;
    total += product.price * quantity;

    return {
      productId: item.productId,
      name: product.name,
      price: product.price,
      quantity
    };
  }).filter(Boolean);

  if (orderItems.length === 0) {
    return res.status(400).json({ message: "Неверные ID товаров" });
  }

  const newOrder = new Order({
    userId,
    products: orderItems,
    totalAmount: total,
    status: "Собран",
    createdAt: new Date()
  });

  try {
    await newOrder.save();
    res.status(201).json({ message: "Заказ оформлен", order: newOrder });
  } catch (err) {
    console.error("❌ Ошибка сохранения заказа:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "username email role").exec();
    res.status(200).json(orders);
  } catch (err) {
    console.error("Ошибка получения всех заказов:", err);
    res.status(500).json([]);
  }
});

app.put("/api/orders/:id", async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  try {
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Заказ не найден" });

    res.status(200).json({ message: "Статус обновлён", order });
  } catch (err) {
    console.error("Ошибка обновления статуса:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// === Получение товара по ID === //
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    res.status(200).json(product);
  } catch (err) {
    console.error('Ошибка при получении товара:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// === Получение своих заказов (пользователь) === //
app.get('/api/user/orders', async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(403).json({ message: 'Не авторизован' });

  try {
    const orders = await Order.find({ userId: user._id });
    res.status(200).json(orders);
  } catch (err) {
    console.error('Ошибка получения заказов:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// === Получение пользователей === //
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error('Ошибка получения пользователей:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// === Удаление пользователя === //
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: 'Пользователь не найден' });
    res.status(200).json({ message: 'Пользователь удален' });
  } catch (err) {
    console.error('Ошибка удаления пользователя:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// === Удаление товара === //
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    res.status(200).json({ message: '✅ Товар удален' });
  } catch (err) {
    console.error('Ошибка удаления товара:', err);
    res.status(500).json({ message: '❌ Ошибка сервера' });
  }
});

// === Получение всех отзывов для товара === //
app.get('/api/reviews', async (req, res) => {
  const { productId } = req.query;
  if (!productId) return res.status(400).json([]);

  try {
    const reviews = await Review.find({ productId }).exec();
    res.json(reviews);
  } catch (err) {
    console.error('Ошибка получения отзывов:', err);
    res.status(500).json([]);
  }
});

// === Добавление отзыва === //
app.post('/api/reviews', async (req, res) => {
  const { productId, rating, text } = req.body;
  if (!productId || !text) {
    return res.status(400).json({ message: 'Недостаточно данных' });
  }

  try {
    const newReview = new Review({ productId, rating, text });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    console.error('Ошибка добавления отзыва:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// === Запуск сервера === //
app.listen(port, () => {
  console.log(`🚀 Сервер работает на http://localhost:${port}`);
});