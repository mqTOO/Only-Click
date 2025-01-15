// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Ожидаем полной инициализации SDK
tg.ready();

// Включаем полноэкранный режим
tg.expand();

tg.requestFullscreen();		// Максимально большой экран

// Универсальные функции для анимации
function showElementWithAnimation(elementId) {
    const element = document.getElementById(elementId);

    // Убираем изначальную скрытость и добавляем класс анимации
    element.classList.remove('hidden', 'fade-out');
    element.classList.add('animated', 'fade-in');

    // Удаляем класс анимации после её завершения
    setTimeout(() => {
        element.classList.remove('animated', 'fade-in');
    }, 400); // Время совпадает с animation-duration
}

function hideElementWithAnimation(elementId) {
    const element = document.getElementById(elementId);

    // Добавляем класс анимации скрытия
    element.classList.add('animated', 'fade-out');

    // После завершения анимации скрываем элемент
    setTimeout(() => {
        element.classList.add('hidden');
        element.classList.remove('animated', 'fade-out');
    }, 400); // Время совпадает с animation-duration
}


// Обработчики кнопок
document.getElementById('start-btn').addEventListener('click', () => {
    hideElementWithAnimation('menu');
    showElementWithAnimation('game');
});

document.getElementById('referral-btn').addEventListener('click', () => {
    hideElementWithAnimation('menu');
    showElementWithAnimation('referral-screen');
});

document.getElementById('back-to-menu-btn').addEventListener('click', () => {
    hideElementWithAnimation('referral-screen');
    showElementWithAnimation('menu');
});

document.getElementById('pause-btn').addEventListener('click', () => {
    hideElementWithAnimation('game');
    showElementWithAnimation('pause-screen');
});

document.getElementById('resume-btn').addEventListener('click', () => {
    hideElementWithAnimation('pause-screen');
    showElementWithAnimation('game');
});

document.getElementById('exit-to-menu-btn').addEventListener('click', () => {
    hideElementWithAnimation('pause-screen');
    showElementWithAnimation('menu');
});

// Звуковые эффекты
const bubbleSound = new Audio('sounds/pop.mp3'); // Путь к звуковому файлу пузыря
const gameOverSound = new Audio('sounds/gameover.mp3'); // Путь к звуковому файлу окончания игры
const bonusSound = new Audio('sounds/bonus.mp3'); // Путь к звуковому файлу бонуса

// Получаем элементы для счета и таймера
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const totalBubblesElement = document.getElementById('total-bubbles'); // Элемент для отображения собранных пузырей
const totalBlypElement = document.getElementById('total-blyp'); // Элемент для отображения собранных пузырей

// Инициализация переменных
let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
let totalBubbles = localStorage.getItem('totalBubbles') ? parseInt(localStorage.getItem('totalBubbles')) : 0; // Счётчик собранных пузырей
let totalBlyp = localStorage.getItem('totalBlyp') ? parseInt(localStorage.getItem('totalBlyp')) : 0; // Счётчик собранных пузырей блюп
let level = 1; // Уровень сложности
let bubbleInterval;
let bubbleCount = 0; // Счётчик пузырей
let caughtBubbles = 0; // Счётчик пойманных пузырей
let gameTime = 45; // Таймер игры, 45 секунд
let timerInterval;
let levelInterval = 500; // Интервал для создания пузырей

// Обновление счётчика собранных пузырей в главном меню
totalBubblesElement.textContent = `${totalBubbles}`;
totalBlypElement.textContent = `${totalBlyp}`;

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
        const shareText = "Смотри какая крутая игра! ";  // Текст, который мы хотим отправить
        const shareUrl = `${generateReferralLink()}`;  // Реферальная ссылка
        
        // Формируем ссылку для Telegram с текстом и реферальной ссылкой
        const message = `${shareText} ${shareUrl}`;
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;

        // Открываем ссылку в Telegram
        tg.openLink(telegramShareUrl);
    });
});

// Обработчик для кнопки "Назад"
document.getElementById('back-to-menu-btn').addEventListener('click', () => {
    document.getElementById('referral-screen').style.display = 'none'; // Скрываем экран рефералов
    document.getElementById('menu').style.display = 'block'; // Показываем главное меню
});

// Функция для инициализации игры
function initializeGame() {
    // Показываем экран загрузки
    const loadingScreen = document.getElementById('loading-screen');
    
    // Загружаем игру (можно добавить ваши дополнительные шаги, например, загрузку ресурсов)
    setTimeout(() => {
        // Когда игра готова, скрываем экран загрузки
        loadingScreen.style.opacity = '0';

        // Ждем, пока анимация исчезновения загрузочного экрана завершится
        setTimeout(() => {
            loadingScreen.style.display = 'none'; // Скрываем экран загрузки полностью
        }, 500); // Время на завершение анимации исчезновения
    }, 2000); // Симуляция времени на загрузку (можно заменить на реальную загрузку ресурсов)
}

// Функция начала игры
function startGame() {
    // Тут начинается ваша игра
    document.getElementById('menu').style.display = 'none';  // Прячем меню
    document.getElementById('game').style.display = 'block'; // Показываем игру
    // Остальной код для старта игры
}

// Вызов функции инициализации игры
initializeGame();

// Функция создания пузыря
function createBubble() {
    const bubble = document.createElement('div');
    
    const size = Math.random() * 50 + 30; // Размер пузыря от 30px до 60px
    const leftPosition = Math.random() * 100; // случайное положение по горизонтали

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${leftPosition}%`;

    // Случайным образом создаем обычные или бонусные пузыри
    const isBonus = Math.random() < 0.1; // 10% шанс на бонус

    if (isBonus) {
        bubble.classList.add('bubble', 'bonus'); // Добавляем стиль для бонусных пузырей
    } else {
        bubble.classList.add('bubble', 'normal'); // Добавляем стиль для обычных пузырей
    }

    bubble.addEventListener('click', () => {
        // Активируем анимацию лопанья пузыря
        bubble.classList.add('pop');
        
        // После окончания анимации удаляем пузырь
        setTimeout(() => {
            bubble.remove();
        }, 500); // Время совпадает с длительностью анимации

        // Блокируем повторный клик
        bubble.style.pointerEvents = 'none'; 
        
        // Проигрываем звук
        if (isBonus) {
            bonusSound.play(); // Звук бонусного пузыря
            totalBlyp++; // Обычный пузырь увеличивает очки на 1
        } else {
            bubbleSound.play(); // Звук обычного пузыря
            score++; // Обычный пузырь увеличивает очки на 1
        }

        // Обновляем счёт
        caughtBubbles++; // Увеличиваем количество пойманных пузырей
        totalBubbles++; // Увеличиваем количество собранных пузырей
        localStorage.setItem('score', score); // Сохраняем счет
        localStorage.setItem('totalBubbles', totalBubbles); // Сохраняем собранные пузырь
		localStorage.setItem('totalBlyp', totalBlyp);
        scoreElement.querySelector('span').textContent = `${caughtBubbles}`;
        totalBubblesElement.textContent = `${totalBubbles}`;
		totalBlypElement.textContent = `${totalBlyp}`;
		
    });

    // Рассчитываем скорость подъема пузыря
    const minSpeed = 45; // Минимальная скорость подъема
    const maxSpeed = 60; // Максимальная скорость подъема
    const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed; // Генерируем случайную скорость между min и max значениями
    bubble.style.animationDuration = `${speed}s`; // Устанавливаем уникальное время для каждого пузыря

    document.getElementById('game').appendChild(bubble);

    // Удаляем пузырь после того, как он выйдет за пределы экрана
    setTimeout(() => {
        bubble.remove();
    }, speed * 500);

    bubbleCount++; // Увеличиваем счетчик пузырей
}

// Обработчик клика по пузырю
function handleBubbleClick(event) {
    // Блокируем клик по пузырю после того как он был пойман
    event.target.style.pointerEvents = 'none'; // Это предотвратит дополнительные клики по пузырю
    event.target.removeEventListener('click', handleBubbleClick); // Убираем обработчик
    event.target.removeEventListener('touchstart', handleBubbleClick); // Убираем обработчик для тач-событий

    const bubble = event.target;
    bubble.style.pointerEvents = 'none'; // Блокируем дальнейшие клики по пузырю

    // Понижаем шанс исчезновения пузыря и делаем клик более точным
    setTimeout(() => {
        bubble.remove(); // Убираем пузырь после клика
    }, 0); // Убираем мгновенно (можно добавить анимацию исчезновения)

    // Плейсинг звуков
    if (bubble.classList.contains('bonus')) {
        bonusSound.play(); // Проигрываем бонусный звук
        score += 1; // Добавляем бонусные очки
        caughtBubbles += 1; // Увеличиваем количество пойманных пузырей
    } else {
        bubbleSound.play(); // Проигрываем обычный звук
        score++; // Обычный пузырь увеличивает очки на 1
        caughtBubbles++; // Увеличиваем количество пойманных пузырей
    }

    // Обновляем счет
    totalBubbles++; // Увеличиваем количество собранных пузырей
	totalBlyp++;
    localStorage.setItem('score', score); // Сохраняем счет
    localStorage.setItem('totalBubbles', totalBubbles); // Сохраняем собранные пузырь
	localStorage.setItem('totalBlyp', totalBlyp);
    scoreElement.querySelector('span').textContent = `${caughtBubbles}`;
    totalBubblesElement.textContent = `${totalBubbles}`;
	totalBlypElement.textContent = `${totalblyp}`;
}


// Функция для обновления уровня
function updateLevel() {
    if (caughtBubbles >= level * 10) {  // Каждые 10 пойманных пузырей повышаем уровень
        level++;  // Увеличиваем уровень
        levelInterval = 1000;  // Уменьшаем интервал появления пузырей (не меньше 200 мс)
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
    timerElement.querySelector('span').textContent = ` 00:${gameTime} `;
    timerInterval = setInterval(() => {
        gameTime--;
	if (gameTime <= 9) {
		timerElement.querySelector('span').textContent = ` 00:0${gameTime} `;
	} else {
        	timerElement.querySelector('span').textContent = ` 00:${gameTime} `;
	}
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
    document.getElementById('final-score').textContent = `${caughtBubbles}`; // Показываем количество пойманных пузырей
    document.getElementById('best-score').textContent = `${bestScore}`;
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
        timerElement.querySelector('span').textContent = `00:${gameTime} `;
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
