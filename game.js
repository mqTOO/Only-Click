class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.resources = {
            gold: 500,
            oil: 200,
        };
        this.gridSize = 32; // Размер клетки
        this.gridWidth = 16; // Количество клеток по ширине
        this.gridHeight = 16; // Количество клеток по высоте
        this.grid = []; // Хранение состояния сетки
        this.buildings = [];
        this.availableBuildings = [
            { name: 'Town Hall', image: 'townhall', cost: { gold: 200, oil: 0 }, size: { width: 4, height: 4 } },
            { name: 'Builder Hut', image: 'builderhut', cost: { gold: 100, oil: 0 }, size: { width: 2, height: 2 } },
            { name: 'Barracks', image: 'barracks', cost: { gold: 150, oil: 50 }, size: { width: 3, height: 3 } },
            { name: 'Gold Mine', image: 'goldmine', cost: { gold: 50, oil: 0 }, size: { width: 2, height: 2 }, production: { type: 'gold', rate: 10, capacity: 50 } },
            { name: 'Oil Pump', image: 'oilpump', cost: { gold: 0, oil: 50 }, size: { width: 2, height: 2 }, production: { type: 'oil', rate: 5, capacity: 30 } },
            { name: 'Gold Storage', image: 'goldstorage', cost: { gold: 300, oil: 0 }, size: { width: 3, height: 3 } },
            { name: 'Oil Storage', image: 'oilstorage', cost: { gold: 0, oil: 300 }, size: { width: 3, height: 3 } },
        ];
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('menuButton', 'assets/menu_button.png');
        this.load.image('gridTile', 'assets/grid_tile.png'); // Плитка для сетки
        this.load.image('townhall', 'assets/townhall.png');
        this.load.image('builderhut', 'assets/builderhut.png');
        this.load.image('barracks', 'assets/barracks.png');
        this.load.image('goldmine', 'assets/goldmine.png');
        this.load.image('oilpump', 'assets/oilpump.png');
        this.load.image('goldstorage', 'assets/goldstorage.png');
        this.load.image('oilstorage', 'assets/oilstorage.png');
    }

    create() {
        // Получаем размеры экрана Telegram Mini-App
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Настроим размеры камеры на основе размеров экрана
        this.cameras.main.setBounds(0, 0, screenWidth, screenHeight);
        this.cameras.main.setZoom(1);

        this.add.image(400, 300, 'background').setScrollFactor(0);

        this.resourceText = this.add.text(10, 10, this.getResourceText(), {
            font: '18px Arial',
            fill: '#ffffff',
        });

        const menuButton = this.add.image(750, 550, 'menuButton')
            .setInteractive()
            .on('pointerdown', () => this.openPurchaseMenu());

        this.createGrid();

        // Инициализация свайпа для перемещения камеры
        this.initCameraSwipe();

        // Поддержка масштабирования через колесо мыши
        this.input.on('pointerwheel', (pointer, deltaX, deltaY, deltaZ, event) => {
            this.handleZoom(deltaY);
        });

        // Поддержка масштабирования с помощью тач-жестов (для мобильных устройств)
        this.input.on('pointerdown', (pointer) => {
            if (pointer.event.touches && pointer.event.touches.length === 2) {
                this.initPinchZoom(pointer);
            }
        });

        // Используем Telegram API для сохранения прогресса
        this.loadProgress();
    }

    createGrid() {
        const centerX = this.scale.width / 2 - (this.gridWidth * this.gridSize) / 2;
        const centerY = this.scale.height / 2 - (this.gridHeight * this.gridSize) / 2;

        for (let row = 0; row < this.gridHeight; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridWidth; col++) {
                const x = centerX + col * this.gridSize;
                const y = centerY + row * this.gridSize;

                const tile = this.add.image(x, y, 'gridTile').setAlpha(0.3);
                this.grid[row][col] = { x, y, occupied: false, tile };
            }
        }
    }

    getResourceText() {
        return `Gold: ${this.resources.gold} | Oil: ${this.resources.oil}`;
    }

    openPurchaseMenu() {
        const menuBackground = this.add.rectangle(400, 300, 600, 400, 0x000000, 0.8);
        const closeButton = this.add.text(650, 150, 'X', { font: '24px Arial', fill: '#ffffff' })
            .setInteractive()
            .on('pointerdown', () => {
                menuBackground.destroy();
                closeButton.destroy();
                buildingButtons.forEach((btn) => btn.destroy());
            });

        const buildingButtons = [];
        let yOffset = 180;

        this.availableBuildings.forEach((building) => {
            const text = `${building.name} - Gold: ${building.cost.gold}, Oil: ${building.cost.oil}`;
            const button = this.add.text(200, yOffset, text, {
                font: '18px Arial',
                fill: '#00ff00',
            }).setInteractive().on('pointerdown', () => {
                this.purchaseBuilding(building);
                menuBackground.destroy();
                closeButton.destroy();
                buildingButtons.forEach((btn) => btn.destroy());
            });
            buildingButtons.push(button);
            yOffset += 40;
        });
    }

    purchaseBuilding(building) {
        if (this.resources.gold >= building.cost.gold && this.resources.oil >= building.cost.oil) {
            this.resources.gold -= building.cost.gold;
            this.resources.oil -= building.cost.oil;
            this.resourceText.setText(this.getResourceText());

            this.input.once('pointerdown', (pointer) => {
                const { row, col } = this.getGridPosition(pointer.x, pointer.y);
                if (this.canPlaceBuilding(row, col, building.size)) {
                    this.placeBuilding(row, col, building);
                } else {
                    alert('Not enough space!');
                }
            });

            alert(`Select a location for your ${building.name}`);
        } else {
            alert('НЕт ресов!');
        }
    }

    getGridPosition(x, y) {
        const centerX = this.scale.width / 2 - (this.gridWidth * this.gridSize) / 2;
        const centerY = this.scale.height / 2 - (this.gridHeight * this.gridSize) / 2;

        const col = Math.floor((x - centerX) / this.gridSize);
        const row = Math.floor((y - centerY) / this.gridSize);
        return { row, col };
    }

    canPlaceBuilding(row, col, size) {
        for (let r = 0; r < size.height; r++) {
            for (let c = 0; c < size.width; c++) {
                const gridCell = this.grid[row + r]?.[col + c];
                if (!gridCell || gridCell.occupied) {
                    return false;
                }
            }
        }
        return true;
    }

    placeBuilding(row, col, building) {
        for (let r = 0; r < building.size.height; r++) {
            for (let c = 0; c < building.size.width; c++) {
                this.grid[row + r][col + c].occupied = true;
            }
        }

        const { x, y } = this.grid[row][col];
        this.add.image(x, y, building.image);
    }

    // Инициализация свайпа для перемещения камеры
    initCameraSwipe() {
        this.isSwiping = false;
        this.startX = 0;
        this.startY = 0;

        this.input.on('pointerdown', (pointer) => {
            this.isSwiping = true;
            this.startX = pointer.x;
            this.startY = pointer.y;
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isSwiping) {
                const diffX = pointer.x - this.startX;
                const diffY = pointer.y - this.startY;

                // Скорректируем скорость движения в зависимости от масштаба
                const zoomFactor = this.cameras.main.zoom;
                this.cameras.main.scrollX -= diffX * 0.2 * zoomFactor;
                this.cameras.main.scrollY -= diffY * 0.2 * zoomFactor;

                this.startX = pointer.x;
                this.startY = pointer.y;
            }
        });

        this.input.on('pointerup', () => {
            this.isSwiping = false;
        });
    }

    // Обработка масштаба через колесо мыши
    handleZoom(deltaY) {
        const newZoom = Math.max(0.5, Math.min(2, this.cameras.main.zoom + deltaY * -0.05)); // Ограничиваем зум от 0.5 до 2
        this.cameras.main.setZoom(newZoom);
    }

    // Инициализация масштабирования с помощью тач-жестов
    initPinchZoom(pointer) {
        const startDistance = this.getTouchDistance(pointer);
        this.input.on('pointermove', (movePointer) => {
            const currentDistance = this.getTouchDistance(movePointer);
            const scale = currentDistance / startDistance;
            this.cameras.main.setZoom(scale);
        });
    }

    // Получение расстояния между двумя пальцами
    getTouchDistance(pointer) {
        if (pointer.event.touches && pointer.event.touches.length === 2) {
            const touch1 = pointer.event.touches[0];
            const touch2 = pointer.event.touches[1];
            return Phaser.Math.Distance.Between(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);
        }
        return 0;
    }

    // Загрузка прогресса из Telegram API
    async loadProgress() {
        try {
            const data = await window.Telegram.WebApp.getStorageItem('gameProgress');
            if (data) {
                const progress = JSON.parse(data);
                this.resources = progress.resources;
                progress.buildings.forEach((buildingData) => {
                    const building = this.availableBuildings.find(b => b.name === buildingData.name);
                    if (building) {
                        const newBuilding = this.placeBuilding(buildingData.x, buildingData.y, building);
                    }
                });
                this.resourceText.setText(this.getResourceText());
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,  // Устанавливаем ширину экрана Telegram Mini-App
    height: window.innerHeight,  // Устанавливаем высоту экрана Telegram Mini-App
    scene: MainScene,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(config);
