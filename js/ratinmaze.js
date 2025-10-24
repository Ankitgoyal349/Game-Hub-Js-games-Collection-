// Define a dummy function for showMessage if it's not defined elsewhere (to prevent errors)
if (typeof window.showMessage !== 'function') {
    window.showMessage = (title, message) => alert(`${title}: ${message}`);
}

document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('maze-grid');
    const statusDisplay = document.getElementById('maze-status');
    // Renamed ID 'solve-maze' is used for the Reset button
    const resetButton = document.getElementById('solve-maze'); 
    // You MUST wrap the existing button in HTML with this ID: <div id="game-controls"><button id="solve-maze">...</button></div>
    const gameControls = document.getElementById('game-controls') || resetButton.parentElement; // Fallback to parent if controls ID is missing

    const N = 5;
    const START_INDEX = 0;
    const GOAL_INDEX = N * N - 1;
    const TOTAL_CELLS = N * N;

    // --- NEW: Play Button Setup (Inserted next to Reset button) ---
    const playButton = document.createElement('button');
    playButton.id = 'play-maze-button';
    playButton.textContent = 'Start New Maze';
    playButton.classList.add('bg-indigo-600', 'hover:bg-indigo-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded', 'mr-2');
    
    if (gameControls) {
        // Place the new button before the Reset button
        gameControls.prepend(playButton); 
        resetButton.textContent = 'Reset Run'; 
        resetButton.disabled = true;
    }

    // Game state variables
    let hardWalls = [];      
    let hiddenTraps = [];    
    let ratPosition = START_INDEX;
    let gameActive = false;

    // Utility functions
    const getRandomInt = (max) => Math.floor(Math.random() * max);
    const getCoords = (i) => ({ row: Math.floor(i / N), col: i % N });
    const getIndex = (r, c) => r * N + c;

    // --- DSA IMPLEMENTATION: Breadth-First Search (BFS) for Solvability ---
    const isSolvable = (start, goal, walls, N) => {
        if (walls.includes(start) || walls.includes(goal)) return false;
        const queue = [start];
        const visited = new Set([start]);
        
        while (queue.length > 0) {
            const current = queue.shift();
            if (current === goal) return true; 
            const { row, col } = getCoords(current);
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right

            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < N && newCol >= 0 && newCol < N) {
                    const neighbor = getIndex(newRow, newCol);
                    
                    if (!walls.includes(neighbor) && !visited.has(neighbor)) { 
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
        }
        return false;
    };

    // --- Maze Setup Functions (Generates Walls and Traps, guaranteeing solvability) ---
    const initializeMaze = () => {
        let attempt = 0;
        
        do {
            hardWalls = [];
            let availableIndices = Array.from({ length: TOTAL_CELLS }, (_, i) => i)
                               .filter(i => i !== START_INDEX && i !== GOAL_INDEX);
            
            // 1. Generate Hard Walls
            const numWalls = getRandomInt(3) + 5; 
            let tempWalls = [];
            let tempAvailable = [...availableIndices]; 

            for (let i = 0; i < numWalls && tempAvailable.length > 0; i++) {
                const wallIndex = getRandomInt(tempAvailable.length);
                tempWalls.push(tempAvailable.splice(wallIndex, 1)[0]);
            }
            hardWalls = tempWalls;
            attempt++;
        } while (!isSolvable(START_INDEX, GOAL_INDEX, hardWalls, N) && attempt < 100); 

        // 2. Generate Hidden Traps (Only on non-wall, non-start/goal cells)
        hiddenTraps = [];
        const trapAvailableIndices = Array.from({ length: TOTAL_CELLS }, (_, i) => i)
                            .filter(i => i !== START_INDEX && i !== GOAL_INDEX && !hardWalls.includes(i));
        
        const numTraps = getRandomInt(3) + 3; 
        for (let i = 0; i < numTraps && trapAvailableIndices.length > 0; i++) {
            const trapIndex = getRandomInt(trapAvailableIndices.length);
            hiddenTraps.push(trapAvailableIndices.splice(trapIndex, 1)[0]);
        }
    };

    // --- Game Render/State Management ---
    
    const renderMaze = () => {
        if (!gridElement) return;

        // Ensure the grid structure is correctly applied (CSS handles the gaps/visuals)
        gridElement.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        gridElement.innerHTML = ''; // Clear previous grid

        for (let i = 0; i < TOTAL_CELLS; i++) {
            const cell = document.createElement('div');
            cell.classList.add('maze-cell', 'w-full', 'h-full', 'aspect-square');
            
            const isWall = hardWalls.includes(i);
            const isTrap = hiddenTraps.includes(i);

            if (isWall) cell.classList.add('maze-wall');

            if (i === GOAL_INDEX) cell.innerHTML = '<span class="text-yellow-500">🧀</span>';
            
            if (i === ratPosition) {
                cell.innerHTML = '<span class="text-indigo-500">🐀</span>';
                if (gameActive) {
                    cell.classList.add('transition-all', 'duration-150', 'bg-green-300/50', 'dark:bg-green-700/50');
                    setTimeout(() => { cell.classList.remove('bg-green-300/50', 'dark:bg-green-700/50'); }, 150); 
                }
            }

            if (!gameActive) {
                if (isTrap && i !== GOAL_INDEX && i !== START_INDEX) cell.innerHTML = '<span class="text-red-700">💀</span>';
                if ((hardWalls.includes(ratPosition) || hiddenTraps.includes(ratPosition)) && i === ratPosition) {
                     cell.innerHTML = '<span class="text-red-900">💥</span>';
                     cell.classList.add('bg-red-500/70', 'dark:bg-red-800/70');
                }
            }
            
            gridElement.appendChild(cell);
        }
    };

    const gameOver = (win) => {
        gameActive = false;
        resetButton.disabled = false; 
        playButton.disabled = false;
        
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
    
    // --- Movement Logic ---
    
    const tryMove = (newPosition) => {
        if (!gameActive) return;

        if (hardWalls.includes(newPosition)) { ratPosition = newPosition; gameOver(false); return; }
        ratPosition = newPosition;
        if (hiddenTraps.includes(newPosition)) { gameOver(false); return; }
        if (newPosition === GOAL_INDEX) { gameOver(true); return; }

        renderMaze();
    };

    const handleMovement = (event) => {
        if (!gameActive) return;
        
        const key = event.key.toLowerCase();
        let newPos = ratPosition;
        const currentRow = Math.floor(ratPosition / N);
        
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault(); 

        switch (key) {
            case 'arrowup': case 'w': if (currentRow > 0) newPos = ratPosition - N; else return; break;
            case 'arrowdown': case 's': if (currentRow < N - 1) newPos = ratPosition + N; else return; break;
            case 'arrowleft': case 'a': if (ratPosition % N !== 0) newPos = ratPosition - 1; else return; break;
            case 'arrowright': case 'd': if ((ratPosition + 1) % N !== 0) newPos = ratPosition + 1; else return; break;
            default: return;
        }
        
        if (newPos !== ratPosition) tryMove(newPos);
    };

    // --- Initialization & Start Game Functions ---

    const startNewMaze = () => {
        initializeMaze(); // Generates a completely new, solvable maze
        ratPosition = START_INDEX;
        gameActive = true;
        
        playButton.disabled = true;
        resetButton.disabled = false;
        
        statusDisplay.textContent = 'Use ARROW keys or WASD to find the cheese (🧀). Avoid hidden traps!';
        playButton.textContent = 'Game Active';
        resetButton.textContent = 'Reset Run';
        renderMaze();
    };

    const resetCurrentRun = () => {
        // This button now works whether the game is Active or Over
        if(gameActive) {
            // If active, just restart the current run
            ratPosition = START_INDEX;
            statusDisplay.textContent = 'Run Reset! Find the cheese (🧀). Avoid hidden traps!';
        } else {
            // If game is over, restart the current maze
            ratPosition = START_INDEX;
            gameActive = true;
            playButton.disabled = true;
            statusDisplay.textContent = 'Run Reset! Find the cheese (🧀). Avoid hidden traps!';
            playButton.textContent = 'Game Active';
        }
        
        renderMaze();
    };
    
    // --- Event Listeners Setup ---
    
    if (playButton) playButton.addEventListener('click', startNewMaze); 
    if (resetButton) resetButton.addEventListener('click', resetCurrentRun);
    
    document.addEventListener('keydown', handleMovement);

    // --- Touch/Swipe Listener (For mobile interaction) ---
    let touchStartX = 0;
    let touchStartY = 0;
    
    gridElement.addEventListener('touchstart', (e) => { if (gameActive) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; } }, false);
    gridElement.addEventListener('touchmove', (e) => { if (gameActive) e.preventDefault(); }, false);
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

    // Initial setup: Generates a new maze on page load
    initializeMaze();
    renderMaze();
    statusDisplay.textContent = 'Ready to play the Rat Maze? Click "Start New Maze"!';
});