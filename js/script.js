document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('nqueens-board');
    const statusDisplay = document.getElementById('nqueens-status');
    const solveButton = document.getElementById('solve-nqueens'); // Now acts as a reset/check button
    
    // Default N=4 for visualization, but game logic supports any N
    let N = 4; 
    let board = Array.from({ length: N }, () => Array(N).fill(0)); // 0: empty, 1: Queen
    let queenCount = 0;

    const isSafe = (testBoard, row, col) => {
        let i, j;

        // Check this row on left side (no need to check right)
        for (i = 0; i < col; i++) {
            if (testBoard[row][i] === 1) return false;
        }

        // Check upper diagonal on left side
        for (i = row, j = col; i >= 0 && j >= 0; i--, j--) {
            if (testBoard[i][j] === 1) return false;
        }

        // Check lower diagonal on left side
        for (i = row, j = col; j >= 0 && i < N; i++, j--) {
            if (testBoard[i][j] === 1) return false;
        }

        // The column check is implicit as we only place one queen per column/row in this user-driven mode.
        return true;
    };
    
    // Check if a queen at [r][c] conflicts with ANY other queen on the board
    const checkConflicts = (r, c) => {
        // Temporarily remove the queen we are checking to avoid self-conflict error
        let tempBoard = JSON.parse(JSON.stringify(board));
        tempBoard[r][c] = 0; 

        for (let row = 0; row < N; row++) {
            for (let col = 0; col < N; col++) {
                if (tempBoard[row][col] === 1) {
                    if (row === r || col === c || Math.abs(row - r) === Math.abs(col - c)) {
                        return true; // Conflict found
                    }
                }
            }
        }
        return false;
    };


    const renderBoard = () => {
        if (!boardElement) return;

        // Ensure grid size matches N
        boardElement.className = `grid grid-cols-${N} grid-rows-${N} w-64 h-64 max-w-full shadow-2xl border-4 border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden`;
        boardElement.innerHTML = '';
        
        let allSafe = true;

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const cell = document.createElement('div');
                const isDark = (r + c) % 2 === 1;
                const isQueen = board[r][c] === 1;
                
                cell.className = `flex items-center justify-center cursor-pointer p-1 transition-colors duration-200 
                                  ${isDark ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`;
                
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                if (isQueen) {
                    // Check for conflicts with other queens
                    const hasConflict = checkConflicts(r, c);
                    if (hasConflict) {
                        cell.innerHTML = '<span class="text-4xl text-red-500">♛</span>'; // Red for conflict
                        allSafe = false;
                    } else {
                        cell.innerHTML = '<span class="text-4xl text-cyan-500">♛</span>'; // Safe Queen
                    }
                }

                cell.addEventListener('click', handleCellClick);
                boardElement.appendChild(cell);
            }
        }
        
        updateStatus(allSafe);
    };
    
    const handleCellClick = (event) => {
        const row = parseInt(event.currentTarget.dataset.row);
        const col = parseInt(event.currentTarget.dataset.col);

        if (board[row][col] === 1) {
            // Remove Queen
            board[row][col] = 0;
            queenCount--;
        } else {
            // Place Queen (always allowed, safety check is visual feedback)
            board[row][col] = 1;
            queenCount++;
        }
        renderBoard();
    };

    const updateStatus = (isSafeConfiguration) => {
        if (queenCount === N && isSafeConfiguration) {
            statusDisplay.innerHTML = `**N-Queens Solved!** (${N} Queens placed safely) 🎉`;
            window.showMessage('Victory!', `You found a safe placement of ${N} Queens!`);
        } else if (queenCount === N && !isSafeConfiguration) {
             statusDisplay.innerHTML = `**${N} Queens placed**, but there is a **conflict** (red).`;
        } else if (queenCount < N && isSafeConfiguration) {
            statusDisplay.innerHTML = `**${queenCount}** Queens placed. Still **safe**. Keep going!`;
        } else if (queenCount < N && !isSafeConfiguration) {
             statusDisplay.innerHTML = `**${queenCount} Queens** placed, but there is a **conflict** (red).`;
        } else {
            statusDisplay.innerHTML = `Place ${N} Queens on the board without conflicts.`;
        }
    };
    
    const handleReset = () => {
        board = Array.from({ length: N }, () => Array(N).fill(0));
        queenCount = 0;
        renderBoard();
    };
    
    const handleToggleSize = () => {
        N = N === 4 ? 8 : 4;
        solveButton.textContent = `Reset/Change to N=${N === 4 ? 8 : 4}`;
        handleReset();
    };

    if (solveButton) {
        solveButton.addEventListener('click', handleToggleSize);
        solveButton.textContent = `Reset/Change to N=${N === 4 ? 8 : 4}`;
    }

    renderBoard();
});

document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('sudoku-grid');
    const statusDisplay = document.getElementById('sudoku-status');
    const loadButton = document.getElementById('load-sudoku');
    const solveButton = document.getElementById('solve-sudoku'); // Button now checks solution or solves it.

    // Example puzzle (0 represents an empty cell)
    const initialPuzzle = [
        5, 3, 0, 0, 7, 0, 0, 0, 0,
        6, 0, 0, 1, 9, 5, 0, 0, 0,
        0, 9, 8, 0, 0, 0, 0, 6, 0,
        8, 0, 0, 0, 6, 0, 0, 0, 3,
        4, 0, 0, 8, 0, 3, 0, 0, 1,
        7, 0, 0, 0, 2, 0, 0, 0, 6,
        0, 6, 0, 0, 0, 0, 2, 8, 0,
        0, 0, 0, 4, 1, 9, 0, 0, 5,
        0, 0, 0, 0, 8, 0, 0, 7, 9
    ];
    let currentBoard = [...initialPuzzle]; // The user's current board state
    let fixedCells = Array(81).fill(false); // To track which cells are part of the original puzzle

    const renderGrid = (board, fixedState) => {
        if (!gridElement) return;

        gridElement.innerHTML = ''; // Clear existing cells

        board.forEach((value, index) => {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell w-full h-full aspect-square transition-colors duration-200 p-0';
            cell.dataset.index = index;

            // Check if this cell is fixed (part of the original puzzle)
            const isFixed = fixedState[index];

            if (isFixed) {
                // Fixed cells use div content
                cell.textContent = value;
                cell.classList.add('text-red-500', 'cursor-default');
            } else {
                // User-editable cells use input field
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.pattern = '[1-9]';
                input.value = value !== 0 ? value : '';
                input.classList.add('w-full', 'h-full', 'bg-transparent', 'text-center', 'font-bold', 'text-gray-800', 'dark:text-gray-100', 'focus:outline-none');
                
                input.style.fontSize = '1rem'; // Custom size to override cell style
                input.style.fontWeight = 'bold';

                // Input event listener to update the currentBoard array
                input.addEventListener('input', (e) => {
                    const num = parseInt(e.target.value) || 0;
                    currentBoard[index] = num;
                    // Automatically check the solution after every input (optional)
                    // handleCheckSolution(); 
                });
                
                cell.appendChild(input);
            }
            gridElement.appendChild(cell);
        });
    };

    const isSafe = (board, row, col, num) => {
        for (let x = 0; x < 9; x++) {
            // Check row and column
            if (board[row * 9 + x] === num || board[x * 9 + col] === num) return false;
        }

        // Check 3x3 box
        let startRow = row - row % 3;
        let startCol = col - col % 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[(startRow + i) * 9 + (startCol + j)] === num) return false;
            }
        }
        return true;
    };
    
    // Simplified checker that only ensures all cells are non-zero and safe
    const isSolved = (board) => {
        for (let i = 0; i < 81; i++) {
            const num = board[i];
            if (num === 0) return 'Incomplete'; // Puzzle is not finished

            // Temporarily remove number to check against others
            board[i] = 0;
            const row = Math.floor(i / 9);
            const col = i % 9;
            
            if (!isSafe(board, row, col, num)) {
                board[i] = num; // Put it back
                return 'Invalid'; // Puzzle is invalid
            }
            board[i] = num; // Put it back
        }
        return 'Solved';
    };

    const handleLoadPuzzle = () => {
        currentBoard = [...initialPuzzle]; 
        fixedCells = initialPuzzle.map(val => val !== 0);
        renderGrid(currentBoard, fixedCells);
        solveButton.textContent = 'Check My Solution';
        statusDisplay.textContent = 'Puzzle loaded. Fill in the blanks!';
    };

    const handleCheckSolution = () => {
        const result = isSolved(currentBoard);
        
        if (result === 'Solved') {
            statusDisplay.textContent = 'Congratulations! You solved it! 🎉';
            window.showMessage('Solved!', 'Your solution is correct!');
        } else if (result === 'Invalid') {
            statusDisplay.textContent = 'Incorrect! Check your numbers. ❌';
            window.showMessage('Error', 'Your current solution has conflicts. Keep trying!');
        } else {
            statusDisplay.textContent = 'Keep going! Puzzle is incomplete.';
            window.showMessage('Incomplete', 'You still have empty spots to fill.');
        }
    };
    
    if (loadButton) loadButton.addEventListener('click', handleLoadPuzzle);
    if (solveButton) solveButton.addEventListener('click', handleCheckSolution);

    // Initial setup
    renderGrid(currentBoard, fixedCells);
});