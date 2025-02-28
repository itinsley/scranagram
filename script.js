document.addEventListener('DOMContentLoaded', () => {
    const wordInput = document.getElementById('word-input');
    const createBtn = document.getElementById('create-btn');
    const lettersContainer = document.getElementById('letters-container');

    // Handle button click
    createBtn.addEventListener('click', createLetterBoxes);
    
    // Also handle Enter key press in the input field
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            createLetterBoxes();
        }
    });

    function createLetterBoxes() {
        const word = wordInput.value.trim();
        
        if (!word) {
            alert('Please enter a word');
            return;
        }
        
        // Clear previous letters
        lettersContainer.innerHTML = '';
        
        // Create a box for each letter
        [...word].forEach((letter, index) => {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            letterBox.textContent = letter.toUpperCase();
            
            // Position randomly within the container
            const containerWidth = lettersContainer.offsetWidth - 60; // Subtract box width
            const containerHeight = lettersContainer.offsetHeight - 60; // Subtract box height
            
            const randomX = Math.floor(Math.random() * containerWidth);
            const randomY = Math.floor(Math.random() * 200); // Keep it in the upper area
            
            letterBox.style.left = `${randomX}px`;
            letterBox.style.top = `${randomY}px`;
            
            lettersContainer.appendChild(letterBox);
        });
        
        // Clear the input field
        wordInput.value = '';
        
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
