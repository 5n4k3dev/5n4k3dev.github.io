
// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Audio (generated, no files)
let audioCtx = null;

function playTone(freq = 220) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  gain.gain.value = 0.05;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}


// 
class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = Math.random() * 2 - 1;
    this.vy = Math.random() * 2 - 1;
    this.phase = Math.floor(Math.random() * 4);
  }

  step() {
    // simple phase-based behavior
    if (this.phase === 0) {
      this.x += this.vx * 20;
      this.y += this.vy * 20;
    }

    // wrap around edges
    this.x = (this.x + canvas.width) % canvas.width;
    this.y = (this.y + canvas.height) % canvas.height;

    this.phase = (this.phase + 1) % 4;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}


// World state

const entities = [];
const ENTITY_COUNT = 12;

for (let i = 0; i < ENTITY_COUNT; i++) {
  entities.push(
    new Entity(
      Math.random() * canvas.width,
      Math.random() * canvas.height
    )
  );
}

let pulse = 0;
let running = false;


function stepWorld() {
  pulse++;

  entities.forEach(e => e.step());

  // sound as temporal marker
  if (pulse % 4 === 0) {
    playTone(180 + pulse * 2);
  }

  draw();
}

// Render

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  entities.forEach(e => e.draw());
}


// Interaction

function interact() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  // each interaction advances time
  stepWorld();
}

// One unified interaction logic
window.addEventListener("keydown", interact);
canvas.addEventListener("click", interact);

// initial state
draw();
