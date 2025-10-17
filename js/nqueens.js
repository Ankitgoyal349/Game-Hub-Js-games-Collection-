document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('nqueens-board');
    const statusDisplay = document.getElementById('nqueens-status');
    const solveButton = document.getElementById('solve-nqueens');
    
    let N = 4; 
    let board = []; 
    let queenCount = 0;

    // Checks if the queen at [r][c] conflicts with ANY other queen on the board
    const checkConflicts = (r, c) => {
        for (let row = 0; row < N; row++) {
            for (let col = 0; col < N; col++) {
                // Check against other Queens
                if (board[row][col] === 1 && (row !== r || col !== c)) {
                    // Horizontal, Vertical, and Diagonals check
                    if (row === r || col === c || Math.abs(row - r) === Math.abs(col - c)) {
                        return true; 
                    }
                }
            }
        }
        return false;
    };

    const renderBoard = () => {
        if (!boardElement) return;

        // Dynamic grid classes based on N (N=4 or N=8)
        boardElement.className = `grid grid-cols-${N} grid-rows-${N} w-64 h-64 max-w-full shadow-2xl border-4 border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden`;
        boardElement.innerHTML = '';
        
        let allSafe = true;

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const cell = document.createElement('div');
                const isDark = (r + c) % 2 === 1;
                const isQueen = board[r][c] === 1;
                
                cell.className = `flex items-center justify-center cursor-pointer text-4xl p-1 transition-colors duration-200 
                                  ${isDark ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`;
                
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                if (isQueen) {
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
            // Place Queen
            board[row][col] = 1;
            queenCount++;
        }
        renderBoard();
    };

    const updateStatus = (isSafeConfiguration) => {
        if (queenCount === N && isSafeConfiguration) {
            statusDisplay.innerHTML = `**SOLVED!** (${N} Queens placed safely) 🎉`;
            window.showMessage('N-Queens Solved!', `You found a safe placement of ${N} Queens!`);
        } else if (queenCount > N) {
            statusDisplay.innerHTML = `Too many Queens placed. **Remove some!**`;
        } else if (!isSafeConfiguration && queenCount > 0) {
             statusDisplay.innerHTML = `**${queenCount} Queens placed.** Conflict detected (red).`;
        } else {
            statusDisplay.innerHTML = `Place **${N} Queens** safely. (${queenCount}/${N} placed)`;
        }
    };
    
    const handleReset = (newN = N) => {
        if (newN !== 4 && newN !== 8) newN = 4;
        
        N = newN;
        board = Array.from({ length: N }, () => Array(N).fill(0));
        queenCount = 0;
        solveButton.textContent = `Reset / Change to N=${N === 4 ? 8 : 4}`;
        renderBoard();
    };
    
    const handleResetOrToggleSize = () => {
        const nextN = N === 4 ? 8 : 4;
        
        // If board is not empty, reset it. Otherwise, toggle N size.
        if (queenCount > 0) {
            handleReset();
        } else {
            handleReset(nextN);
        }
    };

    if (solveButton) solveButton.addEventListener('click', handleResetOrToggleSize);
    handleReset(4);
});
