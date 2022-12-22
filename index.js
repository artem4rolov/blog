// библиотека nodemon (в dependencies package.json) автоматически перезапускает сервер при изменении кода в index.js

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

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./validations.js";
import UserModel from "./models/User.js";
import checkAuth from "./utils/checkAuth.js";
import * as UserController from "./controllers/UserController.js";
import * as PostController from "./controllers/PostController.js";

// создаем наше express - приложение
const app = express();

// учим сервер читать данные в формате json
app.use(express.json());

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

// АВТОРИЗАЦИЯ
// при обращении к серверу запросом get (req) он отдает результат (res)
// сразу перед сбором данных с запроса пользователя, прогоняем эти данные через функцию валидации loginValidation на проверку правильности ввода данных пользователем
app.post("/auth/login", loginValidation, UserController.login);

// РЕГИСТРАЦИЯ
// при отправке данных на сервер, валидируем их, и если все ок - продолжаем
// сразу перед сбором данных с запроса пользователя, прогоняем эти данные через функцию валидации registerValidation на проверку правильности ввода данных пользователем
app.post("/auth/register", registerValidation, UserController.register);

// получаем информацию о пользователе (о себе)
// перед отправкой ответа пользователю, валидируем токен пользователя с помощью функции checkAuth
app.get("/auth/me", checkAuth, UserController.getMe);

// получаем все статьи
// перед отправкой ответа пользователю, валидируем токен пользователя с помощью функции checkAuth
app.post("/posts", checkAuth, postCreateValidation, PostController.create);

// указываем порт, на котором будет запущен сервер (localhost:4444) и вывод ошибки, если не запустится
app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server NodeJS + Express ok!");
});
