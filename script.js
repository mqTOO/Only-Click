document.addEventListener("DOMContentLoaded", () => {
    const tg = window.Telegram.WebApp;

    // Проверка наличия WebApp API
    if (!tg) {
        console.error("Ошибка: приложение не запущено внутри Telegram.");
        return;
    }

    // Разворачиваем приложение на весь экран
    tg.expand();
    tg.requestFullscreen();

    // Получаем имя пользователя из Telegram WebApp API
    const userName = tg.initDataUnsafe?.user?.username || "Игрок";

    // Инициализация монет
    let coins = parseInt(localStorage.getItem("coins")) || 0;
    const coinsElement = document.getElementById("coins");
    coinsElement.textContent = coins;

    // Функция для обновления таблицы лидеров на сервере
    const updateLeaderboardOnServer = async () => {
        const response = await fetch("https://only-click.onrender.com/update", {
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
        const response = await fetch("https://only-click.onrender.com/leaderboard");
        if (response.ok) {
            const leaderboard = await response.json();
            const leaderboardList = document.getElementById("leaderboard-list");
            leaderboardList.innerHTML = leaderboard
                .map(player => `<li>${player.username}: ${player.coins} кликов</li>`)
                .join("");
        }
    };

    // Функция обработки клика
    const handleClick = () => {
        coins++;
        coinsElement.textContent = coins;
        localStorage.setItem("coins", coins);
        updateLeaderboardOnServer();
    };

    // Добавляем обработчик кликов по изображению (срабатывает только один раз при клике)
    const clickImage = document.getElementById("click-image");
    clickImage.addEventListener("click", handleClick);  // Убираем touchstart

    // Функция для создания реферальной ссылки
    const referralButton = document.getElementById("referral-button");
    referralButton.addEventListener("click", () => {
        const botUsername = "only_click_bot"; // Имя вашего бота
        const refLink = `https://t.me/${botUsername}?start=${userName}`;
        const referralLink = document.getElementById("referral-link");
        referralLink.textContent = refLink;
        referralLink.style.cursor = "pointer";

        // Копирование реферальной ссылки в буфер обмена
        referralLink.addEventListener("click", () => {
            navigator.clipboard.writeText(refLink).then(() => {
                alert("Ссылка скопирована!");
            });
        });
    });

    // Загружаем таблицу лидеров
    getLeaderboardFromServer();
});
