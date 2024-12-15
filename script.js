document.addEventListener("DOMContentLoaded", () => {
    const tg = window.Telegram.WebApp;

    // Проверяем доступность API Telegram WebApp
    if (!tg) {
        console.error("Ошибка: приложение не запущено внутри Telegram.");
        return;
    }

    // Получаем имя пользователя из Telegram Web App
    const userName = tg.initDataUnsafe?.user?.username || 'Игрок';

    // Получаем данные о кликах из localStorage или устанавливаем 0 по умолчанию
    let coins = parseInt(localStorage.getItem("coins")) || 0;
    const coinsElement = document.getElementById("coins");
    coinsElement.textContent = coins;

    // Функция для обновления данных на сервере
    const updateLeaderboardOnServer = async () => {
        const response = await fetch("https://your-render-app-url.com/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: userName,
                coins: coins
            })
        });

        if (response.ok) {
            console.log("Данные обновлены на сервере");
        }
    };

    // Функция для получения таблицы лидеров
    const getLeaderboardFromServer = async () => {
        const response = await fetch("https://your-render-app-url.com/leaderboard");
        if (response.ok) {
            const leaderboard = await response.json();
            const leaderboardList = document.getElementById("leaderboard-list");
            leaderboardList.innerHTML = leaderboard
                .map(player => `<li>${player.username}: ${player.coins} кликов</li>`)
                .join("");
        }
    };

    // Обработчик клика по изображению
    const handleClick = () => {
        coins++;
        coinsElement.textContent = coins;
        localStorage.setItem("coins", coins);
        updateLeaderboardOnServer();
    };

    // Добавляем обработчики событий для кликов
    const clickImage = document.getElementById("click-image");
    clickImage.addEventListener("click", handleClick);
    clickImage.addEventListener("touchstart", handleClick); // для мобильных устройств

    // Обработчик для получения реферальной ссылки
    const referralButton = document.getElementById("referral-button");
    referralButton.addEventListener("click", () => {
        const botUsername = "YourBotUsername"; // Замените на имя вашего бота
        const refLink = `https://t.me/${botUsername}?start=${userName}`;
        const referralLink = document.getElementById("referral-link");
        referralLink.textContent = refLink;
        referralLink.style.cursor = "pointer";

        // Копирование ссылки в буфер обмена
        referralLink.addEventListener("click", () => {
            navigator.clipboard.writeText(refLink).then(() => {
                alert("Ссылка скопирована!");
            });
        });
    });

    // Загружаем таблицу лидеров при первом запуске
    getLeaderboardFromServer();
});
