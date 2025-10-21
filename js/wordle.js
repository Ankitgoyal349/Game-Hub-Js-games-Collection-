document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const gridElement = document.getElementById('wordle-grid');
    const inputElement = document.getElementById('wordle-input');
    const submitButton = document.getElementById('submit-wordle');
    const restartButton = document.getElementById('restart-wordle');
    const hintButton = document.getElementById('get-hint'); 
    const hintDisplay = document.getElementById('hint-display');

    // --- Core Game State ---
    let targetWord = '';
    let currentGuess = 0;
    let gameActive = false;
    let submittedGuesses = []; // Stores past guesses and results
    
    // NEW: Variable to hold the single, initial hint letter and its position
    let initialHint = { letter: '', index: -1 }; 
    
    // Hardcoded word list 
    const WORD_LIST = ["HELLO", "WORLD", "APPLE", "GRAPE", "CRANE", "TRAIN", "HOUSE", "PLANE", "WATER"];
    const MAX_GUESSES = 6;
    const WORD_LENGTH = 5;

    // --- Helper to Create a Grid Cell ---
    const createCell = (content = '', state = 'empty') => {
        const cell = document.createElement('div');
        cell.classList.add(
            'w-10', 'h-10', 'md:w-12', 'md:h-12', 'border-2', 'font-bold', 'text-2xl', 
            'flex', 'items-center', 'justify-center', 'rounded-md', 'transition-colors', 'duration-300'
        );
        cell.textContent = content;

        // Apply basic styling for initial empty/hinted state
        if (state === 'hint') {
            cell.classList.add('border-blue-400', 'bg-blue-200/50', 'text-gray-800', 'dark:text-gray-100');
        } else {
            cell.classList.add('border-gray-300', 'dark:border-gray-600', 'bg-transparent', 'text-gray-800', 'dark:text-gray-200');
        }
        return cell;
    };

    // --- RENDER FUNCTION (Draws the 6x5 grid and applies hint) ---
    const renderGrid = () => {
        if (!gridElement) return;
        gridElement.innerHTML = ''; 

        // Draw the current guess rows (simplified)
        for(let r = 0; r < MAX_GUESSES; r++) {
            const row = document.createElement('div');
            row.classList.add('flex', 'space-x-1');
            
            for(let c = 0; c < WORD_LENGTH; c++) {
                let cell;
                
                // If this is the current, empty guess row
                if (r === currentGuess) {
                    cell = createCell('', 'empty');
                } 
                // If this is a past, submitted guess (simplified)
                else if (r < currentGuess) {
                    cell = createCell(submittedGuesses[r][c], 'guessed');
                    // In a real game, you would apply GREEN/YELLOW/GRAY classes here
                }
                // If this is a future row
                else {
                    cell = createCell('', 'empty');
                }
                
                // CHECK FOR INITIAL HINT (Must apply to the first row only, before the user types)
                if (r === 0 && initialHint.index === c) {
                    cell = createCell(initialHint.letter, 'hint');
                }

                row.appendChild(cell);
            }
            gridElement.appendChild(row);
        }

        // Re-enabling buttons based on game state
        submitButton.disabled = !gameActive || currentGuess >= MAX_GUESSES;
    };


    // --- HINT Logic ---
    
    const setInitialHint = () => {
        // Only run if the game hasn't started and a word is set
        if (!targetWord) return;

        const allLetters = targetWord.split('');
        const hintIndex = Math.floor(Math.random() * WORD_LENGTH);
        const hintLetter = allLetters[hintIndex];

        // Store the hint information
        initialHint = { letter: hintLetter, index: hintIndex };
        
        hintDisplay.textContent = `FREE HINT: The letter "${hintLetter}" is at position ${hintIndex + 1}.`;
        hintButton.textContent = `Hint Used: ${hintLetter}`;
        
        // This hint is used, so disable the button for future clicks
        hintButton.disabled = true; 
    };
    
    // --- Game Setup ---
    
    const setupGame = () => {
        // 1. Reset Game State
        targetWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        currentGuess = 0;
        gameActive = true;
        submittedGuesses = [];
        initialHint = { letter: '', index: -1 }; // Reset hint

        // 2. Reset UI
        inputElement.value = '';
        inputElement.disabled = false;
        submitButton.disabled = false;
        hintButton.disabled = true; // Start disabled, but we auto-set the hint
        hintButton.textContent = 'Hint Used (Auto-Revealed)';
        
        // 3. AUTO-REVEAL HINT
        setInitialHint();

        // 4. Render the initial grid with the hint visible
        renderGrid();
    };

    // --- Guess Logic (Simplified) ---
    
    const handleSubmitGuess = () => {
        if (!gameActive) return;
        
        const guess = inputElement.value.toUpperCase();
        if (guess.length !== WORD_LENGTH) {
            window.showMessage('Invalid', 'Guess must be 5 letters long.');
            return;
        }
        
        submittedGuesses.push(guess.split(''));
        
        // Check Win/Loss conditions
        if (guess === targetWord) {
            gameActive = false;
            window.showMessage('WINNER!', `You found the word: ${targetWord}!`);
        } else if (currentGuess >= MAX_GUESSES - 1) { // Allows 6 total tries (0 to 5)
            gameActive = false;
            window.showMessage('Game Over', `The word was: ${targetWord}.`);
        }
        
        currentGuess++;
        inputElement.value = '';
        renderGrid(); 
        
        if (!gameActive) {
            inputElement.disabled = true;
            submitButton.disabled = true;
        }
    };
    
    const handleRestart = () => {
        setupGame();
        // window.showMessage('Game Reset', 'A new Wordle game has begun!');
    };

    // --- Initialization & Event Listeners ---
    
    if (submitButton) submitButton.addEventListener('click', handleSubmitGuess);
    if (restartButton) restartButton.addEventListener('click', handleRestart);
    // Since the hint is now automatic, the button listener is no longer strictly needed, 
    // but we can keep it disabled for clarity.
    // if (hintButton) hintButton.addEventListener('click', handleGetHint); 

    setupGame(); // Start the first game
});