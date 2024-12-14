document.addEventListener("DOMContentLoaded", () => {
    const coinsElement = document.getElementById("coins");
    const clickImage = document.getElementById("click-image");
    const referralButton = document.getElementById("referral-button");
    const referralLink = document.getElementById("referral-link");
    const leaderboardElement = document.createElement("div");
    leaderboardElement.id = "leaderboard";
    document.body.appendChild(leaderboardElement);

    const tg = window.Telegram.WebApp;

    let coins = parseInt(localStorage.getItem("coins")) || 0;
    coinsElement.textContent = coins;

    const urlParams = new URLSearchParams(window.location.search);
    const referralId = urlParams.get("start");
    if (referralId) {
        const refBonus = 10;
        coins += refBonus;
        localStorage.setItem("coins", coins);
        coinsElement.textContent = coins;
        alert(`Вы получили ${refBonus} монет по реферальной ссылке!`);
    }

    const handleClick = () => {
        coins++;
        coinsElement.textContent = coins;
        localStorage.setItem("coins", coins);
    };

    clickImage.addEventListener("touchstart", handleClick);
    clickImage.addEventListener("click", handleClick);

    referralButton.addEventListener("click", () => {
        const botUsername = "YourBotUsername"; // Замените на имя вашего бота
        const userId = tg.initDataUnsafe.user?.id || "default";
        const refLink = `https://t.me/${botUsername}?start=${userId}`;
        referralLink.textContent = refLink;
        referralLink.style.cursor = "pointer";

        referralLink.addEventListener("click", () => {
            navigator.clipboard.writeText(refLink).then(() => {
                alert("Ссылка скопирована!");
            });
        });
    });

    // Отправка результата на сервер
    const updateLeaderboard = () => {
        const userId = tg.initDataUnsafe.user?.id || "anonymous";
        const userName = tg.initDataUnsafe.user?.username || "Player";

        fetch("https://only-click.onrender.com/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, userName, clicks: coins }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log("Leaderboard updated!");
                }
            })
            .catch(err => console.error("Error updating leaderboard:", err));
    };

    // Получение топа лидеров
    const fetchLeaderboard = () => {
        fetch("https://only-click.onrender.com/leaderboard")
            .then(res => res.json())
            .then(data => {
                leaderboardElement.innerHTML = "<h2>🏆 Топ кликеров 🏆</h2>";
                data.forEach((user, index) => {
                    leaderboardElement.innerHTML += `<p>${index + 1}. ${user.userName} — ${user.clicks} кликов</p>`;
                });
            })
            .catch(err => console.error("Error fetching leaderboard:", err));
    };

    // Обновляем таблицу лидеров каждые 10 секунд
    setInterval(fetchLeaderboard, 10000);

    // Обновляем сервер после каждого клика
    clickImage.addEventListener("click", updateLeaderboard);
});
