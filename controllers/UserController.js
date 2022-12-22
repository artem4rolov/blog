// библиотека express-validator для валидации данных, отправляемых пользователем
import { validationResult } from "express-validator";
// библиотека jwt для создания токенов авторизации пользователя
import jwt from "jsonwebtoken";
// библиотека bcrypt для шифрования пароля (вообще это для бэка больше, чем для фронта)
import bcrypt from "bcrypt";

// импортируем модель юзера
import UserModel from "../models/User.js";

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // если наши ошибки есть - возвращаем наш массив ошибок с кодом 400 (ошибка на стороне пользователя)
      return res.status(400).json(errors.array());
    }

    // получаем пароль пользователя
    const password = req.body.passwordHash;
    // алгоритм шифрования в bcrypt (этот способ шифрования используют многие компании)
    const salt = await bcrypt.genSalt(10);
    // шифруем пароль пользователя
    const hash = await bcrypt.hash(password, salt);

    // создаем документ в БД MongoDb
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatatUrl: req.body.avatatUrl,
      passwordHash: hash,
    });

    // сохраняем данные пользователя в базе MongoDB
    const user = await doc.save();

    // создаем токен пользователя, благодаря которому будет осуществляться дальнейшая работа с этим пользователем
    // шифруем только id, этого достаточно
    // задаем секретный ключ для доступа к токену
    // наш токен будет дейтсвителен только в течение 30 дней
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    // достаем пароль отдельно от всего остального, чтобы не показывать его при регистрации в БД MongoDB (он бесполезен)
    const { passwordHash, ...userData } = user._doc;

    // показываем данные о юзере (юерем все кроме пароля), также показываем токен
    res.json({ ...userData, token });
  } catch (err) {
    // если код ошибки 11000 -
    if (err.code === 11000) {
      res.status(500).json({
        message: "Такой пользователь уже существует!",
      });
    }
    // эта ошибка для прогеров
    console.log(err);
    // эта ошибка для пользователя
    res.status(500).json({
      message: "Не удалось зарегистрироваться!",
    });
  }
};

export const login = async (req, res) => {
  try {
    // если emil в базе данных совпадает с тем, что отправил пользователь
    const user = await UserModel.findOne({ email: req.body.email });

    // если нет совпадений по email в базе MongoDB, то выводим ошибку
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    // то же самое производим с паролем, сравниваем то что ввел пользователь и то, что есть в базе с помощью bcrypt (потому что пароль зашифрован)
    const isValidPass = await bcrypt.compare(
      req.body.passwordHash,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return res.status(400).json({
        message: "Неверный логин или пароль",
      });
    }

    // создаем новый токен при успешном входе пользователя
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    // достаем пароль отдельно от всего остального, чтобы не показывать его при регистрации в БД MongoDB (он бесполезен)
    const { passwordHash, ...userData } = user._doc;

    // показываем данные о юзере (юерем все кроме пароля), также показываем токен
    res.json({ ...userData, token });
  } catch (err) {
    // эта ошибка для прогеров
    console.log(err);
    // эта ошибка для пользователя
    res.status(500).json({
      message: "Не удалось авторизоваться!",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    // достаем пароль отдельно от всего остального, чтобы не показывать его при регистрации в БД MongoDB (он бесполезен)
    const { passwordHash, ...userData } = user._doc;

    // показываем данные о юзере (юерем все кроме пароля), также показываем токен
    res.json(userData);
  } catch (err) {
    // эта ошибка для прогеров
    console.log(err);
    // эта ошибка для пользователя
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};
