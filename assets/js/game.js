// ╔═══════════════════════════════╗
// ║ JS13K Entry by @CarelessLabs  ║
// ╚═══════════════════════════════╝

// Reference for new atlas
let canvasW = window.innerWidth;
let canvasH = window.innerHeight;
let gameStarted = false;
let delta = 0.0;
let prevDelta = Date.now();
let currentDelta = Date.now();
let TIME = 0;
let introT = 0;
let mousePos = new vec2(0,0);
let clickedAt = new vec2(0,0);
let clickedRec = new rectanlge(0,0,0,0);
let processClick = false;
let GAMEOVER=false;
let RELOAD=false;
let COL1 = "990099";
let WIN = false;
let STAGE=1;
colz=40+(STAGE*2);
let atlas = new Image();
atlas.src = "atlas.png";
let shaky = true;
let cart = new Cart();
let start=false;
let music=true;
let pause=false;

// Load the music player
genAudio();

// Called by body onload on index page
function startGame() {
  mg.start();
}

let mg = {
  canvas: document.createElement("canvas"),
  start: function() {
    this.canvas.width = canvasW;
    this.canvas.height = canvasH;
    this.context = this.canvas.getContext("2d");
    this.context.scale(1, 1);

    // PixelArt Sharp
    ctx=this.context;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    this.canvas.classList.add("screen");
    document.body.insertBefore(this.canvas, document.body.childNodes[6]);
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, 20);

    // Generate intro screen
    // cart.genLevel(0);

    // Keyboard
    window.addEventListener('keydown', function(e) {
      start=true;
      e.preventDefault();
      mg.keys = (mg.keys || []);
      mg.keys[e.keyCode] = (e.type == "keydown");
    })
    window.addEventListener('keyup', function(e) {
      mg.keys[e.keyCode] = (e.type == "keydown");
      if(e.keyCode==R) RELOAD=true;
      if(e.keyCode==M) pause=!pause;
      if(e.keyCode==T) cart.tips=!cart.tips;
    })
    window.addEventListener('mouseup', function(e) {
      e.preventDefault();
      setclicks();
      processClick=true;
    })
    window.addEventListener('mousemove', function(e) {
      e.preventDefault();
      var r = mg.canvas.getBoundingClientRect();
      mousePos.set((e.clientX - r.left) / (r.right - r.left) * canvasW,
                   (e.clientY - r.top) / (r.bottom - r.top) * canvasH);
  })
    // Disable right click context menu
    this.canvas.oncontextmenu = function(e) {
      e.preventDefault();
    };
  },
  stop: function() {
    clearInterval(this.interval);
  },
  clear: function() {
    this.context.clearRect(0, 0, 4*this.canvas.width, 4*this.canvas.height);
  }
}

function updateGameArea() {
  if(GAMEOVER){
    TIME=0;
    GAMEOVER=false;
    WIN=false;
    STAGE=0;
    start=false;
    gameStarted=false;
    cart.genLevel(STAGE);
  }

  if(start){
    if(cart.hero != null)cart.hero.e.active=true;
    gameStarted=true;
    if(audioCtx == null) audioCtx = new AudioContext();
  }

  // Delta
  prevDelta = currentDelta;
  currentDelta = Date.now();
  delta = currentDelta - prevDelta;
  TIME += delta;

  if (!gameStarted) {
    // intro Screen
    mg.clear();
    ctx = mg.context;
    cart.update(delta, TIME, true);
    ctx.save();
    drawBox(ctx,0.1,"#"+COL1,0,0,canvasW,canvasH)
    let font="30px Papyrus";
    writeTxt(ctx, 1, font,"WHITE","Main Screen", 30, 40);
    ctx.restore();
  } else {
    mg.clear();
    cart.update(delta, TIME, false);
    let font = "30px Papyrus";
    writeTxt(ctx, 1, font,"WHITE","[M] Music: " + !pause, canvasW-230, 30);
    writeTxt(ctx, 1, font,"WHITE","[R] Reset Level", canvasW-230, 70);

    writeTxt(ctx, 1, font,"WHITE","Level: " + (cart.hero.e.curLevel+1), 10, 100);
    writeTxt(ctx, 1, font,"WHITE","Castle Resources:", 10, 140);
    if(cart.hero.curTile){
      writeTxt(ctx, 1, font,"WHITE","Row: " + cart.hero.curTile.row + " Col: " + cart.hero.curTile.column, 10, 400);
    }
    writeTxt(ctx, 1, font,"WHITE","STAGE: " + STAGE, 10, 450);

    let lvl=cart.hero.e.curLevel;

    // Music
    if(pause){
      audio.pause();
      music=true;
    }

    if(music && songLoaded && !pause){
      audio.play();
      audio.loop=true;
      music=false;
    }
  }
  processClick=false;
}

function drawBox(ctx,a,colour,x,y,w,h) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = a;
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function writeSum(ctx,a,font,colour,num,x,y){
  var hex = eval('"\\u' + num+'"');
  ctx.globalAlpha = a;
  ctx.font = font;
  ctx.fillStyle = colour;
  ctx.fillText(hex, x, y);
}

function writeTxt(ctx,a,font,colour,txt,x,y) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = a;
  ctx.font = font;
  ctx.fillStyle = colour;
  ctx.fillText(txt, x, y);
  ctx.restore();
}

function left() {
  return mg.keys && (mg.keys[LEFT] || mg.keys[A]);
}

function right() {
  return mg.keys && (mg.keys[RIGHT] || mg.keys[D]);
}

function up() {
  return mg.keys && (mg.keys[UP] || mg.keys[W]);
}

function down() {
  return mg.keys && (mg.keys[DOWN] || mg.keys[S]);
}

function space() {
  return mg.keys && mg.keys[SPACE];
}

function map() {
  return mg.keys && mg.keys[M];
}

function one() {
  return mg.keys && (mg.keys[ONE]);
}

function two() {
  return mg.keys && (mg.keys[TWO]);
}

function three() {
  return mg.keys && (mg.keys[THREE]);
}

function four() {
  return mg.keys && (mg.keys[FOUR]);
}

function t() {
  return mg.keys && (mg.keys[T]);
}

function setclicks(){
  clickedAt.set(mousePos.x, mousePos.y);
  clickedRec.x=mousePos.x-5;
  clickedRec.y=mousePos.y+5;
  clickedRec.h=10;
  clickedRec.w=10;
}
