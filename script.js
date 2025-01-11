// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Ожидаем полной инициализации SDK
tg.ready();

// Включаем полноэкранный режим после готовности Telegram Web App
tg.expand();  // Telegram Web App будет открыт на весь экран

tg.requestFullscreen();		// Максимально большой экран

// Звуковые эффекты
const bubbleSound = new Audio('sounds/pop.mp3'); // Путь к звуковому файлу пузыря
const gameOverSound = new Audio('sounds/gameover.mp3'); // Путь к звуковому файлу окончания игры
const bonusSound = new Audio('sounds/bonus.mp3'); // Путь к звуковому файлу бонуса

// Получаем элементы для счета и таймера
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const totalBubblesElement = document.getElementById('total-bubbles'); // Элемент для отображения собранных пузырей

// Инициализация переменных
let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
let totalBubbles = localStorage.getItem('totalBubbles') ? parseInt(localStorage.getItem('totalBubbles')) : 0; // Счётчик собранных пузырей
let level = 1; // Уровень сложности
let bubbleInterval;
let bubbleCount = 0; // Счётчик пузырей
let caughtBubbles = 0; // Счётчик пойманных пузырей
let gameTime = 45; // Таймер игры, 45 секунд
let timerInterval;
let levelInterval = 1000; // Интервал для создания пузырей

// Обновление счётчика собранных пузырей в главном меню
totalBubblesElement.textContent = `Собрано пузырей: ${totalBubbles}`;

// Функция создания реферальной ссылки
function generateReferralLink() {
    // Получаем ID пользователя из Telegram Web App
    const userId = tg.initDataUnsafe?.user?.id;
    
    if (userId) {
        return `https://t.me/only_click_bot?start=${userId}`; // Формируем реферальную ссылку
    }
    return 'https://t.me/only_click_bot'; // Заглушка на случай, если ID не доступно
}

// Обработчик для кнопки "Рефералы"
document.getElementById('referral-btn').addEventListener('click', () => {
    // Показываем экран с реферальной ссылкой
    const referralScreen = document.getElementById('referral-screen');
    const referralLinkElement = document.getElementById('referral-link');
    referralScreen.style.display = 'block';  // Показываем экран рефералов
    const referralLink = generateReferralLink();
    referralLinkElement.textContent = referralLink; // Отображаем ссылку

    // Обработчик для кнопки "Скопировать ссылку"
    document.getElementById('copy-link-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(referralLink);  // Копируем ссылку в буфер обмена
        alert('Ссылка скопирована!');
    });

    // Обработчик для кнопки "Поделиться"
    document.getElementById('share-link-btn').addEventListener('click', () => {
        tg.shareURL('https://t.me/heyqbnk', 'Check out this cool group!');  // Открываем диалог для поделиться через Telegram
    });
});

// Обработчик для кнопки "Назад"
document.getElementById('back-to-menu-btn').addEventListener('click', () => {
    document.getElementById('referral-screen').style.display = 'none'; // Скрываем экран рефералов
    document.getElementById('menu').style.display = 'block'; // Показываем главное меню
});

// Функция создания пузыря
function createBubble() {
    const bubble = document.createElement('div');
    
    const size = Math.random() * 30 + 30; // Размер пузыря от 30px до 60px
    const leftPosition = Math.random() * 100; // случайное положение по горизонтали

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${leftPosition}%`;

    // Случайным образом создаем обычные или бонусные пузыри
    const isBonus = Math.random() < 0.1; // 10% шанс на бонус

    if (isBonus) {
        bubble.classList.add('bubble', 'bonus'); // Добавляем стиль для бонусных пузырей
        bubble.addEventListener('click', () => {
            bubble.style.pointerEvents = 'none'; // Блокируем клик по пузырю
            bonusSound.play(); // Проигрываем бонусный звук
            score += 5; // Добавляем бонусные очки
            caughtBubbles++; // Увеличиваем количество пойманных пузырей
            totalBubbles++; // Увеличиваем количество собранных пузырей
            localStorage.setItem('score', score); // Сохраняем счет
            localStorage.setItem('totalBubbles', totalBubbles); // Сохраняем собранные пузырь
            scoreElement.textContent = `Счет: ${score}`;
            totalBubblesElement.textContent = `Собрано пузырей: ${totalBubbles}`;
            setTimeout(() => {
                bubble.remove(); // Убираем пузырь после клика
            }, 0);
        });
    } else {
        bubble.classList.add('bubble', 'normal'); // Добавляем стиль для обычных пузырей
        bubble.addEventListener('click', () => {
            bubble.style.pointerEvents = 'none'; // Блокируем клик по пузырю
            bubbleSound.play(); // Проигрываем обычный звук
            score++; // Обычный пузырь увеличивает очки на 1
            caughtBubbles++; // Увеличиваем количество пойманных пузырей
            totalBubbles++; // Увеличиваем количество собранных пузырей
            localStorage.setItem('score', score); // Сохраняем счет
            localStorage.setItem('totalBubbles', totalBubbles); // Сохраняем собранные пузырь
            scoreElement.textContent = `Счет: ${score}`;
            totalBubblesElement.textContent = `Собрано пузырей: ${totalBubbles}`;
            setTimeout(() => {
                bubble.remove(); // Убираем пузырь после клика
            }, 0);
        });
    }

    // Рассчитываем скорость подъема пузыря
    const speed = 50 - bubbleCount - 3; // Начальная скорость 5 секунд, уменьшаем на 0.1 с каждым новым пузырем
    if (speed < 1) {
        bubble.style.animationDuration = '1s'; // Минимальное время подъема 1 секунда
    } else {
        bubble.style.animationDuration = `${speed}s`; // Устанавливаем уникальное время для каждого пузыря
    }

    document.getElementById('game').appendChild(bubble);

    // Удаляем пузырь после того, как он выйдет за пределы экрана
    setTimeout(() => {
        bubble.remove();
    }, speed * 500);

    bubbleCount++; // Увеличиваем счетчик пузырей
}

// Функция для обновления уровня
function updateLevel() {
    if (caughtBubbles >= level * 10) {  // Каждые 10 пойманных пузырей повышаем уровень
        level++;  // Увеличиваем уровень
        levelInterval = Math.max(1000 - level * 100, 200);  // Уменьшаем интервал появления пузырей (не меньше 200 мс)
	console.log(`Уровень повышен до ${level}`);  // Для отладки
    }
}

// Функция начала игры
function startGame() {
    document.getElementById('menu').style.display = 'none';  // Скрываем меню
    document.getElementById('game').style.display = 'block';  // Показываем игру
	
	caughtBubbles = 0;
	level = 0;
	speed = 0;
	bubbleCount = 0;
	
    // Переключаем фоны
    document.getElementById('game-background').style.display = 'block'; // Показываем фон игры
    document.getElementById('menu-background').style.display = 'none'; // Скрываем фон меню

    // Запускаем создание пузырей с начальным интервалом
    bubbleInterval = setInterval(() => {
        createBubble();
        updateLevel();
    }, levelInterval); // Начальный интервал появления пузырей

    // Запускаем таймер на 45 секунд
    gameTime = 45;
    timerElement.querySelector('span').textContent = `${gameTime} секунд`;
    timerInterval = setInterval(() => {
        gameTime--;
        timerElement.querySelector('span').textContent = `${gameTime} секунд`;
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
	level = 0;
	speed = 0;
	bubbleCount = 0;
	//console.log(`Уровень повышен до ${level}`);  // Для отладки
	
    document.getElementById('end-screen').style.display = 'none'; // Скрываем экран результатов
    startGame(); // Перезапускаем игру
}

// Обработчики событий для кнопки "Начать игру"
document.getElementById('start-btn').addEventListener('click', startGame);

// Обработчики событий для кнопки паузы
document.getElementById('pause-btn').addEventListener('click', () => {
    clearInterval(bubbleInterval); // Останавливаем создание пузырей
    clearInterval(timerInterval); // Останавливаем таймер
    document.getElementById('game').style.display = 'none'; // Скрываем экран игры
    document.getElementById('pause-screen').style.display = 'block'; // Показываем экран паузы
});

// Обработчики событий для кнопки "Продолжить игру"
document.getElementById('resume-btn').addEventListener('click', () => {
    document.getElementById('pause-screen').style.display = 'none'; // Скрываем экран паузы
    document.getElementById('game').style.display = 'block'; // Показываем экран игры
    bubbleInterval = setInterval(() => { createBubble(); updateLevel(); }, levelInterval); // Возобновляем создание пузырей
    timerInterval = setInterval(() => { 
        gameTime--; 
        timerElement.querySelector('span').textContent = `${gameTime} секунд`; 
        if (gameTime <= 0) {
            clearInterval(timerInterval); 
            endGame(); 
        }
    }, 1000); // Возобновляем таймер
});

// Обработчик для кнопки "Выход в меню"
document.getElementById('exit-to-menu-btn').addEventListener('click', () => {
    document.getElementById('pause-screen').style.display = 'none'; // Скрываем экран паузы
    document.getElementById('menu').style.display = 'block'; // Показываем меню
    document.getElementById('game').style.display = 'none'; // Скрываем игру
    document.getElementById('game-background').style.display = 'none'; // Скрываем фон игры
    document.getElementById('menu-background').style.display = 'block'; // Показываем фон меню
	level = 0;
	speed = 0;
	bubbleCount = 0;
});
