// тут создаем модель юзера для БД MongoDB
import mongoose from "mongoose";

// создаем схему таблицы
const PostSchema = new mongoose.Schema(
  {
    title: {
      // свойство title в таблице mongoDb является строчкой
      type: String,
      // и оно обязательное (это свойство в таблице)
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    tags: {
      type: String,
      // если теги не будут переданы - передаем просто пустой массив
      default: [],
    },
    viewsCount: {
      // просмотры - это цифра
      type: Number,
      // при создании статьи, изначально будет 0 просмотров
      default: 0,
    },
    // у каждой статьи будет юзер, который создал её
    user: {
      // у каждого юзера есть свойство _id в базе MongoDB
      type: mongoose.Schema.Types.ObjectId,
      // это свойство (_id) находится в модели User (тут по сути делаем связь таблиц - relationship)
      ref: "User",
      // поле user при создании статьи обязательно
      required: true,
    },
    // картинка поста необязателен
    imageUrl: String,
  },
  {
    // база mongoDb при создании пользователя автоматически привязывает данные о времени создания этого пользователя
    timestamps: true,
  }
);

// наша схема будет называться User
export default mongoose.model("Post", PostSchema);
