let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
const scoreElement = document.getElementById('score');
scoreElement.textContent = `Счет: ${score}`;

let bubbleCount = 0; // Счётчик пузырей

// Подключаем Telegram Web App
const tg = window.Telegram.WebApp;

// Инициализируем Telegram Web App
tg.init();
tg.expand(); // Разворачиваем на весь экран


// Функция создания пузыря
function createBubble() {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    const size = Math.random() * 30 + 30; // Размер пузыря от 30px до 60px
    const leftPosition = Math.random() * 100; // случайное положение по горизонтали

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${leftPosition}%`;

    // Рассчитываем скорость подъема пузыря. Чем больше пузырей, тем быстрее он будет подниматься
    const speed = 50 - bubbleCount * 0.1; // Начальная скорость 5 секунд, уменьшаем на 0.1 с каждым новым пузырем
    if (speed < 1) {
        bubble.style.animationDuration = '1s'; // Минимальное время подъема 1 секунда
    } else {
        bubble.style.animationDuration = `${speed}s`; // Устанавливаем уникальное время для каждого пузыря
    }

    document.getElementById('game').appendChild(bubble);

    // Удаляем пузырь после того, как он выйдет за пределы экрана
    setTimeout(() => {
        bubble.remove();
    }, speed * 1000);

    // Добавляем событие на клик по пузырю
    bubble.addEventListener('click', () => {
        score++;
        scoreElement.textContent = `Счет: ${score}`;
        localStorage.setItem('score', score); // Сохраняем счет в localStorage
        bubble.remove(); // Убираем пузырь после клика
    });

    bubbleCount++; // Увеличиваем счетчик пузырей
}

// Создаем пузыри каждые 1.5 секунды
let bubbleInterval;

document.getElementById('start-btn').addEventListener('click', () => {
    // Прячем меню и показываем игру
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    // Запускаем создание пузырей
    bubbleInterval = setInterval(createBubble, 100);
});

// Останавливаем игру
function stopGame() {
    clearInterval(bubbleInterval); // Останавливаем создание пузырей
    document.getElementById('game').style.display = 'none';
    document.getElementById('menu').style.display = 'block'; // Показываем меню
}
