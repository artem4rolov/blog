// библиотека nodemon (в dependencies package.json) автоматически перезапускает сервер при изменении кода в index.js
//
// библиотека express для работы с сервером на Node.js
import express from "express";
// библиотека multer для работы с файлами
import multer from "multer";
// библиотека cors для настройки cors-политики
import cors from "cors";
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
import handleValidationErrors from "./utils/handleValidationErrors.js";
import * as UserController from "./controllers/UserController.js";
import * as PostController from "./controllers/PostController.js";

// создаем наше express - приложение
const app = express();

// создаем хранилище для файлов
const storage = multer.diskStorage({
  // задаем место хранения для наших файлов
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  // задаем имя файлу
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

// используем наше хранилище с помощью функции upload
const upload = multer({ storage });

// учим сервер читать данные в формате json
app.use(express.json());
// работа с CORS политикой
app.use(cors());
// учим сервер работать с запросами к изображениям - если таковой поступил, проверяем файл, который запросил пользователь в папке uploads
// get - запрос на получение статичного файла (функция express.static)
app.use("/uploads", express.static("uploads"));

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

// ПОЛЬЗОВАТЕЛЬ----------------------------------------------------------------------------------------------------------

// АВТОРИЗАЦИЯ
// при обращении к серверу запросом get (request) он отдает результат (response)
// сначала перед сбором данных с запроса пользователя, прогоняем эти данные через функцию валидации loginValidation на проверку правильности ввода данных пользователем
// затем валидируем данные запроса пользователя на ошибки с функцией handleValidationErrors
app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);

// РЕГИСТРАЦИЯ
// при отправке данных на сервер, валидируем их, и если все ок - продолжаем
// сразу перед сбором данных с запроса пользователя, прогоняем эти данные через функцию валидации registerValidation на проверку правильности ввода данных пользователем
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);

// О СЕБЕ (получаем информацию о пользователе)
// перед отправкой ответа пользователю, ВСЕГДА валидируем токен пользователя с помощью функции checkAuth
app.get("/auth/me", checkAuth, UserController.getMe);

// РАБОТА С ФАЙЛАМИ, ЗАГРУЗКА ИЗОБРАЖЕНИЙ
// сначала проверяем, что файл загружает авторизованный пользователь
// если загружается тип файлов image, то продолжаем дальше
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

// СТАТЬИ ------------------------------------------------------------------------------------------------------------

// НАЙТИ ВСЕ СТАТЬИ
// получать все статьи и получать одну статью могут и не авторизованные пользователи, функция checkAuth НЕ НУЖНА
// валидация вводимых данных пользователем также не нужна
app.get("/posts", PostController.getAll);

// НАЙТИ ОДНУ СТАТЬЮ
app.get("/posts/:id", PostController.getOne);

// СОЗДАНИЕ СТАТЬИ
// перед манипуляциями со статьями, ВСЕГДА валидируем токен пользователя с помощью функции checkAuth, затем уже валидируем данные, которые ввел пользователь
// валидируем вводимые данные пользователем с помощью функции postCreateValidation
// проверяем на ошибки валидации с помощью функции handleValidationErrors
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);

// УДАЛЕНИЕ СТАТЬИ
// здесь валидация вводимых данных пользователем не нужна, т.к. мы просто удаляем статью
app.delete("/posts/:id", checkAuth, PostController.remove);

// ОБНОВЛЕНИЕ СТАТЬИ
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

// ПОЛУЧЕНИЕ ТЕГОВ
app.get("/tags", PostController.getLastTags);

// указываем порт, на котором будет запущен сервер (localhost:4444) и вывод ошибки, если не запустится
app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server NodeJS + Express ok!");
});
