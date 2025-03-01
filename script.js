document.addEventListener('DOMContentLoaded', () => {
    const wordInput = document.getElementById('word-input');
    const lettersContainer = document.getElementById('letters-container');
    const circularBtn = document.getElementById('circular-btn');
    const linearBtn = document.getElementById('linear-btn');
    
    // Current layout (default: circular)
    let currentLayout = 'circular';
    
    // Function to shuffle an array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Debounce function to limit how often a function can be called
    function debounce(func, delay) {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    // Debounced version of createLetterBoxes
    const debouncedCreateLetterBoxes = debounce(() => {
        createLetterBoxes();
    }, 500);

    // Check if there's a saved word in localStorage and load it
    const savedWord = localStorage.getItem('savedWord');
    if (savedWord) {
        wordInput.value = savedWord;
        createLetterBoxes();
    }
    
    // Handle input with debounce
    wordInput.addEventListener('input', debouncedCreateLetterBoxes);
    
    // Also handle Enter key press in the input field
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission if inside a form
            createLetterBoxes();
        }
    });
    
    // Add event listener for scramble button
    const scrambleBtn = document.getElementById('scramble-btn');
    scrambleBtn.addEventListener('click', createLetterBoxes);
    
    // Add event listeners for layout buttons
    circularBtn.addEventListener('click', () => {
        currentLayout = 'circular';
        circularBtn.classList.add('active');
        linearBtn.classList.remove('active');
        createLetterBoxes();
    });
    
    linearBtn.addEventListener('click', () => {
        currentLayout = 'linear';
        linearBtn.classList.add('active');
        circularBtn.classList.remove('active');
        createLetterBoxes();
    });

    function createLetterBoxes() {
        const word = wordInput.value.trim();
        
        if (!word) {
            // Don't show alert when debouncing, just return silently
            return;
        }

        // Save the word to localStorage
        localStorage.setItem('savedWord', word);
        
        // Clear previous letters
        lettersContainer.innerHTML = '';
        
        // Create an array of letters (excluding spaces)
        const letters = [...word].filter(char => char !== ' ');
        
        // Create a shuffled array of indices
        const indices = Array.from({ length: letters.length }, (_, i) => i);
        shuffleArray(indices);
        
        // Use the current layout
        const layout = currentLayout;
        
        // Get letter box size based on screen width and letter count
        const lettersCount = letters.length;
        const letterBoxSize = window.innerWidth < 600 ? 50 : 60;
        const halfLetterSize = letterBoxSize / 2;
        
        // Calculate container dimensions
        const containerWidth = lettersContainer.offsetWidth;
        const containerHeight = lettersContainer.offsetHeight;
        
        // Create a box for each letter with randomized position
        letters.forEach((letter, i) => {
            const letterBox = document.createElement('div');
            
            // Use smaller tiles if there are more than 15 letters
            letterBox.className = lettersCount > 15 ? 'letter-box tile letter-box-small' : 'letter-box tile';
            letterBox.textContent = letter.toUpperCase();
            
            // Use the shuffled index for positioning
            const shuffledIndex = indices[i];
            
            let x, y;
            
            if (layout === 'circular') {
                // Circular layout (clock face)
                const radius = Math.min(containerWidth, containerHeight) * 0.35; // Use 35% of container size for radius
                const centerX = containerWidth / 2 - halfLetterSize;
                const centerY = containerHeight / 2 - halfLetterSize;
                
                const angle = (shuffledIndex / lettersCount) * 2 * Math.PI - Math.PI/2; // Start from top (12 o'clock)
                x = centerX + radius * Math.cos(angle);
                y = centerY + radius * Math.sin(angle);
            } else {
                // Linear layout with wrapping
                const spacing = letterBoxSize * 1.2; // Add 20% spacing between letters
                const tilesPerRow = Math.floor(containerWidth * 0.85 / spacing); // Use 85% of container width
                const effectiveWidth = tilesPerRow * spacing;
                const startX = (containerWidth - effectiveWidth) / 2;
                
                // Calculate row and column based on index
                const row = Math.floor(shuffledIndex / tilesPerRow);
                const col = shuffledIndex % tilesPerRow;
                
                // Calculate position with wrapping
                x = startX + col * spacing;
                y = containerHeight * 0.3 + row * spacing; // Start at 30% from top and add rows as needed
            }
            
            letterBox.style.left = `${x}px`;
            letterBox.style.top = `${y}px`;
            
            lettersContainer.appendChild(letterBox);
        });
        
        // Keep the word in the input field
        // wordInput.value = '';
        
        // Make the letter boxes draggable
        setupDraggable();
    }

    function setupDraggable() {
        interact('.tile').draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            autoScroll: true,
            
            listeners: {
                move: dragMoveListener,
            }
        });
    }

    function dragMoveListener(event) {
        const target = event.target;
        
        // Get the current position from the data-x/data-y attributes or default to 0
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Update the element's position
        target.style.transform = `translate(${x}px, ${y}px)`;
        
        // Store the position
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
});
