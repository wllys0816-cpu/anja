/* ===================================
   CONFESSION v3 — ULTRA ROMANTIC
   Web Audio API Music + Canvas FX
   =================================== */

// ══════════════════════════════════════
//  STATE
// ══════════════════════════════════════
let musicPlaying = false;
let audioCtx = null;
let musicInterval = null;
let gainNode = null;
let dodgeCount = 0;
let currentScene = -1;
let typingDone = false;
let scenesRevealed = new Set();

// ══════════════════════════════════════
//  INIT
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    setDates();
    initFXCanvas();
    initCursorTrail();
    initScrollListener();
    createQuestionHearts();
    revealScene(0);
});

// ── Personalization ──
function updateName(name) {
    const el = document.getElementById('hero-name');
    if (el) el.textContent = name;
}

// ===== GANTI NAMA DI SINI =====
updateName("Alunaaa");

// ══════════════════════════════════════
//  DATES
// ══════════════════════════════════════
function setDates() {
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni',
                   'Juli','Agustus','September','Oktober','November','Desember'];
    const d = new Date();
    const str = `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
    const ld = document.getElementById('letter-date');
    const cd = document.getElementById('celeb-date');
    if (ld) ld.textContent = str;
    if (cd) cd.textContent = `sejak ${str} ❤️`;
}

// ══════════════════════════════════════
//  CANVAS: STARS + PETALS
// ══════════════════════════════════════
function initFXCanvas() {
    const canvas = document.getElementById('fx-canvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Stars ──
    const stars = [];
    for (let i = 0; i < 60; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 0.5 + Math.random() * 1.8,
            alpha: 0.2 + Math.random() * 0.5,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.01 + Math.random() * 0.02,
        });
    }

    // ── Petals ──
    const petals = [];
    for (let i = 0; i < 18; i++) {
        petals.push(newPetal(canvas, true));
    }

    function newPetal(cvs, scatter) {
        return {
            x: Math.random() * cvs.width,
            y: scatter ? Math.random() * cvs.height : -20,
            size: 6 + Math.random() * 11,
            speedY: 0.4 + Math.random() * 0.9,
            speedX: -0.3 + Math.random() * 0.6,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: -0.015 + Math.random() * 0.03,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.015 + Math.random() * 0.025,
            hue: 330 + Math.random() * 20,
            lightness: 78 + Math.random() * 14,
            alpha: 0.18 + Math.random() * 0.35,
        };
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw stars
        stars.forEach(s => {
            s.pulse += s.pulseSpeed;
            const a = s.alpha * (0.5 + 0.5 * Math.sin(s.pulse));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(244, 180, 210, ${a})`;
            ctx.fill();

            // Tiny glow
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(244, 180, 210, ${a * 0.15})`;
            ctx.fill();
        });

        // Draw petals
        petals.forEach((p, i) => {
            p.y += p.speedY;
            p.wobble += p.wobbleSpeed;
            p.x += p.speedX + Math.sin(p.wobble) * 0.4;
            p.rot += p.rotSpeed;

            if (p.y > canvas.height + 30) {
                petals[i] = newPetal(canvas, false);
                return;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.fillStyle = `hsl(${p.hue}, 75%, ${p.lightness}%)`;
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(
                p.size * 0.35, -p.size * 0.55,
                p.size, -p.size * 0.3,
                p.size * 0.5, p.size * 0.35
            );
            ctx.bezierCurveTo(
                p.size * 0.15, p.size * 0.5,
                -p.size * 0.1, p.size * 0.2,
                0, 0
            );
            ctx.fill();
            ctx.restore();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// ══════════════════════════════════════
//  CURSOR TRAIL
// ══════════════════════════════════════
function initCursorTrail() {
    const trail = document.getElementById('cursor-trail');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
    });

    function update() {
        trail.style.left = mx + 'px';
        trail.style.top = my + 'px';
        requestAnimationFrame(update);
    }
    update();

    // Sparkle on click
    document.addEventListener('click', e => {
        for (let i = 0; i < 6; i++) {
            createSparkle(e.clientX, e.clientY);
        }
    });
}

function createSparkle(x, y) {
    const el = document.createElement('div');
    const size = 4 + Math.random() * 6;
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 40;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const dur = 0.5 + Math.random() * 0.4;

    el.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: hsl(${330 + Math.random() * 30}, 80%, ${75 + Math.random() * 20}%);
        pointer-events: none;
        z-index: 600;
        transition: all ${dur}s cubic-bezier(0.22, 1, 0.36, 1);
        opacity: 1;
        box-shadow: 0 0 6px rgba(236, 72, 153, 0.4);
    `;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
        el.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
        el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), dur * 1000 + 100);
}

// ══════════════════════════════════════
//  SCROLL LISTENER
// ══════════════════════════════════════
function initScrollListener() {
    const container = document.getElementById('scroll-container');

    container.addEventListener('scroll', () => {
        const scrollTop = container.scrollTop;
        const viewH = container.clientHeight;
        const total = container.scrollHeight - viewH;

        // Progress
        const pct = total > 0 ? Math.min((scrollTop / total) * 100, 100) : 0;
        document.getElementById('progress-fill').style.width = pct + '%';

        // Detect current scene
        const scenes = container.querySelectorAll('.scene');
        let newScene = 0;
        scenes.forEach((sc, i) => {
            const rect = sc.getBoundingClientRect();
            if (rect.top < viewH * 0.55 && rect.bottom > viewH * 0.3) {
                newScene = i;
            }
        });

        if (newScene !== currentScene) {
            currentScene = newScene;
            updateDots();
            revealScene(currentScene);
        }
    });
}

function updateDots() {
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentScene);
    });
}

function scrollToScene(i) {
    const scene = document.getElementById(`scene-${i}`);
    if (scene) scene.scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════
//  SCROLL REVEAL
// ══════════════════════════════════════
function revealScene(index) {
    if (scenesRevealed.has(index)) return;
    scenesRevealed.add(index);

    const scene = document.getElementById(`scene-${index}`);
    if (!scene) return;

    const elements = scene.querySelectorAll('.fade-element');
    elements.forEach(el => {
        const delay = parseInt(el.dataset.delay || '0');
        setTimeout(() => {
            el.classList.add('visible');
        }, delay);
    });

    // Special: typewriter on scene 2
    if (index === 2 && !typingDone) {
        setTimeout(() => startTypewriter(), 1800);
    }

    // Auto-play music on first interaction
    if (index === 1) {
        tryPlayMusic();
    }
}

// ══════════════════════════════════════
//  TYPEWRITER
// ══════════════════════════════════════
function startTypewriter() {
    typingDone = true;
    const text = "Aku suka kamu 💕";
    const el = document.getElementById('typed-text');
    const cursor = document.getElementById('tw-cursor');
    const sign = document.getElementById('letter-sign');
    let i = 0;

    el.textContent = '';

    function type() {
        if (i < text.length) {
            el.textContent += text[i];
            i++;
            setTimeout(type, 90 + Math.random() * 70);
        } else {
            setTimeout(() => {
                cursor.style.display = 'none';
                if (sign) sign.classList.add('visible');
            }, 700);
        }
    }

    type();
}

// ══════════════════════════════════════
//  QUESTION FLOATING HEARTS
// ══════════════════════════════════════
function createQuestionHearts() {
    const container = document.getElementById('q-hearts-bg');
    if (!container) return;
    const hearts = ['💕','💗','💖','🩷','💝','♥','🤍'];

    for (let i = 0; i < 14; i++) {
        const h = document.createElement('span');
        h.className = 'q-mini-heart';
        h.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        const size = 10 + Math.random() * 18;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const dur = 3 + Math.random() * 5;
        const del = Math.random() * 6;
        const op = 0.15 + Math.random() * 0.3;

        h.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            --s: ${size}px;
            --dur: ${dur}s;
            --del: ${del}s;
            --op: ${op};
            font-size: ${size}px;
        `;
        container.appendChild(h);
    }
}

// ══════════════════════════════════════
//  HANDLE YES
// ══════════════════════════════════════
function handleYes() {
    const celebScene = document.getElementById('scene-celebrate');
    celebScene.classList.add('show');

    setTimeout(() => {
        celebScene.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    setTimeout(() => launchConfetti(), 400);
    setTimeout(() => launchConfetti(), 1000);
    setTimeout(() => launchConfetti(), 1600);
    setTimeout(() => burstHearts(), 500);
}

// ══════════════════════════════════════
//  DODGE BUTTON
// ══════════════════════════════════════
function dodgeButton() {
    dodgeCount++;
    const btn = document.getElementById('btn-no');
    const msg = document.getElementById('dodge-msg');
    const yesBtn = document.getElementById('btn-yes');

    const msgs = [
        'Hehe, nggak bisa dipencet~ 🤭',
        'Udah nyerah aja, pencet Ya! 😏',
        'Tombolnya kabur tuh... 🏃',
        'Keras kepala ya kamu 😤💕',
        'Last chance... pencet Ya dong 🥺',
    ];

    if (dodgeCount >= 6) {
        btn.style.fontSize = '0.55rem';
        btn.style.padding = '4px 10px';
        btn.style.opacity = '0.2';
        btn.textContent = '...';
        btn.style.pointerEvents = 'none';
        msg.textContent = 'Tombolnya udah capek 😂 pencet Ya aja ya~';
        return;
    }

    const parent = document.getElementById('scene-3');
    const rect = parent.getBoundingClientRect();
    const maxX = rect.width - 160;
    const maxY = rect.height - 80;
    const rx = 30 + Math.random() * (maxX - 60);
    const ry = 30 + Math.random() * (maxY - 60);

    btn.style.position = 'absolute';
    btn.style.left = rx + 'px';
    btn.style.top = ry + 'px';
    btn.style.transition = 'left 0.2s cubic-bezier(0.22, 1, 0.36, 1), top 0.2s cubic-bezier(0.22, 1, 0.36, 1)';

    const scale = 1 + dodgeCount * 0.07;
    yesBtn.style.transform = `scale(${scale})`;
    yesBtn.style.boxShadow = `0 ${6 + dodgeCount * 2}px ${24 + dodgeCount * 4}px rgba(219, 39, 119, ${0.3 + dodgeCount * 0.05})`;

    const btnTexts = ['Yakin? 🥺', 'Pikir lagi...', 'Jangan gitu 😢', 'Seriusan? 😭', 'Terakhir...'];
    btn.textContent = btnTexts[Math.min(dodgeCount - 1, btnTexts.length - 1)];

    msg.textContent = msgs[Math.min(dodgeCount - 1, msgs.length - 1)];

    // Sparkle burst on dodge
    const btnRect = btn.getBoundingClientRect();
    for (let i = 0; i < 4; i++) {
        createSparkle(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2);
    }
}

// ══════════════════════════════════════
//  CONFETTI
// ══════════════════════════════════════
function launchConfetti() {
    const colors = [
        '#f472b6','#ec4899','#db2777','#f9a8d4','#fbcfe8',
        '#fce7f3','#ffd700','#ffffff','#ff69b4','#ffb6c1','#ff1493'
    ];

    for (let i = 0; i < 55; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti';

        const color = colors[Math.floor(Math.random() * colors.length)];
        const x = Math.random() * 100;
        const w = 5 + Math.random() * 9;
        const h = w * (0.3 + Math.random() * 1.4);
        const dur = 2.5 + Math.random() * 2.5;
        const del = Math.random() * 0.7;
        const rz = (360 + Math.random() * 720) + 'deg';
        const rx = (180 + Math.random() * 360) + 'deg';
        const radius = Math.random() > 0.5 ? '50%' : Math.random() > 0.5 ? '2px' : '0';

        piece.style.cssText = `
            left: ${x}%;
            width: ${w}px;
            height: ${h}px;
            background: ${color};
            border-radius: ${radius};
            --dur: ${dur}s;
            --del: ${del}s;
            --rz: ${rz};
            --rx: ${rx};
        `;

        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), (dur + del + 0.5) * 1000);
    }
}

function burstHearts() {
    const emojis = ['💕','💗','💖','💝','❤️','🩷','💘','🥰','✨','💫'];
    for (let i = 0; i < 16; i++) {
        setTimeout(() => {
            const h = document.createElement('span');
            h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            const size = 20 + Math.random() * 26;
            const x = 20 + Math.random() * 60;
            const dur = 3 + Math.random() * 3;

            h.style.cssText = `
                position: fixed;
                bottom: -30px;
                left: ${x}%;
                font-size: ${size}px;
                z-index: 500;
                pointer-events: none;
                animation: burstUp ${dur}s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            `;

            // Inject keyframes if not done
            if (!document.getElementById('burst-style')) {
                const style = document.createElement('style');
                style.id = 'burst-style';
                style.textContent = `
                    @keyframes burstUp {
                        0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 0; }
                        15% { opacity: 1; }
                        100% { transform: translateY(-110vh) scale(1) rotate(${-30 + Math.random() * 60}deg); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(h);
            setTimeout(() => h.remove(), dur * 1000);
        }, i * 120);
    }
}

function replayConfetti() {
    launchConfetti();
    setTimeout(() => launchConfetti(), 500);
    burstHearts();
}

// ══════════════════════════════════════
//  MUSIC — Web Audio API
//  Romantic piano chord progression
// ══════════════════════════════════════
function createAudioContext() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.12;
    gainNode.connect(audioCtx.destination);
}

function playNote(freq, startTime, duration, type = 'sine') {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // ADSR envelope
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.3, startTime + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.15, startTime + duration * 0.4);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(noteGain);
    noteGain.connect(gainNode);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

function playChord(freqs, startTime, duration) {
    freqs.forEach(f => {
        playNote(f, startTime, duration, 'sine');
        // Soft octave doubling
        playNote(f * 2, startTime, duration * 0.7, 'sine');
    });
}

function startMusic() {
    createAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Romantic chord progression: C - Am - F - G (in suitable octave)
    // With melody notes on top
    const chords = [
        { chord: [261.63, 329.63, 392.00], melody: [523.25, 587.33, 523.25, 493.88] },  // C
        { chord: [220.00, 261.63, 329.63], melody: [493.88, 440.00, 493.88, 523.25] },  // Am
        { chord: [174.61, 220.00, 261.63], melody: [523.25, 587.33, 659.25, 587.33] },  // F
        { chord: [196.00, 246.94, 293.66], melody: [587.33, 523.25, 493.88, 440.00] },  // G
        { chord: [261.63, 329.63, 392.00], melody: [440.00, 493.88, 523.25, 587.33] },  // C
        { chord: [174.61, 220.00, 261.63], melody: [659.25, 587.33, 523.25, 493.88] },  // F
        { chord: [196.00, 246.94, 392.00], melody: [523.25, 493.88, 440.00, 493.88] },  // G
        { chord: [261.63, 329.63, 392.00], melody: [523.25, 0, 0, 0] },                   // C (resolve)
    ];

    function playSequence() {
        if (!musicPlaying) return;

        const now = audioCtx.currentTime;
        const chordDur = 2.4;
        const noteDur = chordDur / 4;

        chords.forEach((item, ci) => {
            const chordStart = now + ci * chordDur;

            // Play chord (pad)
            playChord(item.chord, chordStart, chordDur * 0.9);

            // Play melody notes
            item.melody.forEach((note, ni) => {
                if (note > 0) {
                    playNote(note, chordStart + ni * noteDur, noteDur * 0.85, 'triangle');
                }
            });

            // Bass note
            playNote(item.chord[0] / 2, chordStart, chordDur * 0.8, 'sine');
        });

        // Schedule next loop
        const totalDur = chords.length * chordDur * 1000;
        musicInterval = setTimeout(playSequence, totalDur - 200);
    }

    musicPlaying = true;
    playSequence();
}

function stopMusic() {
    musicPlaying = false;
    if (musicInterval) {
        clearTimeout(musicInterval);
        musicInterval = null;
    }
}

function tryPlayMusic() {
    if (!musicPlaying) {
        startMusic();
        updateMusicUI(true);
    }
}

function toggleMusic() {
    if (musicPlaying) {
        stopMusic();
        updateMusicUI(false);
    } else {
        startMusic();
        updateMusicUI(true);
    }
}

function updateMusicUI(playing) {
    const btn = document.getElementById('music-btn');
    const icon = document.getElementById('music-icon');
    if (playing) {
        btn.classList.add('playing');
        icon.textContent = '🎵';
    } else {
        btn.classList.remove('playing');
        icon.textContent = '🔇';
    }
}
