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

function collision(rx, ry, rw, rh, r2x, r2y, r2w, r2h) {
  return (rx < r2x + r2w &&
    rx + rw > r2x &&
    ry < r2y + r2h &&
    ry + rh > r2y);
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

function findIsometricCenter(numColumns, numRows) {
    const size = 16;

    // Finding the center tile
    const cenX = Math.floor(numColumns / 2);
    const cenY = Math.floor(numRows / 2);

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
  const tl = [-90, cen.y-80];
  const br = [90, cen.y+20];

  return x >= tl[0] && x <= br[0] && y >= tl[1] && y <= br[1];
}

function applyKnockback(hero, entity, wepPower) {
    // SOUND
    zzfx(...[,,102,,.03,.15,3,1.95,-1.5,,,,,1,,.1,,.55,.07,.28]);
    let push = 25 + wepPower;
    let dx = entity.x - hero.e.x;
    let dy = entity.y - hero.e.y;
    let length = Math.sqrt(dx * dx + dy * dy);

    if (length !== 0) { // To prevent division by zero
        dx /= length;
        dy /= length;
    }

    entity.x += dx * push;
    entity.y += dy * push;
}
