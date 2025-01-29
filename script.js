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

// Инициализация переменных для билетов
let tickets = localStorage.getItem('tickets') ? parseInt(localStorage.getItem('tickets')) : 0;
let lastTicketTime = localStorage.getItem('lastTicketTime') ? parseInt(localStorage.getItem('lastTicketTime')) : 0;
const TICKET_COST = 1; // Стоимость одного билета для игры
const TICKETS_PER_DAY = 5; // Количество билетов, которые можно получить за день
const TICKET_COOLDOWN = 24 * 60 * 60 * 1000;; // 24 часа в миллисекундах

// Элементы UI
const ticketsElement = document.getElementById('tickets');
const ticketTimerElement = document.getElementById('ticket-timer'); // Элемент для отображения таймера на кнопке
const progressButton = document.getElementById('get-ticket-btn'); // Кнопка для получения билета
const progressBar = document.createElement('div'); // Элемент для прогресс-бара
let ticketInterval; // Убедитесь, что переменная ticketInterval объявлена глобальн

// Добавляем элемент прогресса внутрь кнопки
progressBar.classList.add('progress-bar');
progressButton.appendChild(progressBar);

// Обновляем количество билетов на экране
ticketsElement.textContent = `${tickets}`;

function resetTicketTimer() {
        // Сбросить текущий интервал
    clearInterval(ticketInterval);

        // Перезапустить отсчёт с нуля
    const currentTime = Date.now();
    lastTicketTime = currentTime;
    localStorage.setItem('lastTicketTime', currentTime);

        // Перезапустить таймер
    ticketInterval = setInterval(function () {
        const remainingTimeInSeconds = Math.ceil((TICKET_COOLDOWN - (Date.now() - lastTicketTime)) / 1000);
        updateTicketProgress(remainingTimeInSeconds);
    }, 1000);
}
// Функция для получения билетов
function getTickets() {
    const currentTime = Date.now();

    // Проверяем, прошли ли 24 часа с последнего получения билетов
    if (currentTime - lastTicketTime >= TICKET_COOLDOWN) {
        tickets += TICKETS_PER_DAY;
        localStorage.setItem('tickets', tickets); // Сохраняем количество билетов
        localStorage.setItem('lastTicketTime', currentTime); // Сохраняем время последнего получения билетов
        ticketsElement.textContent = `${tickets}`;
        alert(`Вы получили ${TICKETS_PER_DAY} билетов!`);
		
		// Перезапуск таймера
        resetTicketTimer();
    } else {
        const remainingTime = Math.ceil((TICKET_COOLDOWN - (currentTime - lastTicketTime)) / 1000);
        updateTicketProgress(remainingTime);
        alert(`Следующие билеты будут доступны через ${remainingTime} секунд.`);
    }
}

// Обработчик кнопки "Получить билет"
document.getElementById('get-ticket-btn').addEventListener('click', getTickets);

// Функция для обновления прогресса на кнопке
function updateTicketProgress(remainingTimeInSeconds) {
    const remainingTime = remainingTimeInSeconds * 1000; // Переводим время в миллисекунды
    const progressWidth = (1 - remainingTime / TICKET_COOLDOWN) * 100; // Вычисляем процент заполняемости
    progressBar.style.width = `${progressWidth}%`;

    // Вычисляем оставшееся время в формате ЧЧ:ММ:СС
    const hours = Math.floor(remainingTimeInSeconds / 3600);
    const minutes = Math.floor((remainingTimeInSeconds % 3600) / 60);
    const seconds = remainingTimeInSeconds % 60;
    ticketTimerElement.textContent = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

// Функция для добавления ведущих нулей к числам
function padZero(num) {
    return num < 10 ? `0${num}` : num;
}

// Функция для обновления кнопки старта
function updateStartButton() {
    if (tickets <= 0) {
        progressButton.disabled = true; // Отключаем кнопку
        progressButton.title = 'У вас нет билетов для игры'; // Подсказка
    } else {
        progressButton.disabled = false; // Включаем кнопку
        progressButton.title = ''; // Убираем подсказку
    }
}



// Функция для обновления состояния кнопки с прогрессом
function updateTicketButton() {
    const currentTime = Date.now();
    if (currentTime - lastTicketTime >= TICKET_COOLDOWN) {
        progressBar.style.width = '100%'; // Прогресс заполнен
        ticketTimerElement.textContent = '00:00:00'; // Время до получения билетов = 0
    } else {
        const remainingTimeInSeconds = Math.ceil((TICKET_COOLDOWN - (currentTime - lastTicketTime)) / 1000);
        updateTicketProgress(remainingTimeInSeconds);
    }
}

// Обновляем состояние кнопки каждую секунду
setInterval(updateTicketButton, 1000);

// Обработчики кнопок

	if (tickets >= TICKET_COST) {
		document.getElementById('start-btn').addEventListener('click', () => {
			hideElementWithAnimation('menu');
			showElementWithAnimation('game');
		});
	} else {
	}


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
let gameTime = 5; // Таймер игры, 45 секунд
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

// Функция для начала игры
function startGame() {
    if (tickets <= 0) {
		
		document.getElementById('menu').style.display = 'none';
		document.getElementById('notickets').style.display = 'block';
		
    } else {

		tickets -= TICKET_COST; // Снижаем количество билетов
		if (tickets < 0) {
			tickets = 0; // Убеждаемся, что количество билетов не станет отрицательным
		}
		
		    // Переключаем фоны
		document.getElementById('game-background').style.display = 'block'; // Показываем фон игры
		document.getElementById('menu-background').style.display = 'none'; // Скрываем фон меню

		localStorage.setItem('tickets', tickets); // Сохраняем количество билетов в localStorage
		ticketsElement.textContent = `${tickets}`; // Обновляем отображение количества билетов

		document.getElementById('menu').style.display = 'none';
		document.getElementById('game').style.display = 'block';

		caughtBubbles = 0;
		level = 1;
		bubbleCount = 0;
		gameTime = 45;

		bubbleInterval = setInterval(() => {
			createBubble();
			updateLevel();
		}, levelInterval);

		timerElement.querySelector('span').textContent = `00:${gameTime}`;
		timerInterval = setInterval(() => {
			gameTime--;
			timerElement.querySelector('span').textContent = `00:${gameTime}`;
			if (gameTime <= 0) {
				clearInterval(timerInterval);
				endGame();
			}
		}, 1000);
	}
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

function updateStartButton() {
    if (tickets <= 0) {
        document.getElementById('start-btn').disabled = true; // Отключаем кнопку
        document.getElementById('start-btn').title = 'У вас нет билетов для игры'; // Подсказка
    } else {
        document.getElementById('start-btn').disabled = false; // Включаем кнопку
        document.getElementById('start-btn').title = ''; // Убираем подсказку
    }
}
// Вызов функции обновления кнопки старта при загрузке страницы
updateStartButton();
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
if (tickets >= TICKET_COST) {
	document.getElementById('start-btn').addEventListener('click', startGame);
} else {
	
}

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

document.addEventListener("DOMContentLoaded", function () {
    // Логирование, чтобы убедиться, что DOM загружен
    console.log('DOM полностью загружен');
    
    const ticketsElement = document.getElementById('tickets');
    const ticketTimerElement = document.getElementById('ticket-timer');
    const progressButton = document.getElementById('get-ticket-btn');
    
    // Проверим, что все элементы найдены
    console.log(ticketsElement, ticketTimerElement, progressButton);

    if (!ticketTimerElement) {
        console.error("Ошибка: Элемент с id 'ticket-timer' не найден!");
        return; // Прерываем выполнение, если элемент не найден
    }

    // Ваш остальной код
});
