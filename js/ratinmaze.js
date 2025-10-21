document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('maze-grid');
    const statusDisplay = document.getElementById('maze-status');
    // Renamed the existing 'solveButton' to 'resetButton' to better reflect its function when game is active.
    const resetButton = document.getElementById('solve-maze'); 
    const gameControls = document.getElementById('game-controls'); // Assuming you have a controls container

    const N = 5;
    const START_INDEX = 0;
    const GOAL_INDEX = N * N - 1;
    const TOTAL_CELLS = N * N;

    // --- NEW: Play Button Setup ---
    // If you already have a 'play-maze' button in HTML, use that ID instead of creating one.
    const playButton = document.createElement('button');
    playButton.id = 'play-maze-button';
    playButton.textContent = 'Start Rat Maze';
    playButton.classList.add('bg-indigo-600', 'hover:bg-indigo-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded', 'mr-2');
    
    // Append the new Play button next to the Reset button (assuming a controls container exists)
    if (gameControls) {
        gameControls.prepend(playButton); // Add play button before the reset button
        resetButton.textContent = 'Reset'; // Initial text for the reset button
        resetButton.disabled = true;       // Initially disabled until game starts
    }

    // Game state variables
    let hardWalls = [];      // Permanent, visible walls (Visual obstacles)
    let hiddenTraps = [];    // Invisible, lethal traps (Hidden loss conditions)
    let ratPosition = START_INDEX;
    let gameActive = false;

    // Utility function to get a random integer in a range
    const getRandomInt = (max) => Math.floor(Math.random() * max);

    // --- Maze Setup Functions (Unchanged) ---
    const initializeMaze = () => {
        hardWalls = [];
        hiddenTraps = [];
        
        let availableIndices = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
        availableIndices = availableIndices.filter(i => i !== START_INDEX && i !== GOAL_INDEX);

        const numWalls = getRandomInt(3) + 5; // 5 to 7 walls
        for (let i = 0; i < numWalls && availableIndices.length > 0; i++) {
            const wallIndex = getRandomInt(availableIndices.length);
            hardWalls.push(availableIndices.splice(wallIndex, 1)[0]);
        }

        const numTraps = getRandomInt(3) + 3; // 3 to 5 traps
        for (let i = 0; i < numTraps && availableIndices.length > 0; i++) {
            const trapIndex = getRandomInt(availableIndices.length);
            hiddenTraps.push(availableIndices.splice(trapIndex, 1)[0]);
        }
    };

    // --- Game Render/State Management (Unchanged logic, just using 'resetButton') ---
    
    const renderMaze = () => {
        if (!gridElement) return;

        gridElement.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        gridElement.style.gridTemplateRows = `repeat(${N}, 1fr)`;
        gridElement.innerHTML = '';

        for (let i = 0; i < TOTAL_CELLS; i++) {
            const cell = document.createElement('div');
            cell.classList.add('maze-cell', 'w-full', 'h-full', 'aspect-square');
            
            const isWall = hardWalls.includes(i);
            const isTrap = hiddenTraps.includes(i);

            if (isWall) {
                cell.classList.add('maze-wall');
            }

            if (i === GOAL_INDEX) {
                cell.innerHTML = '<span class="text-yellow-500">🧀</span>';
            }
            
            if (i === ratPosition) {
                cell.innerHTML = '<span class="text-indigo-500">🐀</span>';
                
                if (gameActive) {
                    cell.classList.add('transition-all', 'duration-150', 'bg-green-300/50', 'dark:bg-green-700/50');
                    setTimeout(() => {
                        cell.classList.remove('bg-green-300/50', 'dark:bg-green-700/50');
                    }, 150); 
                }
            }

            if (!gameActive) {
                if (isWall) {
                     cell.classList.add('maze-wall');
                }
                if (isTrap) {
                    if (i !== GOAL_INDEX) {
                         cell.innerHTML = '<span class="text-red-700">💀</span>';
                    }
                }
                if (!hardWalls.includes(ratPosition) && hiddenTraps.includes(ratPosition) && i === ratPosition) {
                     cell.innerHTML = '<span class="text-red-900">💥</span>';
                     cell.classList.add('bg-red-500/70', 'dark:bg-red-800/70');
                }
            }
            
            gridElement.appendChild(cell);
        }
    };

    const gameOver = (win) => {
        gameActive = false;
        // Enable reset button after game ends
        resetButton.disabled = false; 
        playButton.textContent = 'Start New Maze'; // Offer to start a completely new maze

        if (win) {
            statusDisplay.textContent = 'You Reached the Cheese! 🎉';
            window.showMessage('VICTORY!', 'The rat found the cheese without hitting any traps!');
        } else {
            const reason = hardWalls.includes(ratPosition) ? "Wall" : "TRAP";
            statusDisplay.textContent = `Game Over! You hit a ${reason}. 💀`;
            window.showMessage('DEFEAT', `The rat hit a ${reason}! Try again.`);
        }
        renderMaze(); 
    };
    
    // --- Movement Logic (Unchanged) ---
    
    const tryMove = (newPosition) => {
        if (!gameActive) return;

        if (hardWalls.includes(newPosition)) {
            ratPosition = newPosition;
            gameOver(false); 
            return;
        }

        ratPosition = newPosition;
        
        if (hiddenTraps.includes(newPosition)) {
            gameOver(false);
            return;
        }

        if (newPosition === GOAL_INDEX) {
            gameOver(true);
            return;
        }

        renderMaze();
    };

    const handleMovement = (event) => {
        if (!gameActive) return;
        
        const key = event.key.toLowerCase();
        
        let newPos = ratPosition;
        const currentRow = Math.floor(ratPosition / N);
        
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
            event.preventDefault(); 
        }

        switch (key) {
            case 'arrowup':
            case 'w':
                if (currentRow > 0) {
                    newPos = ratPosition - N;
                } else {
                    return;
                }
                break;
            case 'arrowdown':
            case 's':
                if (currentRow < N - 1) {
                    newPos = ratPosition + N;
                } else {
                    return;
                }
                break;
            case 'arrowleft':
            case 'a':
                if (ratPosition % N !== 0) {
                    newPos = ratPosition - 1;
                } else {
                    return;
                }
                break;
            case 'arrowright':
            case 'd':
                if ((ratPosition + 1) % N !== 0) {
                    newPos = ratPosition + 1;
                } else {
                    return;
                }
                break;
            default:
                return;
        }
        
        if (newPos !== ratPosition) {
            tryMove(newPos);
        }
    };

    // --- Initialization ---

    const startGame = () => {
        initializeMaze(); 
        ratPosition = START_INDEX;
        gameActive = true;
        
        // Disable the Play/Start button and enable the Reset button
        playButton.disabled = true;
        resetButton.disabled = false;
        
        statusDisplay.textContent = 'Use ARROW keys or WASD to find the cheese (🧀). Avoid hidden traps!';
        playButton.textContent = 'Game Active';
        resetButton.textContent = 'Reset Maze';
        renderMaze();
    };
    
    // --- Event Listeners Setup ---
    
    // The reset button now triggers startGame, which resets all variables.
    if (resetButton) resetButton.addEventListener('click', startGame);
    
    // NEW: Play button listener
    if (playButton) playButton.addEventListener('click', startGame); 
    
    // Keyboard Listener attached to the document body for global capture
    document.addEventListener('keydown', handleMovement);

    // Touch/Swipe Listener (Unchanged)
    let touchStartX = 0;
    let touchStartY = 0;
    
    gridElement.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);

    gridElement.addEventListener('touchmove', (e) => {
        e.preventDefault(); 
    }, false);


    gridElement.addEventListener('touchend', (e) => {
        if (!gameActive) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
            if (deltaX > 0) handleMovement({key: 'ArrowRight'});
            else handleMovement({key: 'ArrowLeft'});
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 20) {
            if (deltaY > 0) handleMovement({key: 'ArrowDown'});
            else handleMovement({key: 'ArrowUp'});
        }
    }, false);

    // Initial setup: Render maze so user can see it before clicking 'Play'
    initializeMaze();
    renderMaze();
    statusDisplay.textContent = 'Ready to play the Rat Maze? Click "Start Rat Maze"!';
});