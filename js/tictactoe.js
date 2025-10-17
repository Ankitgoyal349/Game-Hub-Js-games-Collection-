document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('tictactoe-board');
    const statusDisplay = document.getElementById('tictactoe-status');
    const restartButton = document.getElementById('restart-tictactoe');

    let gameActive = true;
    let currentPlayer = 'X';
    let gameState = [];
    let cells = [];

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    const handleCellPlayed = (clickedCell, clickedCellIndex) => {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.innerHTML = currentPlayer;
        clickedCell.classList.add(currentPlayer === 'X' ? 'text-red-500' : 'text-blue-500');
        clickedCell.classList.remove(currentPlayer === 'X' ? 'text-blue-500' : 'text-red-500');
    };

    const handlePlayerChange = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.innerHTML = `Status: It's **${currentPlayer}'s** turn.`;
    };

    const handleResultValidation = () => {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];

            if (a === '' || b === '' || c === '') continue;
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.innerHTML = `Player **${currentPlayer}** Wins! 🎉`;
            window.showMessage('Game Over!', `Player ${currentPlayer} has won the match!`);
            gameActive = false;
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusDisplay.innerHTML = 'Game ended in a **Draw**. 🤝';
            window.showMessage('Game Over!', 'The match ended in a draw.');
            gameActive = false;
            return;
        }

        handlePlayerChange();
    };

    const handleCellClick = (event) => {
        const clickedCell = event.target;
        const clickedCellIndex = cells.indexOf(clickedCell);

        if (gameState[clickedCellIndex] !== "" || !gameActive) return;

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
    };

    const handleRestartGame = () => {
        gameActive = true;
        currentPlayer = 'X';
        gameState = Array(9).fill("");
        statusDisplay.innerHTML = "Status: It's **X's** turn.";
        cells.forEach(cell => {
            cell.innerHTML = "";
            cell.classList.remove('text-red-500', 'text-blue-500');
        });
    };

    const initializeBoard = () => {
        if (board) {
            board.innerHTML = '';
            // Dynamically create the 9 cells
            for(let i = 0; i < 9; i++) {
                const cell = document.createElement('div');
                cell.classList.add('tictactoe-cell');
                board.appendChild(cell);
            }
        }
        cells = board ? Array.from(board.children) : [];
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        handleRestartGame();
    };

    if (restartButton) restartButton.addEventListener('click', initializeBoard);
    initializeBoard();
});
