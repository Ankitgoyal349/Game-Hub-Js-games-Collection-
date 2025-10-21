document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('sudoku-grid');
    const statusDisplay = document.getElementById('sudoku-status');
    const loadButton = document.getElementById('load-sudoku');
    const checkButton = document.getElementById('check-sudoku');
    // NEW: Reference to the 'Give Solution' button
    const solvePuzzleButton = document.getElementById('solve-puzzle'); 
    
    const PUZZLE_EASY = [
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
    const EMPTY_PUZZLE = Array(81).fill(0);
    
    let currentBoard = [...EMPTY_PUZZLE]; 
    let fixedCells = Array(81).fill(false); 

    // Utility to find the first empty cell (value 0)
    const findEmpty = (board) => {
        for (let i = 0; i < 81; i++) {
            if (board[i] === 0) {
                return i;
            }
        }
        return -1;
    };

    // Checks if placing 'num' at (row, col) is safe according to Sudoku rules.
    const isSafe = (board, row, col, num) => {
        // Check Row and Column
        for (let i = 0; i < 9; i++) {
            if (board[row * 9 + i] === num || board[i * 9 + col] === num) {
                return false;
            }
        }

        // Check 3x3 Box
        let startRow = Math.floor(row / 3) * 3;
        let startCol = Math.floor(col / 3) * 3;

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[(startRow + r) * 9 + (startCol + c)] === num) {
                    return false;
                }
            }
        }
        return true;
    };
    
    // BACKTRACKING SOLVER: Recursively finds a solution.
    const solveSudoku = (board) => {
        const emptyIndex = findEmpty(board);

        // Base case: If no empty spot is found, the puzzle is solved.
        if (emptyIndex === -1) {
            return true;
        }

        const row = Math.floor(emptyIndex / 9);
        const col = emptyIndex % 9;

        for (let num = 1; num <= 9; num++) {
            if (isSafe(board, row, col, num)) {
                
                // 1. Place the number (Hypothesis)
                board[emptyIndex] = num;

                // 2. Recurse
                if (solveSudoku(board)) {
                    return true;
                }

                // 3. Backtrack (If the hypothesis failed, reset the cell)
                board[emptyIndex] = 0;
            }
        }

        // Return false if no number from 1-9 works for the current empty cell
        return false;
    };

    const renderGrid = (board, fixedState) => {
        if (!gridElement) return;
        gridElement.innerHTML = ''; 

        board.forEach((value, index) => {
            const cell = document.createElement('div');
            cell.classList.add('sudoku-cell', 'w-full', 'h-full', 'aspect-square', 'p-0');
            cell.dataset.index = index;

            const isFixed = fixedState[index];
            const displayValue = value !== 0 ? value : '';

            if (isFixed) {
                cell.textContent = displayValue;
                cell.classList.add('text-red-500', 'cursor-default');
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.pattern = '[1-9]';
                input.value = displayValue;
                
                input.classList.add('w-full', 'h-full', 'bg-transparent', 'text-center', 
                                     'font-bold', 'text-gray-800', 'dark:text-gray-100', 
                                     'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-300', 'rounded-lg');
                
                input.addEventListener('input', (e) => {
                    let val = e.target.value.replace(/[^1-9]/g, ''); 
                    e.target.value = val;
                    currentBoard[index] = parseInt(val) || 0;
                });
                
                cell.appendChild(input);
            }
            gridElement.appendChild(cell);
        });
    };

    // Checks the player's board for completeness and conflicts.
    const checkSolution = () => {
        let isComplete = true;
        
        for (let i = 0; i < 81; i++) {
            const num = currentBoard[i];
            const row = Math.floor(i / 9);
            const col = i % 9;

            if (num === 0) {
                isComplete = false;
                continue;
            }
            
            // Check current number against all other existing numbers for conflicts
            
            // Row and Column check:
            for (let j = 0; j < 9; j++) {
                if (j !== col && currentBoard[row * 9 + j] === num) return 'Invalid'; // Conflict in row
                if (j !== row && currentBoard[j * 9 + col] === num) return 'Invalid'; // Conflict in column
            }

            // 3x3 Box check:
            let startRow = Math.floor(row / 3) * 3;
            let startCol = Math.floor(col / 3) * 3;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const checkIndex = (startRow + r) * 9 + (startCol + c);
                    if (checkIndex !== i && currentBoard[checkIndex] === num) {
                        return 'Invalid'; // Conflict in box
                    }
                }
            }
        }
        return isComplete ? 'Solved' : 'Incomplete';
    };

    const handleLoadPuzzle = () => {
        currentBoard = [...PUZZLE_EASY]; 
        fixedCells = PUZZLE_EASY.map(val => val !== 0);
        renderGrid(currentBoard, fixedCells);
        statusDisplay.textContent = 'Puzzle loaded. Fill in the blanks!';
    };
    
    // NEW HANDLER: Solves the puzzle automatically and displays the result.
    const handleSolvePuzzle = () => {
        // Create a copy of the initial puzzle (fixed cells only) for a clean solve attempt
        let boardToSolve = [...PUZZLE_EASY]; 
        
        if (solveSudoku(boardToSolve)) {
            // Success: Update the current board with the solution
            currentBoard = boardToSolve;
            renderGrid(currentBoard, fixedCells);
            statusDisplay.textContent = 'Solution found! Reset the puzzle to try again. 💡';
            window.showMessage('Solution Found', 'The complete, correct solution has been displayed. Good luck on your next try!');
        } else {
            statusDisplay.textContent = 'Error: The initial puzzle is unsolvable. 🤯';
            window.showMessage('Error', 'The loaded puzzle is invalid or has no solution.');
        }
    };

    const handleCheckSolution = () => {
        if (!currentBoard.some(val => val !== 0) || !fixedCells.some(val => val)) {
             window.showMessage('Error', 'Please load a puzzle and enter some numbers first.');
             return;
        }
        
        const result = checkSolution();
        
        if (result === 'Solved') {
            statusDisplay.textContent = 'Congratulations! You solved it! 🎉';
            window.showMessage('Solved!', 'Your solution is correct!');
        } else if (result === 'Invalid') {
            statusDisplay.textContent = 'Incorrect! There are conflicts. ❌';
            window.showMessage('Error', 'Your current solution has conflicts. Check your numbers!');
        } else {
            statusDisplay.textContent = 'Keep going! Puzzle is incomplete.';
            window.showMessage('Incomplete', 'You still have empty spots to fill.');
        }
    };

    if (loadButton) loadButton.addEventListener('click', handleLoadPuzzle);
    if (checkButton) checkButton.addEventListener('click', handleCheckSolution);
    // NEW: Attach event listener to the Solve button
    if (solvePuzzleButton) solvePuzzleButton.addEventListener('click', handleSolvePuzzle);

    // Initial render
    renderGrid(currentBoard, fixedCells);
});