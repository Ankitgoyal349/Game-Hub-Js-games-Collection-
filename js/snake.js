document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const scoreDisplay = document.getElementById('snake-score');
    const startButton = document.getElementById('start-snake');
    const resetButton = document.getElementById('reset-snake');

    if (!ctx) return;

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let snake = [];
    let xVelocity = 1;
    let yVelocity = 0;
    let foodX = 0;
    let foodY = 0;
    let score = 0;
    let gameLoop;
    let gameStarted = false;

    const resetGame = () => {
        snake = [{ x: 10, y: 10 }];
        xVelocity = 1;
        yVelocity = 0;
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        placeFood();
        drawGame(); 
        clearInterval(gameLoop);
        gameStarted = false;
        startButton.textContent = 'Start';
        startButton.disabled = false;
    };

    const startGame = () => {
        if (gameStarted) return;
        gameStarted = true;
        startButton.textContent = 'Playing...';
        startButton.disabled = true;
        gameLoop = setInterval(gameLogic, 100);
    };

    const placeFood = () => {
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);

        for (const segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                placeFood(); 
                return;
            }
        }
    };

    const drawGame = () => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDarkMode ? '#1f2937' : '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw food
        ctx.fillStyle = 'red';
        ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize - 1, gridSize - 1);

        // Draw snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
        });
    };

    const gameLogic = () => {
        let head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };

        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        if (head.x === foodX && head.y === foodY) {
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            placeFood();
        } else {
            snake.pop();
        }

        drawGame();
    };

    const gameOver = () => {
        clearInterval(gameLoop);
        window.showMessage('Game Over!', `Your final score: ${score}`);
        resetGame();
    };

    const changeDirection = (key) => {
        switch (key) {
            case 'ArrowUp':
                if (yVelocity === 1) break;
                xVelocity = 0; yVelocity = -1; break;
            case 'ArrowDown':
                if (yVelocity === -1) break;
                xVelocity = 0; yVelocity = 1; break;
            case 'ArrowLeft':
                if (xVelocity === 1) break;
                xVelocity = -1; yVelocity = 0; break;
            case 'ArrowRight':
                if (xVelocity === -1) break;
                xVelocity = 1; yVelocity = 0; break;
        }
    };
    
    // Keyboard input
    document.addEventListener('keydown', (event) => {
        if (gameStarted) changeDirection(event.key);
    });

    // Touch/Swipe logic
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);

    canvas.addEventListener('touchend', (e) => {
        if (!gameStarted) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Determine if movement is horizontal or vertical
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) changeDirection('ArrowRight');
            else changeDirection('ArrowLeft');
        } else {
            if (deltaY > 0) changeDirection('ArrowDown');
            else changeDirection('ArrowUp');
        }
    }, false);


    if (startButton) startButton.addEventListener('click', startGame);
    if (resetButton) resetButton.addEventListener('click', resetGame);
    resetGame();
});
