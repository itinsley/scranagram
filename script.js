document.addEventListener('DOMContentLoaded', () => {
    const wordInput = document.getElementById('word-input');
    const createBtn = document.getElementById('create-btn');
    const lettersContainer = document.getElementById('letters-container');
    
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
    const debouncedCreateLetterBoxes = debounce(createLetterBoxes, 500);

    // Check if there's a saved word in localStorage and load it
    const savedWord = localStorage.getItem('savedWord');
    if (savedWord) {
        wordInput.value = savedWord;
        createLetterBoxes();
    }

    // Handle button click
    createBtn.addEventListener('click', createLetterBoxes);
    
    // Handle input with debounce
    wordInput.addEventListener('input', debouncedCreateLetterBoxes);
    
    // Also handle Enter key press in the input field
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission if inside a form
            createLetterBoxes();
        }
    });

    function createLetterBoxes() {
        const word = wordInput.value.trim();
        
        if (!word) {
            alert('Please enter a word');
            return;
        }

        // Save the word to localStorage
        localStorage.setItem('savedWord', word);
        
        // Clear previous letters
        lettersContainer.innerHTML = '';
        
        // Create a box for each letter (excluding spaces)
        [...word].forEach((letter, index) => {
            // Skip spaces
            if (letter === ' ') return;
            
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            letterBox.textContent = letter.toUpperCase();
            
            // Position in a circular pattern like a clock face
            const lettersCount = word.replace(/\s+/g, '').length; // Count letters excluding spaces
            const radius = Math.min(lettersContainer.offsetWidth, lettersContainer.offsetHeight) * 0.35; // Use 35% of container size for radius
            
            // Get letter box size based on screen width
            const letterBoxSize = window.innerWidth < 600 ? 50 : 60;
            const halfLetterSize = letterBoxSize / 2;
            
            // Calculate the center of the container
            const centerX = lettersContainer.offsetWidth / 2 - halfLetterSize;
            const centerY = lettersContainer.offsetHeight / 2 - halfLetterSize;
            
            // Calculate position based on index (excluding spaces)
            const nonSpaceIndex = [...word.substring(0, index)].filter(char => char !== ' ').length;
            const angle = (nonSpaceIndex / lettersCount) * 2 * Math.PI - Math.PI/2; // Start from top (12 o'clock)
            
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
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
        interact('.letter-box').draggable({
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
