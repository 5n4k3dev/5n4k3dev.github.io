// Basic world setup

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);


// Audio from Web Audio API

let audioCtx = null;

function playSound(freq = 220) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}


// World state

let nodes = [];

// Example project links
const projectLinks = [
  { label: "Project1", url: "https://shimingyue.itch.io/ripple" },
  { label: "Project2", url: "https://youtu.be/44LIvvbIE10?si=ySCnc5qHPBkpO0nu" }
];



function createNode(x, y, special = false) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    life: 1,
    radius: special ? 10 : 4,
    special,
    link: special ? projectLinks[Math.floor(Math.random() * projectLinks.length)] : null
  };
}

// Unified interaction:

function interact(x, y) {
  // First interaction unlocks audio
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  playSound(200 + Math.random() * 400);

  // Create new nodes
  nodes.push(createNode(x, y));

  // Small chance to spawn a meaningful node
  if (Math.random() < 0.15) {
    nodes.push(createNode(x, y, true));
  }
}

// Mouse & keyboard share the same logic
canvas.addEventListener("click", e => {
  interact(e.clientX, e.clientY);
});

window.addEventListener("keydown", e => {
  interact(
    Math.random() * canvas.width,
    Math.random() * canvas.height
  );
});


// World update loop


function update() {
  ctx.fillStyle = "rgba(14,14,17,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  nodes.forEach(n => {
    // Movement
    n.x += n.vx;
    n.y += n.vy;

    // Soft boundaries
    if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
    if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

    // Life decay
    n.life *= 0.995;

    // Draw
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius * n.life, 0, Math.PI * 2);
    ctx.fillStyle = n.special ? "#ffffff" : "#888";
    ctx.fill();
  });

  // Remove dead nodes
  nodes = nodes.filter(n => n.life > 0.05);

  requestAnimationFrame(update);
}

update();

// Click special nodes → link

canvas.addEventListener("mousedown", e => {
  nodes.forEach(n => {
    if (!n.special || !n.link) return;

    const dx = e.clientX - n.x;
    const dy = e.clientY - n.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < n.radius * 1.5) {
      window.open(n.link.url, "_blank");
    }
  });
});