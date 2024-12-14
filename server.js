const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Для обработки JSON запросов
app.use(express.json());

// Временное хранилище данных (можно заменить на базу данных)
let leaderboard = [];

// Эндпоинт для получения таблицы лидеров
app.get("/leaderboard", (req, res) => {
    leaderboard.sort((a, b) => b.clicks - a.clicks); // Сортировка по кликам
    res.json(leaderboard.slice(0, 10)); // Отправляем топ-10
});

// Эндпоинт для обновления результата пользователя
app.post("/update", (req, res) => {
    const { userId, userName, clicks } = req.body;

    if (!userId || !userName || !clicks) {
        return res.status(400).json({ error: "Invalid data" });
    }

    // Проверяем, есть ли пользователь в таблице лидеров
    const userIndex = leaderboard.findIndex(user => user.userId === userId);

    if (userIndex > -1) {
        leaderboard[userIndex].clicks = Math.max(leaderboard[userIndex].clicks, clicks);
    } else {
        leaderboard.push({ userId, userName, clicks });
    }

    // Сортируем таблицу лидеров
    leaderboard.sort((a, b) => b.clicks - a.clicks);

    // Ограничиваем список топ-10
    leaderboard = leaderboard.slice(0, 10);

    res.json({ success: true });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
