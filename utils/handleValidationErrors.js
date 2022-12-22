// библиотека express-validator для валидации данных, отправляемых пользователем
import { validationResult } from "express-validator";

export default (req, res, next) => {
  // проверяем запрос пользователя на наличие ошибок валидации данных
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // если наши ошибки есть - возвращаем наш массив ошибок с кодом 400 (ошибка на стороне пользователя)
    return res.status(400).json(errors.array());
  }

  // если все ок - пропускаем функцию к дальнейшему коду
  next();
};
