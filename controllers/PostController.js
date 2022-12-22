import PostModel from "../models/Post.js";

export const create = async (req, res) => {
  try {
    // подготавливаем документ на запись в БД MongoDB
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      // теперь достаем _id пользователя (не из тела (body) запроса)
      user: req.userId,
    });

    // записываем документ в БД MongoDB
    const post = await doc.save();

    // возвращаем ответ
    res.json(post);
  } catch (err) {
    // эта ошибка для прогеров
    console.log(err);
    // эта ошибка для пользователя
    res.status(500).json({
      message: "Не удалось создать статью",
    });
  }
};
