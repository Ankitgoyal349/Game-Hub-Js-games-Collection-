document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('sudoku-grid');
    const statusDisplay = document.getElementById('sudoku-status');
    const loadButton = document.getElementById('load-sudoku');
    const checkButton = document.getElementById('check-sudoku');
    
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

    const isSafe = (board, row, col, num) => {
        // Check Row and Column
        for (let i = 0; i < 9; i++) {
            if ((i !== col && board[row * 9 + i] === num) || 
                (i !== row && board[i * 9 + col] === num)) {
                return false;
            }
        }

        // Check 3x3 Box
        let startRow = Math.floor(row / 3) * 3;
        let startCol = Math.floor(col / 3) * 3;

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if ((startRow + r !== row || startCol + c !== col) && 
                    board[(startRow + r) * 9 + (startCol + c)] === num) {
                    return false;
                }
            }
        }
        return true;
    };

    const renderGrid = (board, fixedState) => {
        if (!gridElement) return;
        gridElement.innerHTML = ''; 

        board.forEach((value, index) => {
            const cell = document.createElement('div');
            // Ensure cells are perfect squares and respect grid lines
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
                    // Only allow digits 1-9
                    let val = e.target.value.replace(/[^1-9]/g, ''); 
                    e.target.value = val;
                    currentBoard[index] = parseInt(val) || 0;
                });
                
                cell.appendChild(input);
            }
            gridElement.appendChild(cell);
        });
    };

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
            
            // Check current number against puzzle rules
            if (!isSafe(currentBoard, row, col, num)) {
                return 'Invalid';
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

    const handleCheckSolution = () => {
        if (!currentBoard.some(val => val !== 0) || currentBoard.every((val, i) => val === 0 && !fixedCells[i])) {
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

    renderGrid(currentBoard, fixedCells);
});
