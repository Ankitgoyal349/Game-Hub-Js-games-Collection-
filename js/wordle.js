document.addEventListener('DOMContentLoaded', () => {
    const wordleInput = document.getElementById('wordle-input');
    const submitButton = document.getElementById('submit-wordle');
    const restartButton = document.getElementById('restart-wordle');
    const gridElement = document.getElementById('wordle-grid');

    const availableWords = ['APPLE', 'BRAIN', 'CODES', 'FLASK', 'JAVAS', 'REACT', 'STYLE', 'QUERY', 'PIXEL', 'ABOUT', 'ADMIT'];
    let targetWord = '';
    let currentGuess = 0;
    let gameStatus = 'playing';

    const getTargetWord = () => {
        const index = Math.floor(Math.random() * availableWords.length);
        return availableWords[index];
    };

    const createGrid = () => {
        if (!gridElement) return;

        gridElement.innerHTML = '';
        for (let r = 0; r < 6; r++) { 
            const row = document.createElement('div');
            row.classList.add('flex', 'space-x-1');
            for (let c = 0; c < 5; c++) { 
                const cell = document.createElement('div');
                cell.classList.add('w-10', 'h-10', 'md:w-12', 'md:h-12', 'border-2', 'border-gray-300', 'dark:border-gray-600', 'bg-transparent', 'text-gray-800', 'dark:text-gray-200', 'font-bold', 'text-2xl', 'flex', 'items-center', 'justify-center', 'rounded-md', 'transition-all', 'duration-300');
                row.appendChild(cell);
            }
            gridElement.appendChild(row);
        }
    };

    const evaluateGuess = (guess, row) => {
        const cells = Array.from(gridElement.children[row].children);
        const target = targetWord.split('');
        const guessLetters = guess.split('');
        let correctLetters = new Array(5).fill(null);
        let targetCounts = {};

        target.forEach(letter => {
            targetCounts[letter] = (targetCounts[letter] || 0) + 1;
        });

        // 1. First pass: Mark correct (Green)
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === target[i]) {
                correctLetters[i] = 'green';
                targetCounts[guessLetters[i]]--;
            }
        }

        // 2. Second pass: Mark present (Yellow)
        for (let i = 0; i < 5; i++) {
            if (correctLetters[i] === null) {
                if (targetCounts[guessLetters[i]] > 0) {
                    correctLetters[i] = 'yellow';
                    targetCounts[guessLetters[i]]--;
                } else {
                    correctLetters[i] = 'gray';
                }
            }
        }

        // Apply animation and colors
        cells.forEach((cell, i) => {
            cell.textContent = guessLetters[i];
            
            setTimeout(() => {
                cell.classList.remove('border-gray-300', 'dark:border-gray-600', 'bg-transparent', 'text-gray-800', 'dark:text-gray-200');
                cell.classList.add('animate-flip', 'text-white');
                
                cell.addEventListener('animationend', () => {
                    cell.classList.remove('animate-flip');
                    if (correctLetters[i] === 'green') {
                        cell.classList.add('bg-green-500');
                    } else if (correctLetters[i] === 'yellow') {
                        cell.classList.add('bg-yellow-500');
                    } else {
                        cell.classList.add('bg-gray-500');
                    }
                }, { once: true });
                
            }, i * 300);
        });
        
        return guess === targetWord;
    };

    const handleGuess = () => {
        if (gameStatus !== 'playing') return;

        const guess = wordleInput.value.toUpperCase().trim();
        if (guess.length !== 5) {
            window.showMessage('Invalid Guess', 'Your guess must be exactly 5 letters long.');
            return;
        }
        
        const isCorrect = evaluateGuess(guess, currentGuess);
        wordleInput.value = '';

        if (isCorrect) {
            setTimeout(() => {
                gameStatus = 'won';
                wordleInput.disabled = true;
                submitButton.disabled = true;
                window.showMessage('You Won! 🎉', `Congratulations, you guessed the word **${targetWord}**!`);
            }, 5 * 300 + 500); 
        } else {
            currentGuess++;
            if (currentGuess >= 6) {
                setTimeout(() => {
                    gameStatus = 'lost';
                    wordleInput.disabled = true;
                    submitButton.disabled = true;
                    window.showMessage('Game Over', `You ran out of guesses. The word was **${targetWord}**.`);
                }, 5 * 300 + 500);
            }
        }
    };
    
    const handleRestart = () => {
        targetWord = getTargetWord();
        currentGuess = 0;
        gameStatus = 'playing';
        wordleInput.value = '';
        wordleInput.disabled = false;
        submitButton.disabled = false;
        createGrid();
    };

    if (submitButton) submitButton.addEventListener('click', handleGuess);
    if (restartButton) restartButton.addEventListener('click', handleRestart);
    
    if (wordleInput) {
        wordleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleGuess();
        });
    }

    handleRestart();
});
