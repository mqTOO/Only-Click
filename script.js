// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Ожидаем полной инициализации SDK
tg.ready();

// Включаем полноэкранный режим после готовности Telegram Web App
tg.expand();  // Telegram Web App будет открыт на весь экран

// Звуковые эффекты
const bubbleSound = new Audio('sounds/pop.mp3'); // Путь к звуковому файлу пузыря
const gameOverSound = new Audio('sounds/gameover.mp3'); // Путь к звуковому файлу окончания игры
const bonusSound = new Audio('sounds/bonus.mp3'); // Путь к звуковому файлу бонуса

// Получаем элементы для счета и таймера
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');

// Инициализация переменных
let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
let level = 1; // Уровень сложности
let bubbleInterval;
let bubbleCount = 0; // Счётчик пузырей
let caughtBubbles = 0; // Счётчик пойманных пузырей
let gameTime = 45; // Таймер игры, 45 секунд
let timerInterval;
let levelInterval = 1000; // Интервал для создания пузырей

// Функция создания пузыря
function createBubble() {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    const size = Math.random() * 30 + 30; // Размер пузыря от 30px до 60px
    const leftPosition = Math.random() * 100; // случайное положение по горизонтали

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${leftPosition}%`;

    // Случайным образом создаем обычные или бонусные пузыри
    const isBonus = Math.random() < 0.1; // 10% шанс на бонус
    if (isBonus) {
        bubble.classList.add('bonus'); // Добавляем стиль для бонусных пузырей
        bubble.addEventListener('click', () => {
            bonusSound.play(); // Проигрываем бонусный звук
            score += 5; // Добавляем бонусные очки
            caughtBubbles++; // Увеличиваем количество пойманных пузырей
            scoreElement.textContent = `Счет: ${score}`;
            localStorage.setItem('score', score); // Сохраняем счет
            bubble.remove(); // Убираем пузырь после клика
        });
    } else {
        bubble.addEventListener('click', () => {
            bubbleSound.play(); // Проигрываем обычный звук
            score++; // Обычный пузырь увеличивает очки на 1
            caughtBubbles++; // Увеличиваем количество пойманных пузырей
            scoreElement.textContent = `Счет: ${score}`;
            localStorage.setItem('score', score); // Сохраняем счет
            bubble.remove(); // Убираем пузырь после клика
        });
    }

    // Рассчитываем скорость подъема пузыря
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

    bubbleCount++; // Увеличиваем счетчик пузырей
}

function updateLevel() {
    if (score >= 10 * level) {
        level++;
        levelInterval = Math.max(500, levelInterval - 100); // Уменьшаем интервал появления пузырей
        clearInterval(bubbleInterval); // Останавливаем старый интервал
        bubbleInterval = setInterval(createBubble, levelInterval); // Запускаем новый интервал
        console.log(`Уровень: ${level}`);
    }
}

// Функция начала игры
function startGame() {
    document.getElementById('menu').style.display = 'none';  // Скрываем меню
    document.getElementById('game').style.display = 'block';  // Показываем игру

    // Запускаем создание пузырей с начальным интервалом
    bubbleInterval = setInterval(() => {
        createBubble();
        updateLevel();
    }, levelInterval); // Начальный интервал появления пузырей

    // Запускаем таймер на 45 секунд
    gameTime = 45;
    timerElement.textContent = `Осталось: ${gameTime} секунд`;
    timerInterval = setInterval(() => {
        gameTime--;
        timerElement.textContent = `Осталось: ${gameTime} секунд`;
        if (gameTime <= 0) {
            clearInterval(timerInterval); // Останавливаем таймер
            endGame();
        }
    }, 1000);
}

// Конец игры
function endGame() {
    clearInterval(bubbleInterval); // Останавливаем создание пузырей
    gameOverSound.play(); // Проигрываем звук окончания игры

    // Обновляем лучший результат
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore); // Сохраняем лучший результат
    }

    // Показываем результаты
    document.getElementById('game').style.display = 'none';
    document.getElementById('end-screen').style.display = 'block'; // Показываем экран с результатами
    document.getElementById('final-score').textContent = `Вы поймали ${caughtBubbles} пузырей!`; // Показываем количество пойманных пузырей
    document.getElementById('best-score').textContent = `Лучший результат: ${bestScore}`;
}

// Функция для начала новой игры
function restartGame() {
    score = 0;
    caughtBubbles = 0; // Сброс количества пойманных пузырей
    bubbleCount = 0;
    document.getElementById('end-screen').style.display = 'none'; // Скрываем экран результатов
    startGame(); // Перезапускаем игру
}

// Обработчики событий для кнопки "Начать игру"
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('start-btn').addEventListener('touchstart', startGame); // Для мобильных устройств

// Обработчики событий для кнопки "На начальный экран"
document.getElementById('back-to-menu-btn').addEventListener('click', () => {
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
});
document.getElementById('back-to-menu-btn').addEventListener('touchstart', () => {
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
});
