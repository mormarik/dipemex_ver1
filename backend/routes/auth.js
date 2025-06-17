const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');

// Регистрация
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = new User({ username, password: hashed });
    await user.save();
    res.status(201).json({ message: 'Пользователь зарегистрирован' });
  } catch (e) {
    res.status(400).json({ error: 'Пользователь уже существует' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  res.json({ message: 'Вход выполнен успешно' });
});

// Забыли пароль
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;
  const hashed = await bcrypt.hash(newPassword, 10);

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  user.password = hashed;
  await user.save();
  res.json({ message: 'Пароль обновлен' });
});

module.exports = router;


