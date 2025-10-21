document.addEventListener('DOMContentLoaded', () => {
    const diceContainer = document.getElementById('dice-container');
    const rollButton = document.getElementById('roll-dice');
    const diceCountInput = document.getElementById('dice-count');
    const diceTotalDisplay = document.getElementById('dice-total');

    // Unicode symbols for 1 to 6
    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']; 
    const ANIMATION_DURATION = 500; // Match Tailwind config

    const rollDice = () => {
        const numDice = parseInt(diceCountInput.value) || 1;
        let totalSum = 0;
        
        // 1. Clear previous results and prepare container
        diceContainer.innerHTML = '';

        // 2. Roll each die
        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * 6);
            const resultFace = diceFaces[roll];
            const resultNumber = roll + 1;
            totalSum += resultNumber;

            const dieElement = document.createElement('span');
            dieElement.classList.add(
                'text-[60px]', 
                'font-extrabold', 
                'text-yellow-500', 
                'dark:text-yellow-400', 
                'animate-spin-once',
                'mx-1' // Added margin for spacing
            );
            
            // Initial state (e.g., a question mark or a random face before animation stops)
            dieElement.innerHTML = '⚅'; 

            diceContainer.appendChild(dieElement);

            // Set the final result and animation after duration
            setTimeout(() => {
                dieElement.classList.remove('animate-spin-once');
                dieElement.innerHTML = resultFace;
                
                // Visual pulse effect after the roll stops
                dieElement.classList.add('scale-110', 'transition-all', 'duration-150');
                setTimeout(() => {
                    dieElement.classList.remove('scale-110');
                }, 150);
            }, ANIMATION_DURATION);
        }
        
        // 3. Update the total sum (update after animation finishes for realism)
        setTimeout(() => {
            diceTotalDisplay.textContent = `Total: ${totalSum}`;
        }, ANIMATION_DURATION);
    };

    // Ensure input constraints are followed
    if (diceCountInput) {
        diceCountInput.addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) {
                e.target.value = 1;
            } else if (val > 5) {
                e.target.value = 5;
            }
        });
    }

    if (rollButton) rollButton.addEventListener('click', rollDice);

    // Initial state
    diceContainer.innerHTML = '<span class="text-[60px] font-extrabold text-yellow-500 dark:text-yellow-400">?</span>';
    diceTotalDisplay.textContent = 'Total: 0';
});