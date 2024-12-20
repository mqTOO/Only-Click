document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');
    
    if (!username) {
        console.error("Невозможно получить имя пользователя.");
        return;
    }

    // Загружаем информацию о пользователе (из localStorage или с сервера)
    const userCoins = localStorage.getItem(`${username}_coins`) || 0;
    const userStartDate = localStorage.getItem(`${username}_start_date`) || 'Неизвестно';
    const userRank = localStorage.getItem(`${username}_rank`) || 'Неизвестно';

    // Обновляем информацию на странице
    document.getElementById("profile-username").textContent = username;
    document.getElementById("profile-coins").textContent = `Клики: ${userCoins}`;
    document.getElementById("profile-start-date").textContent = `Начал играть: ${userStartDate}`;
    document.getElementById("profile-rank").textContent = `Место: ${userRank}`;
});
