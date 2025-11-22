// ===========================
// FLAPPY BIRD STYLE GAME CONFIG
// ===========================

const CONFIG = {
    // Game settings
    TARGET_SCORE: 20, // Berapa pipe yang harus dilewati untuk menang (LEBIH SEDIKIT!)
    GRAVITY: 0.25, // Gravitasi (lebih kecil = lebih mudah)
    FLAP_POWER: -6, // Kekuatan terbang (negatif = ke atas)
    
    // Player (bird)
    BIRD_SIZE: 60, // Ukuran burung (foto akan ditampilkan)
    BIRD_X: 100, // Posisi X tetap
    
    // Pipes (obstacles)
    PIPE_WIDTH: 70,
    PIPE_GAP: 300, // Jarak antar pipe atas dan bawah (JAUH LEBIH LEBAR!)
    PIPE_SPEED: 2, // Kecepatan pipe bergerak (LEBIH LAMBAT = MUDAH!)
    PIPE_SPACING: 300, // Jarak antar pasangan pipe (LEBIH JAUH!)
};

// ===========================
// GAME VARIABLES
// ===========================

let canvas, ctx;
let gameState = 'start'; // 'start', 'playing', 'gameover', 'victory'
let animationId;

// Bird (player) object
let bird = {
    x: CONFIG.BIRD_X,
    y: 0,
    velocityY: 0,
    size: CONFIG.BIRD_SIZE,
    rotation: 0,
};

// Bird image (foto Ayu)
let birdImage = new Image();
birdImage.src = 'ayu.jpg';

// Game variables
let pipes = [];
let score = 0;
let frameCount = 0;

// ===========================
// INITIALIZATION
// ===========================

window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Button listeners
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('retryBtn').addEventListener('click', restartGame);
    document.getElementById('playAgainBtn').addEventListener('click', restartGame);
    
    // Control listeners (keyboard + touch)
    document.addEventListener('keydown', handleInput);
    canvas.addEventListener('click', handleInput);
    canvas.addEventListener('touchstart', handleInput);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
});

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Set initial bird position
    bird.y = canvas.height / 2;
}

// ===========================
// GAME CONTROL
// ===========================

function startGame() {
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('hud').classList.add('active');
    
    resetGame();
    gameState = 'playing';
    gameLoop();
}

function restartGame() {
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('victoryScreen').classList.remove('active');
    
    resetGame();
    gameState = 'playing';
    gameLoop();
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocityY = 0;
    bird.rotation = 0;
    
    pipes = [];
    score = 0;
    frameCount = 0;
    
    updateHUD();
}

// ===========================
// INPUT HANDLING
// ===========================

function handleInput(e) {
    if (e.type === 'keydown' && e.code !== 'Space') return;
    
    e.preventDefault();
    
    if (gameState === 'playing') {
        flap();
    }
}

function flap() {
    bird.velocityY = CONFIG.FLAP_POWER;
}

// ===========================
// GAME LOOP
// ===========================

function gameLoop() {
    if (gameState !== 'playing') return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    updateBird();
    updatePipes();
    checkCollisions();
    checkVictory();
    
    drawPipes();
    drawBird();
    
    frameCount++;
    animationId = requestAnimationFrame(gameLoop);
}

// ===========================
// UPDATE FUNCTIONS
// ===========================

function updateBird() {
    // Apply gravity
    bird.velocityY += CONFIG.GRAVITY;
    bird.y += bird.velocityY;
    
    // Rotation based on velocity (flappy bird style)
    bird.rotation = Math.min(Math.max(bird.velocityY * 3, -30), 90);
    
    // Check bounds
    if (bird.y + bird.size > canvas.height) {
        gameOver();
    }
    
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocityY = 0;
    }
}

function updatePipes() {
    // Generate new pipes
    if (frameCount % Math.floor(CONFIG.PIPE_SPACING / CONFIG.PIPE_SPEED) === 0) {
        const minHeight = 50;
        const maxHeight = canvas.height - CONFIG.PIPE_GAP - 50;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + CONFIG.PIPE_GAP,
            scored: false,
        });
    }
    
    // Move pipes
    pipes.forEach(pipe => {
        pipe.x -= CONFIG.PIPE_SPEED;
        
        // Check if bird passed pipe (scoring)
        if (!pipe.scored && pipe.x + CONFIG.PIPE_WIDTH < bird.x) {
            pipe.scored = true;
            score++;
            updateHUD();
        }
    });
    
    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + CONFIG.PIPE_WIDTH > -50);
}

function checkCollisions() {
    for (let pipe of pipes) {
        // Check if bird is in pipe's x range
        if (bird.x + bird.size > pipe.x && bird.x < pipe.x + CONFIG.PIPE_WIDTH) {
            // Check top pipe collision
            if (bird.y < pipe.topHeight) {
                gameOver();
                return;
            }
            
            // Check bottom pipe collision
            if (bird.y + bird.size > pipe.bottomY) {
                gameOver();
                return;
            }
        }
    }
}

function checkVictory() {
    if (score >= CONFIG.TARGET_SCORE) {
        victory();
    }
}

// ===========================
// DRAW FUNCTIONS
// ===========================

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#FFE5EC');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Simple clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 5; i++) {
        const x = (frameCount * 0.2 + i * 200) % (canvas.width + 100) - 50;
        const y = 50 + i * 40;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
    ctx.rotate(bird.rotation * Math.PI / 180);
    
    if (birdImage.complete && birdImage.naturalWidth > 0) {
        // Draw circular photo
        ctx.beginPath();
        ctx.arc(0, 0, bird.size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(
            birdImage,
            -bird.size / 2,
            -bird.size / 2,
            bird.size,
            bird.size
        );
        
        ctx.restore();
        ctx.save();
        ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
        
        // Border
        ctx.strokeStyle = '#00897B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, bird.size / 2, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // Fallback circle
        ctx.fillStyle = '#00897B';
        ctx.beginPath();
        ctx.arc(0, 0, bird.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x, 0, CONFIG.PIPE_WIDTH, pipe.topHeight);
        
        // Top pipe cap
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, CONFIG.PIPE_WIDTH + 10, 30);
        
        // Bottom pipe
        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x, pipe.bottomY, CONFIG.PIPE_WIDTH, canvas.height - pipe.bottomY);
        
        // Bottom pipe cap
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.bottomY, CONFIG.PIPE_WIDTH + 10, 30);
    });
}

// ===========================
// UI FUNCTIONS
// ===========================

function updateHUD() {
    document.getElementById('score').textContent = score;
    document.getElementById('target').textContent = CONFIG.TARGET_SCORE;
}

// ===========================
// GAME END
// ===========================

function gameOver() {
    gameState = 'gameover';
    cancelAnimationFrame(animationId);
    
    document.getElementById('hud').classList.remove('active');
    document.getElementById('finalScore').textContent = score;
    
    setTimeout(() => {
        document.getElementById('gameOverScreen').classList.add('active');
    }, 300);
}

function victory() {
    gameState = 'victory';
    cancelAnimationFrame(animationId);
    
    document.getElementById('hud').classList.remove('active');
    document.getElementById('victoryScore').textContent = score;
    
    setTimeout(() => {
        document.getElementById('victoryScreen').classList.add('active');
    }, 300);
}
