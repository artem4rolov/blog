import PostModel from "../models/Post.js";

// ПОЛУЧИТЬ ПОСЛЕДНИЕ ТЕГИ
export const getLastTags = async (req, res) => {
  try {
    // find достает все статьи, populate и exec - связывает таблицы, выдает полное значение свойства user
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .join()
      .split(", ");

    res.json(tags);
  } catch (err) {
    // эта ошибка для прогеров
    console.log(err);
    // эта ошибка для пользователя
    res.status(500).json({
      message: "Не удалось получить теги",
    });
  }
};

// ПОЛУЧИТЬ ВСЕ СТАТЬИ
export const getAll = async (req, res) => {
  try {
    // find достает все статьи, populate и exec - связывает таблицы, выдает полное значение свойства user
    const posts = await PostModel.find().populate("user").exec();

    res.json(posts);
  } catch (err) {
    // эта ошибка для прогеров
    console.log(err);
    // эта ошибка для пользователя
    res.status(500).json({
      message: "Не удалось получить статьи",
    });
  }
};

// ПОЛУЧИТЬ СТАТЬЮ
export const getOne = async (req, res) => {
  try {
    // достаем один пост (req.params.id достает динамический id из строки url)
    const postId = req.params.id;

    // поскольку нам нужно не только найти конкретную статью, но и увеличить количество просмотров на +1, используем функцию findOneAndUpdate
    PostModel.findOneAndUpdate(
      // сначала получаем id - из переменной выше
      {
        _id: postId,
      },
      // затем увеличиваем значение свойства viewsCount на единицу
      {
        $inc: { viewsCount: 1 },
      },
      // возвращаем обновленный документ с увеличенным на единицу счетчиком просмотров
      {
        returnDocument: "after",
      },
      // если ошибка - выводим ошибку
      (err, doc) => {
        if (err) {
          // эта ошибка для прогеров
          console.log(err);
          // эта ошибка для пользователя
          res.status(500).json({
            message: "Не удалось получить статью",
          });
        }
        // если ошибки нет, но и документа (статьи в базе) такого нет - поясняем
        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }

        // если все окей - возвращаем документ
        res.json(doc);
      }
    ).populate("user");
  } catch (err) {
    // эта ошибка для прогеров
    console.log(err);
    // эта ошибка для пользователя
    res.status(500).json({
      message: "Не удалось получить статьи",
    });
  }
};

// СОЗДАНИЕ ПОСТА
export const create = async (req, res) => {
  try {
    // подготавливаем документ на запись в БД MongoDB
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.title,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(","),
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

// УДАЛИТЬ СТАТЬЮ
export const remove = async (req, res) => {
  try {
    // достаем один пост (req.params.id достает динамический id из строки url)
    const postId = req.params.id;

    // поскольку нам нужно не только найти конкретную статью, но и увеличить количество просмотров на +1, используем функцию findOneAndUpdate
    PostModel.findOneAndDelete(
      // получаем id - из переменной выше
      {
        _id: postId,
      },
      // если ошибка - выводим ошибку
      (err, doc) => {
        if (err) {
          // эта ошибка для прогеров
          console.log(err);
          // эта ошибка для пользователя
          res.status(500).json({
            message: "Не удалось удалить статью",
          });
        }
        // если ошибки нет, но и документа (статьи в базе) такой нет - поясняем
        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }

        // если все окей - возвращаем ответ о том, что все получилось
        res.json({
          success: true,
        });
      }
    );
  } catch (err) {
    // эта ошибка для прогеров
    console.log(err);
    // эта ошибка для пользователя
    res.status(500).json({
      message: "Не удалось получить статьи",
    });
  }
};

// ОБНОВИТЬ СТАТЬЮ
export const update = async (req, res) => {
  try {
    // достаем один пост (req.params.id достает динамический id из строки url)
    const postId = req.params.id;

    // поскольку нам нужно не только найти конкретную статью, но и увеличить количество просмотров на +1, используем функцию findOneAndUpdate
    await PostModel.updateOne(
      // получаем id - из переменной выше
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags.split(","),
        imageUrl: req.body.imageUrl,
        user: req.userId,
      },

      // если все окей - возвращаем ответ о том, что все получилось
      res.json({
        success: true,
      })
    );
  } catch (err) {
    // эта ошибка для прогеров
    console.log(err);
    // эта ошибка для пользователя
    res.status(500).json({
      message: "Не удалось обновить статью",
    });
  }
};
