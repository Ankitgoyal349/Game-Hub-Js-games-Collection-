document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('maze-grid');
    const statusDisplay = document.getElementById('maze-status');
    const solveButton = document.getElementById('solve-maze'); 
    const N = 5;
    const START_INDEX = 0;
    const GOAL_INDEX = N * N - 1;
    const TOTAL_CELLS = N * N;

    // Game state variables
    let hardWalls = [];      // Permanent, visible walls (Visual obstacles)
    let hiddenTraps = [];    // Invisible, lethal traps (Hidden loss conditions)
    let ratPosition = START_INDEX;
    let gameActive = false;

    // Utility function to get a random integer in a range
    const getRandomInt = (max) => Math.floor(Math.random() * max);

    // --- Maze Setup Functions ---

    // 1. Generates hard walls (visual barriers) and traps (hidden death spots) randomly
    const initializeMaze = () => {
        hardWalls = [];
        hiddenTraps = [];
        
        // Start with all cells available except start and goal
        let availableIndices = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
        availableIndices = availableIndices.filter(i => i !== START_INDEX && i !== GOAL_INDEX);

        // Randomly place 5-7 Hard Walls (visual barriers)
        const numWalls = getRandomInt(3) + 5; // 5 to 7 walls
        for (let i = 0; i < numWalls && availableIndices.length > 0; i++) {
            const wallIndex = getRandomInt(availableIndices.length);
            hardWalls.push(availableIndices.splice(wallIndex, 1)[0]);
        }

        // Randomly place 3-5 Hidden Traps (lethal, invisible spots)
        const numTraps = getRandomInt(3) + 3; // 3 to 5 traps
        for (let i = 0; i < numTraps && availableIndices.length > 0; i++) {
            const trapIndex = getRandomInt(availableIndices.length);
            // FIX: Corrected typo from hiddenTraaps to hiddenTraps
            hiddenTraps.push(availableIndices.splice(trapIndex, 1)[0]);
        }
    };

    // --- Game Render/State Management ---
    
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
                cell.classList.add('maze-wall'); // Visual barrier
            }

            // Display GOAL
            if (i === GOAL_INDEX) {
                cell.innerHTML = '<span class="text-yellow-500">🧀</span>';
            }
            
            // Display RAT
            if (i === ratPosition) {
                cell.innerHTML = '<span class="text-indigo-500">🐀</span>';
                
                // Add pulse animation on movement
                if (gameActive) {
                    // Using a slightly different color and animation name to ensure Tailwind picks it up
                    cell.classList.add('transition-all', 'duration-150', 'bg-green-300/50', 'dark:bg-green-700/50');
                    setTimeout(() => {
                        cell.classList.remove('bg-green-300/50', 'dark:bg-green-700/50');
                    }, 150); 
                }
            }

            // Reveal Traps and Walls only if game is over
            if (!gameActive) {
                if (isWall) {
                     cell.classList.add('maze-wall'); // Ensure visible
                }
                if (isTrap) {
                    if (i !== GOAL_INDEX) { // Don't hide the cheese!
                        cell.innerHTML = '<span class="text-red-700">💀</span>';
                    }
                }
                 // Highlight the cell that caused the loss
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
        if (win) {
            statusDisplay.textContent = 'You Reached the Cheese! 🎉';
            window.showMessage('VICTORY!', 'The rat found the cheese without hitting any traps!');
        } else {
            const reason = hardWalls.includes(ratPosition) ? "Wall" : "TRAP";
            statusDisplay.textContent = `Game Over! You hit a ${reason}. 💀`;
            window.showMessage('DEFEAT', `The rat hit a ${reason}! Try again.`);
        }
        // Re-render to show all trap locations on loss and highlight loss spot
        renderMaze(); 
        solveButton.textContent = 'Play Again';
    };
    
    // --- Movement Logic ---
    
    const tryMove = (newPosition) => {
        if (!gameActive) return;

        // 1. Check Hard Walls (Obstacles)
        if (hardWalls.includes(newPosition)) {
            // Rat hits a visible wall. Game over for hitting obstacle.
            ratPosition = newPosition; // Move rat to wall boundary for visual confirmation
            gameOver(false); 
            return;
        }

        ratPosition = newPosition;
        
        // 2. Check Hidden Traps (Loss condition)
        if (hiddenTraps.includes(newPosition)) {
            gameOver(false);
            return;
        }

        // 3. Check Win Condition
        if (newPosition === GOAL_INDEX) {
            gameOver(true);
            return;
        }

        // Successful move: Re-render
        renderMaze();
    };

    const handleMovement = (event) => {
        if (!gameActive) return;
        
        const key = event.key.toLowerCase();
        
        let newPos = ratPosition;
        const currentRow = Math.floor(ratPosition / N);
        
        // Consume arrow key presses to prevent page scrolling
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
        statusDisplay.textContent = 'Use ARROW keys or WASD to find the cheese (🧀). Avoid hidden traps!';
        solveButton.textContent = 'Reset Game';
        renderMaze();
    };
    
    // --- Event Listeners Setup ---
    if (solveButton) solveButton.addEventListener('click', startGame);
    
    // Keyboard Listener attached to the document body for global capture
    document.addEventListener('keydown', handleMovement);

    // Touch/Swipe Listener
    let touchStartX = 0;
    let touchStartY = 0;
    
    gridElement.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        // Don't prevent default here to allow vertical scrolling on mobile if not swiping
    }, false);

    gridElement.addEventListener('touchmove', (e) => {
         // Prevent default on move to stop accidental scrolling when swiping horizontally
        e.preventDefault(); 
    }, false);


    gridElement.addEventListener('touchend', (e) => {
        if (!gameActive) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Check if swipe magnitude is large enough (e.g., > 20px)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
            if (deltaX > 0) handleMovement({key: 'ArrowRight'});
            else handleMovement({key: 'ArrowLeft'});
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 20) {
            if (deltaY > 0) handleMovement({key: 'ArrowDown'});
            else handleMovement({key: 'ArrowUp'});
        }
    }, false);

    startGame(); // Initial game start
});
