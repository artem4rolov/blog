// библиотека express для работы с сервером на Node.js
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// подключаемся к БД mongoDb (чтобы зайти на сатй- нужно включать VPN!)
mongoose
  // в connect указываем логин и пароль, которые задавали в базе на сайте
  .connect(
    "mongodb+srv://admin:12345678aA@cluster0.9fb4f2z.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("DB ok!");
  })
  .catch((err) => console.log("DB error", err));

// создаем наше express - приложение
const app = express();

// учим сервер читать данные в формате json
app.use(express.json());

// библиотека nodemon (в dependencies package.json) автоматически перезапускает сервер при изменении кода в index.js
// при обращении к серверу запросом get (req) он отдает результат (res)
app.get("/", (req, res) => {
  res.send("Hello world");
});

// при отправке данных на сервер
app.post("/auth/register", (req, res) => {});

// указываем порт, на котором будет запущен сервер (localhost:4444) и вывод ошибки, если не запустится
app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server ok!");
});
