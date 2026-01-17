// Games System

let currentGame = null;
let gameInterval = null;
let gameScore = 0;

function playGame(gameId) {
    if (accountSuspended) {
        alert('Your account is suspended. You cannot play games.');
        return;
    }

    currentGame = gameId;
    gameScore = 0;

    document.getElementById('game-modal').style.display = 'block';
    const container = document.getElementById('game-container');

    switch (gameId) {
        case 'pug-catch':
            startPugCatch(container);
            break;
        case 'pug-run':
            startPugRun(container);
            break;
        case 'pug-memory':
            startPugMemory(container);
            break;
    }
}

function closeGame() {
    document.getElementById('game-modal').style.display = 'none';
    document.getElementById('game-container').innerHTML = '';

    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }

    currentGame = null;
    gameScore = 0;
}

async function endGame(earnedSkittles) {
    if (earnedSkittles > 0) {
        // Check for double skittles boost
        const hasBoost = currentUser.items && currentUser.items.double_skittles;
        if (hasBoost) {
            earnedSkittles *= 2;
        }

        const newSkittles = currentUser.skittles + earnedSkittles;
        await database.ref('users/' + currentUser.uid + '/skittles').set(newSkittles);

        currentUser.skittles = newSkittles;
        updateSkittlesDisplay();

        const boostMsg = hasBoost ? ' (2x boost applied!)' : '';
        alert(`🎮 Game Over! You earned ${earnedSkittles} Skittles!${boostMsg}\nFinal Score: ${gameScore}`);
    } else {
        alert(`🎮 Game Over! Final Score: ${gameScore}`);
    }

    closeGame();
}

// Pug Catch - Catch falling treats
function startPugCatch(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2>🐕 Pug Catch</h2>
            <p>Use arrow keys to move! Catch the treats!</p>
            <p>Score: <span id="game-score">0</span></p>
            <button onclick="endGame(Math.floor(gameScore / 10))">End Game</button>
        </div>
        <div id="pug-catch-area" class="game-area">
            <div id="pug-player" class="pug-player">🐶</div>
        </div>
    `;

    const gameArea = document.getElementById('pug-catch-area');
    const player = document.getElementById('pug-player');
    let playerPos = 50; // percentage
    let treats = [];

    // Player movement
    document.addEventListener('keydown', movePugPlayer);

    function movePugPlayer(e) {
        if (currentGame !== 'pug-catch') return;

        if (e.key === 'ArrowLeft' && playerPos > 0) {
            playerPos -= 5;
        } else if (e.key === 'ArrowRight' && playerPos < 90) {
            playerPos += 5;
        }
        player.style.left = playerPos + '%';
    }

    // Spawn treats
    const spawnInterval = setInterval(() => {
        if (currentGame !== 'pug-catch') {
            clearInterval(spawnInterval);
            return;
        }

        const treat = document.createElement('div');
        treat.className = 'falling-treat';
        treat.textContent = ['🦴', '🥩', '🍖', '🌭'][Math.floor(Math.random() * 4)];
        treat.style.left = Math.random() * 90 + '%';
        treat.style.top = '0px';
        gameArea.appendChild(treat);

        treats.push({
            element: treat,
            pos: 0
        });
    }, 1500);

    // Game loop
    gameInterval = setInterval(() => {
        if (currentGame !== 'pug-catch') {
            clearInterval(gameInterval);
            document.removeEventListener('keydown', movePugPlayer);
            return;
        }

        treats.forEach((treat, index) => {
            treat.pos += 3;
            treat.element.style.top = treat.pos + 'px';

            // Check collision
            const treatRect = treat.element.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            if (!(treatRect.right < playerRect.left ||
                treatRect.left > playerRect.right ||
                treatRect.bottom < playerRect.top ||
                treatRect.top > playerRect.bottom)) {

                // Caught!
                gameScore += 10;
                document.getElementById('game-score').textContent = gameScore;
                treat.element.remove();
                treats.splice(index, 1);
            } else if (treat.pos > 400) {
                // Missed
                treat.element.remove();
                treats.splice(index, 1);
            }
        });
    }, 50);
}

// Pug Run - Avoid obstacles
function startPugRun(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2>🏃 Pug Run</h2>
            <p>Press SPACE to jump! Avoid obstacles!</p>
            <p>Score: <span id="game-score">0</span></p>
            <button onclick="endGame(Math.floor(gameScore / 5))">End Game</button>
        </div>
        <div id="pug-run-area" class="game-area">
            <div id="pug-runner" class="pug-runner">🐶</div>
        </div>
    `;

    const gameArea = document.getElementById('pug-run-area');
    const runner = document.getElementById('pug-runner');
    let isJumping = false;
    let obstacles = [];

    // Jump
    document.addEventListener('keydown', pugJump);

    function pugJump(e) {
        if (currentGame !== 'pug-run') return;
        if (e.key === ' ' && !isJumping) {
            isJumping = true;
            runner.style.bottom = '100px';

            setTimeout(() => {
                runner.style.bottom = '20px';
                isJumping = false;
            }, 500);
        }
    }

    // Spawn obstacles
    const spawnInterval = setInterval(() => {
        if (currentGame !== 'pug-run') {
            clearInterval(spawnInterval);
            return;
        }

        const obstacle = document.createElement('div');
        obstacle.className = 'pug-obstacle';
        obstacle.textContent = ['🌵', '🪨', '🚧'][Math.floor(Math.random() * 3)];
        obstacle.style.right = '0px';
        gameArea.appendChild(obstacle);

        obstacles.push({
            element: obstacle,
            pos: 0
        });
    }, 2000);

    // Game loop
    gameInterval = setInterval(() => {
        if (currentGame !== 'pug-run') {
            clearInterval(gameInterval);
            document.removeEventListener('keydown', pugJump);
            return;
        }

        gameScore++;
        document.getElementById('game-score').textContent = gameScore;

        obstacles.forEach((obstacle, index) => {
            obstacle.pos += 5;
            obstacle.element.style.right = obstacle.pos + 'px';

            // Check collision
            const obstacleRect = obstacle.element.getBoundingClientRect();
            const runnerRect = runner.getBoundingClientRect();

            if (!(obstacleRect.right < runnerRect.left ||
                obstacleRect.left > runnerRect.right ||
                obstacleRect.bottom < runnerRect.top ||
                obstacleRect.top > runnerRect.bottom)) {

                // Hit!
                clearInterval(gameInterval);
                clearInterval(spawnInterval);
                document.removeEventListener('keydown', pugJump);
                endGame(Math.floor(gameScore / 5));
            } else if (obstacle.pos > 600) {
                obstacle.element.remove();
                obstacles.splice(index, 1);
            }
        });
    }, 50);
}

// Pug Memory - Match cards
function startPugMemory(container) {
    const emojis = ['🐶', '🦴', '🥩', '🏠', '⚽', '🎾', '🌭', '🍕'];
    const cards = [...emojis, ...emojis];
    cards.sort(() => Math.random() - 0.5);

    let flipped = [];
    let matched = 0;

    container.innerHTML = `
        <div class="game-header">
            <h2>🧠 Pug Memory</h2>
            <p>Match all the pairs!</p>
            <p>Pairs found: <span id="game-score">0</span>/8</p>
        </div>
        <div id="memory-grid" class="memory-grid"></div>
    `;

    const grid = document.getElementById('memory-grid');

    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.textContent = '❓';
        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    });

    function flipCard(card) {
        if (flipped.length >= 2 || card.classList.contains('flipped')) return;

        card.textContent = card.dataset.emoji;
        card.classList.add('flipped');
        flipped.push(card);

        if (flipped.length === 2) {
            setTimeout(checkMatch, 1000);
        }
    }

    function checkMatch() {
        const [card1, card2] = flipped;

        if (card1.dataset.emoji === card2.dataset.emoji) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matched++;
            gameScore = matched;
            document.getElementById('game-score').textContent = matched;

            if (matched === 8) {
                setTimeout(() => {
                    endGame(100);
                }, 500);
            }
        } else {
            card1.textContent = '❓';
            card2.textContent = '❓';
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }

        flipped = [];
    }
}
