// создаем модель юзера
import mongoose from "mongoose";

// создаем схему таблицы
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      // свойство fullName в таблице mongoDb является строчкой
      type: String,
      // и оно обязательное (это свойство в таблице)
      required: true,
    },
    email: {
      type: String,
      required: true,
      // почта должна быть уникальной!
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    // аватар пользователя необязателен
    avatatUrl: String,
  },
  {
    // база mongoDb при создании пользователя автоматически привязывает данные о времени создания этого пользователя
    timestamps: true,
  }
);

// наша схема будет называться User
export default mongoose.model("User", UserSchema);
