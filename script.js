document.addEventListener("DOMContentLoaded", () => {
    const tg = window.Telegram.WebApp;

    // Проверка наличия WebApp API
    if (!tg) {
        console.error("Ошибка: приложение не запущено внутри Telegram.");
        return;
    }

    // Запрещаем масштабирование
    const viewportMeta = document.querySelector("meta[name=viewport]");
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");

    // Разворачиваем приложение на весь экран
    tg.expand();
    tg.requestFullscreen();

    // Получаем имя пользователя из Telegram WebApp API
    const userName = tg.initDataUnsafe?.user?.username || "Игрок";
    const botUsername = "only_click_bot"; // Имя вашего бота
    const referralLink = `https://t.me/${botUsername}?start=${userName}`;

    // Инициализация монет и даты начала
    let coins = parseInt(localStorage.getItem("coins")) || 0;
    let startDate = localStorage.getItem("startDate");

    if (!startDate) {
        // Если дата начала еще не установлена, сохраняем текущую дату
        startDate = new Date().toLocaleString();
        localStorage.setItem("startDate", startDate);
    }

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

    // Модальное окно профиля
    const profileButton = document.getElementById("profile-button");
    const profileModal = document.getElementById("profile-modal");
    const closeProfile = document.getElementById("close-profile");

    profileButton.addEventListener("click", () => {
        document.getElementById("profile-avatar").src = tg.initDataUnsafe?.user?.photo_url || '';  // Добавить аватар
        document.getElementById("profile-username").textContent = `Имя: ${userName}`;
        document.getElementById("profile-coins").textContent = `Клики: ${coins}`;
        document.getElementById("profile-start-date").textContent = `Дата начала игры: ${startDate}`;
        document.getElementById("profile-rank").textContent = `Ранг: TBD`; // Можно добавить логику для ранга
        profileModal.style.display = "block";
    });

    closeProfile.addEventListener("click", () => {
        profileModal.style.display = "none";
    });

    // Модальное окно реферальной ссылки
    const referralButton = document.getElementById("referral-button");
    const referralModal = document.getElementById("referral-modal");
    const closeReferral = document.getElementById("close-referral");
    const referralLinkInput = document.getElementById("referral-link");
    const referralCopyBtn = document.getElementById("referral-copy-btn");
    const referralShareBtn = document.getElementById("referral-share-btn");

    referralButton.addEventListener("click", () => {
        referralLinkInput.value = referralLink; // Заполняем поле реферальной ссылкой
        referralModal.style.display = "block";
    });

    closeReferral.addEventListener("click", () => {
        referralModal.style.display = "none";
    });

    // Копирование реферальной ссылки в буфер обмена
    referralCopyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(referralLink)
            .then(() => alert("Реферальная ссылка скопирована!"))
            .catch(err => console.error("Ошибка копирования:", err));
    });

    // Отправка реферальной ссылки
    referralShareBtn.addEventListener("click", () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`, "_blank");
    });

    // Загружаем таблицу лидеров
    getLeaderboardFromServer();
});
