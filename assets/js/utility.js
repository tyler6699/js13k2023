// Useful Functions and classes
function rectanlge(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}

function rndNo(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function cloneRectanlge(rec) {
  return new rectanlge(rec.x, rec.y, rec.w, rec.h);
}

function rectColiding(rec1, rec2) {
  return (rec1.x < rec2.x + rec2.w &&
    rec1.x + rec1.w > rec2.x &&
    rec1.y < rec2.y + rec2.h &&
    rec1.y + rec1.h > rec2.y)
}

function vec2(x,y){
  this.x = x;
  this.y = y;

  this.set = function(x,y) {
    this.x = x;
    this.y = y;
  }
}

function drawRect(ctx, ox, oy, x, y, w, h, col, alpha){
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(ox, oy);
  ctx.fillStyle = col;
  ctx.fillRect(x,y,w,h);
  ctx.restore();
}

function lerp (start, end, amt){
  return (1-amt)*start+amt*end
}

function isoCen(nc, nr) {
    const size = 16;

    // Finding the center tile
    cenX = Math.floor(nc / 2);
    cenY = Math.floor(nr / 2);

    // Calculating the pixel coordinates of the center tile
    return { x: (cenX - cenY) * size / 2, y: (cenX + cenY) * size / 2 };
}

function getTile(x,y,h,offY){
  let gridX = x / 32;
  let gridY = (y+h*2+offY) / 32 * 2;

  // Convert this grid position to isometric grid position based on your setup
  let isoRow = gridY - gridX;
  let isoCol = gridX + gridY;

  r = Math.floor(isoRow);
  c = Math.floor(isoCol);

  return getTileRC(r,c);
}

function getTileRC(r,c){
  return cart.level.tiles[c + (cart.levels[cart.hero.e.curLevel].cols * r)];
}

function nearCastle(x, y, cen) {
  const tl = [-80, cen.y-85];
  const br = [85, cen.y+50];

  return x >= tl[0] && x <= br[0] && y >= tl[1] && y <= br[1];
}

function kBack(h, e, pow) {
    // SOUND
    zzfx(...[,,102,,.03,.15,3,1.95,-1.5,,,,,1,,.1,,.55,.07,.28]);
    let push = 25 + pow;
    let dx = e.x - h.e.x;
    let dy = e.y - h.e.y;
    let len = Math.sqrt(dx * dx + dy * dy);

    if (length !== 0) { // To prevent division by zero
        dx /= len;
        dy /= len;
    }

    entity.x += dx * push;
    entity.y += dy * push;
}

function knockback(hero, src, amt) {
    // calculate direction based on position of damage source and hero's position
    let dx = hero.e.x > src.x ? 1 : -1;
    let dy = hero.e.y > src.y ? 1 : -1;

    // apply knockback
    hero.e.x += dx * amt;
    hero.e.y += dy * amt;
}
