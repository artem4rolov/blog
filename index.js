// библиотека express для работы с сервером на Node.js
import express from "express";
// библиотека express-validator для валидации данных, отправляемых пользователем
import { validationResult } from "express-validator";
// библиотека jwt для создания токенов авторизации пользователя
import jwt from "jsonwebtoken";
// библиотека bcrypt для шифрования пароля (вообще это для бэка больше, чем для фронта)
import bcrypt from "bcrypt";
// библиотека mongoose для работы с MongoDB
import mongoose from "mongoose";

import { registerValidation } from "./validations/auth.js";
import UserModel from "./models/User.js";

// подключаемся к БД mongoDb (чтобы зайти на сатй- нужно включать VPN!)
mongoose
  // в connect указываем логин и пароль, которые задавали в базе на сайте
  // после mongodb.net/ указываем таблицу blog, чтобы подключиться к ней сразу
  .connect(
    "mongodb+srv://admin:12345678aA@cluster0.9fb4f2z.mongodb.net/blog?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("MongoDB ok!");
  })
  .catch((err) => console.log("MongoDB error", err));

// создаем наше express - приложение
const app = express();

// учим сервер читать данные в формате json
app.use(express.json());

// библиотека nodemon (в dependencies package.json) автоматически перезапускает сервер при изменении кода в index.js
// при обращении к серверу запросом get (req) он отдает результат (res)
app.get("/auth/register", (req, res) => {
  res.send("Иди прогай дальше");
});

// при отправке данных на сервер, валидируем их, и если все ок - продолжаем
app.post("/auth/register", registerValidation, async (req, res) => {
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
});

// указываем порт, на котором будет запущен сервер (localhost:4444) и вывод ошибки, если не запустится
app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server NodeJS + Express ok!");
});
