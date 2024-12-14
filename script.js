document.addEventListener("DOMContentLoaded", () => {
    const coinsElement = document.getElementById("coins");
    const clickImage = document.getElementById("click-image");
    const referralButton = document.getElementById("referral-button");
    const referralLink = document.getElementById("referral-link");
    const leaderboardList = document.getElementById("leaderboard-list");

    // Получаем данные из localStorage, если они есть
    let coins = parseInt(localStorage.getItem("coins")) || 0;
    let userName = localStorage.getItem("userName") || "Игрок";

    coinsElement.textContent = coins;

    // API endpoint для обновления кликов
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

    // API endpoint для получения таблицы лидеров
    const getLeaderboardFromServer = async () => {
        const response = await fetch("https://only-click.onrender.com/leaderboard");
        if (response.ok) {
            const leaderboard = await response.json();
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
        updateLeaderboardOnServer(); // Отправляем обновленные данные на сервер
    };

    // Обработчики событий для кликов по изображению
    clickImage.addEventListener("click", handleClick);
    clickImage.addEventListener("touchstart", handleClick); // для мобильных устройств

    // Обработчик для получения реферальной ссылки
    referralButton.addEventListener("click", () => {
        const botUsername = "only_click_bot"; // Замените на имя вашего бота
        const refLink = `https://t.me/${botUsername}?start=${userName}`;
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
