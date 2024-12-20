document.addEventListener("DOMContentLoaded", () => {
    const tg = window.Telegram.WebApp;
    
    // Проверка наличия WebApp API
    if (!tg) {
        console.error("Ошибка: приложение не запущено внутри Telegram.");
        return;
    }

    tg.expand();
    tg.requestFullscreen();

    const userName = tg.initDataUnsafe?.user?.username || "Игрок";
    const userAvatar = tg.initDataUnsafe?.user?.photo_url || "images/avatar.png";

    // Инициализация монет
    let coins = parseInt(localStorage.getItem("coins")) || 0;
    const coinsElement = document.getElementById("coins");
    coinsElement.textContent = formatClicks(coins);

    const clickImage = document.getElementById("click-image");
    const referralButton = document.getElementById("referral-button");
    const profileButton = document.getElementById("profile-button");

    // Форматирование кликов
    function formatClicks(coins) {
        if (coins >= 1e9) return (coins / 1e9).toFixed(1) + 'b';
        if (coins >= 1e6) return (coins / 1e6).toFixed(1) + 'm';
        if (coins >= 1e3) return (coins / 1e3).toFixed(1) + 'k';
        return coins;
    }

    // Обработка кликов
    const handleClick = () => {
        coins++;
        coinsElement.textContent = formatClicks(coins);
        localStorage.setItem("coins", coins);
    };

    clickImage.addEventListener("click", handleClick);
    clickImage.addEventListener("touchstart", handleClick);

    // Открытие меню реферальных ссылок
    referralButton.addEventListener("click", () => {
        const refLink = `https://t.me/${userName}?start=${userName}`;
        const referralLink = document.getElementById("referral-link");
        referralLink.textContent = refLink;
        referralLink.style.cursor = "pointer";
    });

    // Открытие профиля игрока
    profileButton.addEventListener("click", () => {
        const profileUrl = `profile.html?username=${userName}`;
        window.open(profileUrl, "_blank");
    });
});
