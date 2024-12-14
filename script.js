document.addEventListener("DOMContentLoaded", () => {
    const coinsElement = document.getElementById("coins");
    const clickImage = document.getElementById("click-image");
    const referralButton = document.getElementById("referral-button");
    const referralLink = document.getElementById("referral-link");

    // Сохранение монет в localStorage
    let coins = parseInt(localStorage.getItem("coins")) || 0;
    coinsElement.textContent = coins;

    // Проверка реферальной ссылки
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("ref")) {
        const refBonus = 10; // Бонус за реферала
        coins += refBonus;
        localStorage.setItem("coins", coins);
        coinsElement.textContent = coins;
        alert(`Вы получили ${refBonus} монет по реферальной ссылке!`);
    }

    // Обработка кликов
    clickImage.addEventListener("touchstart", () => {
        coins++;
        coinsElement.textContent = coins;
        localStorage.setItem("coins", coins);
    });

    // Генерация реферальной ссылки
    referralButton.addEventListener("click", () => {
        const currentUrl = window.location.href.split("?")[0];
        const refLink = `${currentUrl}?ref=unique-id`;
        referralLink.textContent = refLink;
        referralLink.style.cursor = "pointer";

        // Копирование ссылки
        referralLink.addEventListener("click", () => {
            navigator.clipboard.writeText(refLink).then(() => {
                alert("Ссылка скопирована!");
            });
        });
    });
});
