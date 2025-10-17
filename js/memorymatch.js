document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('memory-board');
    const statusDisplay = document.getElementById('memory-status');
    const restartButton = document.getElementById('restart-memory');
    
    const icons = ['🍎', '🍌', '🥝', '🍇', '🍉', '🍓']; 
    let gameBoard = []; 
    let flippedCards = []; 
    let matchedCards = 0;
    let moves = 0;
    let awaitingEndOfMove = false;

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const initializeGame = () => {
        gameBoard = shuffle([...icons, ...icons]); 
        flippedCards = [];
        matchedCards = 0;
        moves = 0;
        awaitingEndOfMove = false;
        statusDisplay.textContent = 'Moves: 0';
        renderBoard();
    };

    const renderBoard = () => {
        if (!boardElement) return;

        boardElement.innerHTML = '';
        gameBoard.forEach((icon, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.icon = icon;
            card.dataset.index = index;

            card.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-face memory-card-back">?</div>
                    <div class="memory-card-face memory-card-front">${icon}</div>
                </div>
            `;
            
            card.addEventListener('click', handleCardClick);
            boardElement.appendChild(card);
        });
    };

    const handleCardClick = (event) => {
        const cardElement = event.currentTarget;

        if (awaitingEndOfMove || cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) return;

        cardElement.classList.add('flipped');
        
        const index = parseInt(cardElement.dataset.index);
        const icon = cardElement.dataset.icon;
        
        flippedCards.push({ element: cardElement, icon, index });

        if (flippedCards.length === 2) {
            moves++;
            statusDisplay.textContent = `Moves: ${moves}`;
            awaitingEndOfMove = true;
            const [card1, card2] = flippedCards;

            if (card1.icon === card2.icon) {
                // Match!
                card1.element.classList.add('matched');
                card2.element.classList.add('matched');
                matchedCards += 2;
                awaitingEndOfMove = false;
                flippedCards = [];

                if (matchedCards === gameBoard.length) {
                    statusDisplay.textContent = `Completed in ${moves} moves! 🎉`;
                    window.showMessage('Game Won!', `You solved the memory puzzle in ${moves} moves!`);
                }
            } else {
                // No match, flip them back after a delay
                setTimeout(() => {
                    card1.element.classList.remove('flipped');
                    card2.element.classList.remove('flipped');
                    flippedCards = [];
                    awaitingEndOfMove = false;
                }, 1000);
            }
        }
    };

    if (restartButton) restartButton.addEventListener('click', initializeGame);
    initializeGame();
});
