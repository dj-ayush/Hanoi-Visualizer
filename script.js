document.addEventListener('DOMContentLoaded', () => {
  // Game state
  const gameState = {
    disks: 3,
    towers: [[], [], []],
    selectedTower: null,
    moveCount: 0,
    minMoves: 0,
    startTime: null,
    timerInterval: null,
    isAutoSolving: false,
    isTutorial: false,
    tutorialStep: 0,
    darkMode: true
  };

  // DOM elements
  const elements = {
    gameBoard: document.getElementById('gameBoard'),
    towersContainer: document.getElementById('towers'),
    moveCount: document.getElementById('moveCount'),
    minMoves: document.getElementById('minMoves'),
    timeElapsed: document.getElementById('timeElapsed'),
    complexity: document.getElementById('complexity'),
    autoSolveBtn: document.getElementById('autoSolveBtn'),
    resetBtn: document.getElementById('resetBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    helpBtn: document.getElementById('helpBtn'),
    statsBtn: document.getElementById('statsBtn'),
    winModal: document.getElementById('winModal'),
    helpModal: document.getElementById('helpModal'),
    newGameModal: document.getElementById('newGameModal'),
    statsModal: document.getElementById('statsModal'),
    finalMoves: document.getElementById('finalMoves'),
    finalTime: document.getElementById('finalTime'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    closeHelpBtn: document.getElementById('closeHelpBtn'),
    closeStatsBtn: document.getElementById('closeStatsBtn'),
    tutorialBtn: document.getElementById('tutorialBtn'),
    startGameBtn: document.getElementById('startGameBtn'),
    cancelNewGameBtn: document.getElementById('cancelNewGameBtn'),
    difficultyBtns: document.querySelectorAll('.difficulty-btn'),
    themeToggle: document.getElementById('themeToggle'),
    moveSound: document.getElementById('moveSound'),
    winSound: document.getElementById('winSound'),
    errorSound: document.getElementById('errorSound'),
    selectSound: document.getElementById('selectSound')
  };

  // Initialize the game
  function initGame() {
    // Reset game state
    gameState.towers = [[], [], []];
    gameState.selectedTower = null;
    gameState.moveCount = 0;
    gameState.isAutoSolving = false;
    gameState.isTutorial = false;
    gameState.tutorialStep = 0;
    
    // Calculate minimum moves (2^n - 1)
    gameState.minMoves = Math.pow(2, gameState.disks) - 1;
    
    // Update UI
    elements.moveCount.textContent = gameState.moveCount;
    elements.minMoves.textContent = gameState.minMoves;
    elements.timeElapsed.textContent = '00:00';
    elements.complexity.textContent = `O(2${gameState.disks})`;
    
    // Create disks
    for (let i = gameState.disks; i > 0; i--) {
      gameState.towers[0].push(i);
    }
    
    // Render towers
    renderTowers();
    
    // Start timer
    startTimer();
  }

  // Render towers and disks
  function renderTowers() {
    elements.towersContainer.innerHTML = '';
    
    // Create towers
    for (let i = 0; i < 3; i++) {
      const tower = document.createElement('div');
      tower.className = 'tower';
      if (gameState.selectedTower === i) {
        tower.classList.add('active');
      }
      tower.dataset.index = i;
      
      // Create disks
      gameState.towers[i].forEach((diskSize, index) => {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.dataset.size = diskSize;
        disk.style.width = `${diskSize * 30 + 60}px`;
        disk.style.backgroundColor = getDiskColor(diskSize);
        disk.textContent = diskSize;
        tower.appendChild(disk);
      });
      
      tower.addEventListener('click', () => handleTowerClick(i));
      elements.towersContainer.appendChild(tower);
    }
  }

  // Get color for disk based on size
  function getDiskColor(size) {
    const hue = (size / gameState.disks) * 240;
    return `hsl(${hue}, 80%, 60%)`;
  }

  // Handle tower click
  function handleTowerClick(towerIndex) {
    if (gameState.isAutoSolving || gameState.isTutorial) return;
    
    // If no tower is selected, select this tower if it has disks
    if (gameState.selectedTower === null) {
      if (gameState.towers[towerIndex].length > 0) {
        gameState.selectedTower = towerIndex;
        elements.selectSound.currentTime = 0;
        elements.selectSound.play();
        renderTowers();
      }
    } 
    // If this tower is already selected, deselect it
    else if (gameState.selectedTower === towerIndex) {
      gameState.selectedTower = null;
      renderTowers();
    } 
    // Otherwise, try to move disk from selected tower to this tower
    else {
      moveDisk(gameState.selectedTower, towerIndex);
    }
  }

  // Move disk from one tower to another
  function moveDisk(fromIndex, toIndex) {
    const fromTower = gameState.towers[fromIndex];
    const toTower = gameState.towers[toIndex];
    
    // Check if move is valid
    if (fromTower.length === 0) {
      elements.errorSound.currentTime = 0;
      elements.errorSound.play();
      return;
    }
    
    const disk = fromTower[fromTower.length - 1];
    
    if (toTower.length > 0 && disk > toTower[toTower.length - 1]) {
      elements.errorSound.currentTime = 0;
      elements.errorSound.play();
      return;
    }
    
    // Perform the move
    fromTower.pop();
    toTower.push(disk);
    gameState.moveCount++;
    elements.moveCount.textContent = gameState.moveCount;
    
    // Play move sound
    elements.moveSound.currentTime = 0;
    elements.moveSound.play();
    
    // Deselect tower
    gameState.selectedTower = null;
    
    // Re-render
    renderTowers();
    
    // Check for win
    checkWin();
  }

  // Check if player has won
  function checkWin() {
    if (gameState.towers[2].length === gameState.disks) {
      // Player won!
      clearInterval(gameState.timerInterval);
      elements.winSound.play();
      showWinModal();
      createConfetti();
    }
  }

  // Create confetti effect
  function createConfetti() {
    const colors = ['#f72585', '#b5179e', '#7209b7', '#4361ee', '#4cc9f0', '#4895ef'];
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      document.body.appendChild(confetti);
      
      // Remove confetti after animation
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  }

  // Start timer
  function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.startTime = new Date();
    
    gameState.timerInterval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - gameState.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      elements.timeElapsed.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  // Auto-solve the puzzle
  async function autoSolve() {
    if (gameState.isAutoSolving) return;
    
    gameState.isAutoSolving = true;
    elements.autoSolveBtn.disabled = true;
    
    // Reset the game first
    initGame();
    
    // Use the solver implementation
    await window.solver.solve(gameState.disks, 0, 2, 1, {
      onMove: async (from, to) => {
        // Highlight the move
        gameState.selectedTower = from;
        renderTowers();
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Perform the move
        const disk = gameState.towers[from].pop();
        gameState.towers[to].push(disk);
        gameState.moveCount++;
        elements.moveCount.textContent = gameState.moveCount;
        
        // Play move sound
        elements.moveSound.currentTime = 0;
        elements.moveSound.play();
        
        // Update display
        renderTowers();
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    });
    
    gameState.isAutoSolving = false;
    elements.autoSolveBtn.disabled = false;
  }

  // Show win modal
  function showWinModal() {
    elements.finalMoves.textContent = gameState.moveCount;
    elements.finalTime.textContent = elements.timeElapsed.textContent;
    elements.winModal.classList.add('active');
  }

  // Show help modal
  function showHelpModal() {
    elements.helpModal.classList.add('active');
  }

  // Show new game modal
  function showNewGameModal() {
    elements.newGameModal.classList.add('active');
  }

  // Show stats modal
  function showStatsModal() {
    elements.statsModal.classList.add('active');
  }

  // Close all modals
  function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  // Start tutorial
  function startTutorial() {
    gameState.isTutorial = true;
    gameState.tutorialStep = 0;
    closeModals();
    initGame();
    nextTutorialStep();
  }

  // Next tutorial step
  function nextTutorialStep() {
    const steps = [
      { message: "Welcome to Tower of Hanoi! Let's learn how to play.", highlight: null },
      { message: "The goal is to move all disks to the rightmost tower.", highlight: { index: 2, type: 'tower' } },
      { message: "You can only move one disk at a time.", highlight: { index: 0, type: 'disk', size: 1 } },
      { message: "Click on the left tower to select the top disk.", highlight: { index: 0, type: 'tower' } },
      { message: "Now click on the middle tower to place the disk there.", highlight: { index: 1, type: 'tower' } },
      { message: "Great! Now try moving the next disk from the left tower.", highlight: { index: 0, type: 'disk', size: 2 } },
      { message: "Remember: You can't place a larger disk on top of a smaller one.", highlight: null },
      { message: "That's it! Try to move all disks to the right tower.", highlight: null }
    ];

    if (gameState.tutorialStep >= steps.length) {
      gameState.isTutorial = false;
      return;
    }

    const step = steps[gameState.tutorialStep];
    
    // Show message (you could implement a message box)
    console.log(step.message);
    
    // Highlight element if needed
    const highlight = document.querySelector('.tutorial-highlight');
    if (highlight) highlight.remove();
    
    if (step.highlight) {
      const { index, type, size } = step.highlight;
      if (type === 'tower') {
        const tower = document.querySelectorAll('.tower')[index];
        const rect = tower.getBoundingClientRect();
        const highlightEl = document.createElement('div');
        highlightEl.className = 'tutorial-highlight';
        highlightEl.style.width = `${rect.width + 20}px`;
        highlightEl.style.height = `${rect.height + 20}px`;
        highlightEl.style.left = `${rect.left - 10}px`;
        highlightEl.style.top = `${rect.top - 10}px`;
        document.body.appendChild(highlightEl);
      } else if (type === 'disk') {
        const disks = document.querySelectorAll('.tower')[index].querySelectorAll('.disk');
        const disk = Array.from(disks).find(d => parseInt(d.dataset.size) === size);
        if (disk) {
          const rect = disk.getBoundingClientRect();
          const highlightEl = document.createElement('div');
          highlightEl.className = 'tutorial-highlight';
          highlightEl.style.width = `${rect.width + 20}px`;
          highlightEl.style.height = `${rect.height + 20}px`;
          highlightEl.style.left = `${rect.left - 10}px`;
          highlightEl.style.top = `${rect.top - 10}px`;
          document.body.appendChild(highlightEl);
        }
      }
    }
    
    gameState.tutorialStep++;
  }

  // Toggle dark/light mode
  function toggleTheme() {
    gameState.darkMode = !gameState.darkMode;
    
    if (gameState.darkMode) {
      document.body.style.background = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
      document.body.style.color = '#f8f9fa';
      elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      document.body.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef, #dee2e6)';
      document.body.style.color = '#212529';
      elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  // Event listeners
  elements.autoSolveBtn.addEventListener('click', autoSolve);
  elements.resetBtn.addEventListener('click', initGame);
  elements.newGameBtn.addEventListener('click', showNewGameModal);
  elements.helpBtn.addEventListener('click', showHelpModal);
  elements.statsBtn.addEventListener('click', showStatsModal);
  elements.nextLevelBtn.addEventListener('click', () => {
    gameState.disks = Math.min(gameState.disks + 1, 8);
    closeModals();
    initGame();
  });
  elements.playAgainBtn.addEventListener('click', () => {
    closeModals();
    initGame();
  });
  elements.closeHelpBtn.addEventListener('click', closeModals);
  elements.closeStatsBtn.addEventListener('click', closeModals);
  elements.tutorialBtn.addEventListener('click', startTutorial);
  elements.startGameBtn.addEventListener('click', () => {
    closeModals();
    initGame();
  });
  elements.cancelNewGameBtn.addEventListener('click', closeModals);
  elements.themeToggle.addEventListener('click', toggleTheme);

  // Difficulty selection
  elements.difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.difficultyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.disks = parseInt(btn.dataset.disks);
    });
  });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (gameState.isAutoSolving || gameState.isTutorial) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        if (gameState.selectedTower === null) {
          // Move selection left
          const leftTower = document.querySelectorAll('.tower')[0];
          leftTower.click();
        } else {
          // Try to move left
          const targetIndex = Math.max(0, gameState.selectedTower - 1);
          moveDisk(gameState.selectedTower, targetIndex);
        }
        break;
      case 'ArrowRight':
        if (gameState.selectedTower === null) {
          // Move selection right
          const rightTower = document.querySelectorAll('.tower')[2];
          rightTower.click();
        } else {
          // Try to move right
          const targetIndex = Math.min(2, gameState.selectedTower + 1);
          moveDisk(gameState.selectedTower, targetIndex);
        }
        break;
      case ' ':
      case 'Enter':
        if (gameState.selectedTower !== null) {
          // Deselect
          document.querySelectorAll('.tower')[gameState.selectedTower].click();
        } else {
          // Select current tower
          const middleTower = document.querySelectorAll('.tower')[1];
          middleTower.click();
        }
        break;
    }
  });

  // Initialize the game
  initGame();
});