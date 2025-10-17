document.addEventListener('DOMContentLoaded', () => {
    const diceResult = document.getElementById('dice-result');
    const rollButton = document.getElementById('roll-dice');

    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']; 

    const rollDice = () => {
        if (!diceResult) return;

        diceResult.style.transform = ''; 
        diceResult.classList.add('animate-spin-once');

        const roll = Math.floor(Math.random() * 6);
        const resultFace = diceFaces[roll];
        const resultNumber = roll + 1;

        // The animation length is 0.5s (from Tailwind config)
        setTimeout(() => {
            diceResult.classList.remove('animate-spin-once');
            diceResult.innerHTML = resultFace;
            
            // Visual pulse effect after the roll stops
            diceResult.classList.add('scale-110', 'duration-150');
            setTimeout(() => {
                diceResult.classList.remove('scale-110');
            }, 150);
        }, 500); 
    };

    if (rollButton) rollButton.addEventListener('click', rollDice);
});
