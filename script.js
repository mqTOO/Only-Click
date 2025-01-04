document.addEventListener("DOMContentLoaded", () => {
    const tg = window.Telegram.WebApp;

    // Проверка наличия WebApp API
    if (!tg) {
        console.error("Ошибка: приложение не запущено внутри Telegram.");
        return;
    }

    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.disableVerticalSwipes();

    // Получаем имя пользователя из Telegram WebApp API
    const userName = tg.initDataUnsafe?.user?.username || "Игрок";
    const botUsername = "only_click_bot"; // Имя вашего бота
    const referralLink = `https://t.me/${botUsername}?start=${userName}`;

    // Инициализация монет и даты начала
    let coins = parseInt(localStorage.getItem("coins")) || 0;
    let startDate = localStorage.getItem("startDate");

    if (!startDate) {
        startDate = new Date().toLocaleString();
        localStorage.setItem("startDate", startDate);
    }

    // Выводим количество монет
    const coinsElement = document.getElementById("coins");
    if (coinsElement) {
        coinsElement.textContent = coins;
    }

    // Звуковой эффект для клика
    const clickSound = new Audio('click-sound.mp3'); // Укажите путь к вашему звуковому файлу

    // Функция для воспроизведения звука и вибрации через Telegram API
    const playClickEffects = () => {
        // Воспроизводим звук
        clickSound.play();

        // Вибрация через Telegram API
        impactOccurred(heavy); // Вибрация через Telegram WebApp API
    };

    // Функция для обновления таблицы лидеров на сервере
    const updateLeaderboardOnServer = async () => {
        try {
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
            } else {
                console.error("Ошибка при обновлении данных на сервере.");
            }
        } catch (error) {
            console.error("Ошибка при отправке данных на сервер:", error);
        }
    };

    // Функция для получения таблицы лидеров
    const getLeaderboardFromServer = async () => {
        try {
            const response = await fetch("https://only-click.onrender.com/leaderboard");
            if (response.ok) {
                const leaderboard = await response.json();
                const leaderboardList = document.getElementById("leaderboard-list");
                if (leaderboardList) {
                    leaderboardList.innerHTML = leaderboard
                        .map(player => `<li>${player.username}: ${player.coins} кликов</li>`)
                        .join("");
                }
            } else {
                console.error("Ошибка при загрузке таблицы лидеров.");
            }
        } catch (error) {
            console.error("Ошибка при получении данных с сервера:", error);
        }
    };

    // Функция обработки клика
    const handleClick = () => {
        coins++;
        if (coinsElement) {
            coinsElement.textContent = coins;
        }
        localStorage.setItem("coins", coins);
        updateLeaderboardOnServer();

        // Воспроизведение звука и вибрации
        playClickEffects();
    };

    // Добавляем обработчики кликов по изображению
    const clickImage = document.getElementById("click-image");
    if (clickImage) {
        clickImage.addEventListener("click", handleClick);
        clickImage.addEventListener("touchstart", handleClick);
    }

    // Переключение вкладок
    const tabs = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabContents.forEach(content => content.style.display = "none");

            const targetContent = document.getElementById(`${tab.id.replace('-tab', '')}-content`);
            if (targetContent) {
                targetContent.style.display = "block";
            }
        });
    });

    // Профиль
    const profileButton = document.getElementById("profile-button");
    if (profileButton) {
        profileButton.addEventListener("click", () => {
            const profileAvatar = document.getElementById("profile-avatar");
            const profileUsername = document.getElementById("profile-username");
            const profileCoins = document.getElementById("profile-coins");
            const profileStartDate = document.getElementById("profile-start-date");
            const profileRank = document.getElementById("profile-rank");

            if (profileAvatar) {
                profileAvatar.src = tg.initDataUnsafe?.user?.photo_url || ''; // Используем фото из Telegram
            }
            if (profileUsername) {
                profileUsername.textContent = `Имя: ${userName}`;
            }
            if (profileCoins) {
                profileCoins.textContent = `Клики: ${coins}`;
            }
            if (profileStartDate) {
                profileStartDate.textContent = `Дата начала игры: ${startDate}`;
            }
            if (profileRank) {
                profileRank.textContent = `Ранг: TBD`; // Пока что только как пример
            }
        });
    }

    // Реферальная ссылка
    const referralLinkInput = document.getElementById("referral-link");
    if (referralLinkInput) {
        referralLinkInput.value = referralLink;
    }

    // Функция для копирования реферальной ссылки
    const referralCopyButton = document.getElementById("referral-copy-btn");
    if (referralCopyButton) {
        referralCopyButton.addEventListener("click", () => {
            if (referralLinkInput) {
                referralLinkInput.select();
                navigator.clipboard.writeText(referralLinkInput.value).then(() => {
                    alert("Реферальная ссылка скопирована!");
                }).catch(err => {
                    console.error("Ошибка при копировании:", err);
                    alert("Не удалось скопировать ссылку.");
                });
            }
        });
    }

    // Функция для делания реферальной ссылки доступной для обмена через Telegram API
    const referralShareButton = document.getElementById("referral-share-btn");
    if (referralShareButton) {
        referralShareButton.addEventListener("click", () => {
            const message = `Привет! Попробуй эту игру: ${referralLink}`;

            // Отправляем сообщение через Telegram WebApp API
            tg.WebApp.sendData(message); // Отправляем текст в Telegram
        });
    }

    // Загружаем таблицу лидеров
    getLeaderboardFromServer();
});
