document.addEventListener("DOMContentLoaded", () => {
    const tg = window.Telegram.WebApp.disableVerticalSwipes();

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

    // Добавляем обработчики кликов по изображению
    const clickImage = document.getElementById("click-image");
    clickImage.addEventListener("click", handleClick);
    clickImage.addEventListener("touchstart", handleClick); // Для мобильных устройств

    // Функция для создания реферальной ссылки
    const referralButton = document.getElementById("referral-button");
    const referralMenu = document.getElementById("referral-menu");

    referralButton.addEventListener("click", () => {
        // Плавно открываем меню
        referralMenu.style.display = referralMenu.style.display === "none" || !referralMenu.style.display ? "block" : "none";
    });

    // Копирование реферальной ссылки в буфер обмена
    const referralCopy = document.getElementById("referral-copy");
    referralCopy.addEventListener("click", () => {
        const botUsername = "only_click_bot"; // Имя вашего бота
        const link = `https://t.me/${botUsername}?start=${userName}`;
        navigator.clipboard.writeText(link)
            .then(() => alert("Ссылка скопирована!"))
            .catch(err => console.error("Ошибка копирования:", err));
    });

    // Отправить ссылку друзьям
    const referralShare = document.getElementById("referral-share");
    referralShare.addEventListener("click", () => {
        const botUsername = "only_click_bot"; // Имя вашего бота
        const link = `https://t.me/${botUsername}?start=${userName}`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}`, "_blank");
    });

    // Загружаем таблицу лидеров
    getLeaderboardFromServer();
});
