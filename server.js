const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let leaderboard = []; // Массив для хранения лидеров (пока в памяти)
let referrerData = {}; // Объект для хранения списка рефералов

// API для получения таблицы лидеров
app.get('/leaderboard', (req, res) => {
    leaderboard.sort((a, b) => b.coins - a.coins); // Сортировка по количеству монет
    res.json(leaderboard.slice(0, 5)); // Возвращаем только топ-5
});

// API для обновления данных о пользователе
app.post('/update', (req, res) => {
    const { username, coins, referrer } = req.body;

    // Проверяем, есть ли уже пользователь в таблице лидеров
    const userIndex = leaderboard.findIndex(user => user.username === username);
    if (userIndex !== -1) {
        leaderboard[userIndex].coins = coins; // Обновляем количество монет
    } else {
        leaderboard.push({ username, coins, referrer });
    }

    // Добавляем рефералов
    if (referrer) {
        if (!referrerData[referrer]) {
            referrerData[referrer] = [];
        }
        referrerData[referrer].push(username);
    }

    res.status(200).send('Data updated');
});

// Запускаем сервер
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
