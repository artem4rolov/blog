// создаем middleware

import jwt from "jsonwebtoken";

export default (req, res, next) => {
  // получить данные о пользователе может только авторизованный пользователь
  // соответственно, достаем из запроса, в headers свойство authorization
  // обрезаем слово Bearer с помощью регулярки, оставляем только наш токен
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  // если токен есть, его нужно расшифровать
  if (token) {
    try {
      // парсим токен с помощью метода verify библиотеки jwt, указывая секретный ключ (из index.js при создании токена для пользователей)
      const decoded = jwt.verify(token, "secret123");

      // достаем из расшифрованного токена только _id
      req.userId = decoded._id;

      // next решает, что будет дальше выпольняться
      // наша функция checkAuth передается при запросе на localhost:4444/auth/me (при запросе данных о пользователе)
      next();
    } catch (err) {
      // если расшифровать не получилось - выкидываем ошибку для пользователя
      return res.status(403).json({
        message: "Нет доступа",
      });
    }
  } else {
    return res.status(403).json({
      message: "Нет доступа",
    });
  }
};
