document.addEventListener("DOMContentLoaded", () => {
    const tg = window.Telegram.WebApp;
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.disableVerticalSwipes();

    // Проверка наличия WebApp API
    if (!tg) {
        console.error("Ошибка: приложение не запущено внутри Telegram.");
        return;
    }

    // Запрещаем масштабирование
    const viewportMeta = document.querySelector("meta[name=viewport]");
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");


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
    clickImage.addEventListener("touchstart", handleClick);

    // Переключение вкладок
    const tabs = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Скрываем все вкладки
            tabContents.forEach(content => content.style.display = "none");
            
            // Показываем соответствующую вкладку
            const targetContent = document.getElementById(`${tab.id.replace('-tab', '')}-content`);
            targetContent.style.display = "block";
        });
    });

    // Профиль
    const profileButton = document.getElementById("profile-button");
    profileButton.addEventListener("click", () => {
        document.getElementById("profile-avatar").src = tg.initDataUnsafe?.user?.photo_url || '';
        document.getElementById("profile-username").textContent = `Имя: ${userName}`;
        document.getElementById("profile-coins").textContent = `Клики: ${coins}`;
        document.getElementById("profile-start-date").textContent = `Дата начала игры: ${startDate}`;
        document.getElementById("profile-rank").textContent = `Ранг: TBD`; // Пример для ранга
    });

    // Реферальная ссылка
    const referralLinkInput = document.getElementById("referral-link");
    referralLinkInput.value = referralLink;

    // Функция для копирования реферальной ссылки
    const referralCopyButton = document.getElementById("referral-copy-btn");
    referralCopyButton.addEventListener("click", () => {
        referralLinkInput.select();
        document.execCommand("copy");
        alert("Реферальная ссылка скопирована!");
    });

    // Функция для делания реферальной ссылки доступной для обмена
    const referralShareButton = document.getElementById("referral-share-btn");
    referralShareButton.addEventListener("click", () => {
        if (navigator.share) {
            navigator.share({
                title: "Присоединяйтесь к игре!",
                text: "Используйте мою реферальную ссылку для присоединения к игре.",
                url: referralLink
            }).catch(err => console.error("Ошибка при делании репост: ", err));
        } else {
            alert("Ваш браузер не поддерживает функционал обмена.");
        }
    });

    // Загружаем таблицу лидеров
    getLeaderboardFromServer();
});
