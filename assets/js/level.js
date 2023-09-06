function level(num, canvasW, canvasH, scale) {
  this.tiles=[];
  this.objs=[];
  this.mobs=[];
  this.castle=[];
  this.active=false;
  this.startPos=[-120, 280];
  this.cols=colz;
  this.rocks=0;
  this.trees=0;
  this.complete=false;
  this.bridge=false;
  this.mobTime=0;
  this.cen=findIsometricCenter(colz-1,colz-1);
  this.respawnDelay=8;
  this.maxMobs=10;
  this.dead=[];
  this.decor=[];

  // Isometric tileSize - Width remains the same, but height is half
  let tileWidth = 16;
  let tileHeight = 8;
  let levelArray;
  let mvd = 0;

  this.draw = function(hero, delta, intro) {
    this.tiles.forEach(e => e.update(delta, intro));
    // sort
    this.objs.sort((a, b) => a.y - b.y);
    this.rocks=0;
    this.trees=0;

    // Graves and other decorations
    this.decor.forEach((e) => {
      e.update(delta);
      e.update(delta,true);
    });

    this.objs.forEach((e) => {
        e.update(delta);
        e.update(delta,true);
        if(e.type==types.ROCK)this.rocks++;
        if(e.type==types.TREE)this.trees++;
    });

    // make castle transparent to check insaide for mobs
    if(nearCastle(hero.e.x, hero.e.y, this.cen, )){
      this.castle.forEach(e => e.alpha=.3);
    } else {
      this.castle.forEach(e => e.alpha=1);
    }
    this.castle.forEach(e => e.update(delta));
    // TODO castle shadows
    // this.castle.forEach(e => e.update(delta, true));

    // Draw Weapon
    if(hero.tool.type!=types.HAND){
        hero.tool.update(delta);
    }

    // Draw hero in front of castle, it is what it is! #wontfix
    if(hero.e.y>290&&nearCastle(hero.e.x, hero.e.y,this.cen)) hero.e.update(delta);

    if(this.mobs.length==0 && this.rocks==0 && this.trees==0){
      this.complete=true;
    }

    for (let i = 0; i < this.mobs.length; i++) {
      this.mobs[i].update(delta, this.mobs);
    }

    // When the level is complete drop the bridge
    if(this.complete && !this.bridge){
      this.bridge=true;
      let m=colz/2;
      for(r=0;r<3;r++){
        for(c=1;c<7;c++){
          let tile = getTileRC(m+r,colz-c);
          tile.e.type=types.BRDE;
          if(c<3)tile.progress=true;
          tile.e.setType();
          tile.e.y=200;
          tile.initialY-=5;
        }
      }
    }

    // SPAWNER
    this.mobTime+=delta/1000;
    if(this.mobTime>this.respawnDelay && (this.trees>0 || this.rocks>0) && this.mobs.length < this.maxMobs){
      // Add some mobs
      this.mobTime=0;
      skelly = new mob(16, 16, this.cen.x, this.cen.y, 0, types.SKELLY, mobtype.FOLLOW, scale, 10);
      this.mobs.push(skelly);
      this.objs.push(skelly.e);

      gob = new mob(18, 15, this.cen.x, this.cen.y, 0, types.GOB, mobtype.RANGED, scale, 20);
      this.mobs.push(gob);
      this.objs.push(gob.e);
    }

    // Dead mobs
    this.dead.forEach((d, i) => {
      d.update(delta);
      d.e.update(delta);
    });
  }

  this.reset = function(id, scaled) {
    console.log("Generate Level: " + id);
    this.tiles = [];
    this.dead = [];
    mvd = 0;
    let trigger = false;
    let t = 0;
    let maxWater = rndNo(2,5);
    let water=0;
    // Main level tiles
    let rows = colz;
    let tileID=0;

    // Generate Island
    for (r = 0; r < rows; r++) {
      for (c = 0; c < this.cols; c++) {
        let t = 1; // GRASS

        if(r < 4||c<4||c>colz-4||r>colz-4){
          t=types.SEA;
        } else if ((r < 6||c<6||c>colz-6||r>colz-6) && rndNo(0,100)>50) {
          t=types.SEA;
        } else if ((r < 8||c<8||c>colz-8||r>colz-8) && rndNo(0,100)>20) {
          t=types.SND;
        } else {
          if(rndNo(0,100)>99 && water<maxWater){
            t=types.WTR;
            water++;
          }
        }

        // Adjust the xx and yy calculation for isometric positioning
        xx = (c - r) * tileWidth;
        yy = (c + r) * tileHeight;

        var angle = 0;
        var tile = new Tile(tileID,tileWidth, xx, yy, angle, t, false, c, r, scale);
        this.tiles.push(tile);
        tileID++;
      }
    }

    // Expand Water Areas
    const changes = [];
    this.tiles.forEach((tile, i) => {
        if (tile.e.type==types.WTR) {
            Array.from({ length: rndNo(3, 8) }, (_, r) => r).forEach(r => {
                Array.from({ length: rndNo(3, 5) }, (_, col) => col).forEach(col => {
                    let pos = (tile.row + r) * colz + (tile.column + col);
                    if(pos >= 0 && pos < this.tiles.length) changes.push(pos);
                });
            });
        }
    });

    changes.forEach(pos => {
        if (rndNo(0, 100) > 20 && this.tiles[pos].e.type != types.WTR) {
            this.tiles[pos].e.type = types.WTR;
            this.tiles[pos].e.setType();
            this.tiles[pos].initialY += 6;
        }
    });

    // Add resources
    maxTrees=2+id;
    maxRocks=1+id;

    this.tiles.forEach(t => {
      if(t.e.type==types.GRASS && rndNo(0,100) > 98 && (this.trees<maxTrees)){
        if(!nearCastle(t.e.x, t.e.y-t.drop-10-30, this.cen)){
          obj = new entity(16, 23, t.e.x, t.e.y-t.drop-10-30, 0, types.TREE, "", scale, false, 2);
          obj.parent=t;
          t.obj=obj;
          this.objs.push(obj);
          this.trees++;
        }
      } else if(t.e.type==types.GRASS && rndNo(0,100) > 98 && (this.rocks<maxRocks)) {
        if(!nearCastle(t.e.x, t.e.y-t.drop-10, this.cen)){
          obj = new entity(16, 16, t.e.x, t.e.y-t.drop-10, 0, types.ROCK, "", scale, false, 3);
          obj.parent=t;
          t.obj=obj;
          this.objs.push(obj);
          this.rocks++;
        }
      }
    });

    // Add a simple castle
    // Castle looks great! Very, uh, can't find the right word, but, like,
    // it means business, you know? No nonsense castle vibe, fortification lvl 99
    let cx =  this.cen.x;
    let cy =  this.cen.y;
    buildTower(this.castle, cx+5, cy-86, 4, 0, 16, true, types.CST, true); // Back Right Tower
    buildTower(this.castle, cx-10, cy-64, 1, 0, 16); // Back Left Wall (R)
    buildTower(this.castle, cx-26, cy-56, 1, 0, 16); // Back Left Wall (L)
    buildTower(this.castle, cx-41, cy-64, 4, 0, 16,true, types.CST, true); // Back Left Tower
    buildTower(this.castle, cx+22, cy-64, 1, 0, -16, false); // Right back wall
    buildTower(this.castle, cx+38, cy-56, 1, 0, -16, false); // Right front wall
    buildTower(this.castle, cx+54, cy-64, 4, 0, 16,true, types.CST, true); // Front Right Tower
    buildTower(this.castle, cx+38, cy-24, 2, 0, -16, false); // Front Right Wall (R) OPEN
    buildTower(this.castle, cx+22, cy-18, 2, 0, -16, false); // Front Right Wall (L) OPEN
    buildTower(this.castle, cx-26, cy-8, 3, 0, -16, false); // Front Left Wall (L) CLOSED
    buildTower(this.castle, cx-10, cy, 3, 0, -16, false); // Front Left Wall (R) CLOSED
    buildTower(this.castle, cx+6, cy-40, 4, 0, 16, true, types.CST, true); // Front Left Tower
  }

  const buildTower = (tiles, x, y, count, dx = 0, dy = 8, decrement = true, type=types.CST, tower=false) => {
    const loopInit = decrement ? count - 1 : 0;
    const loopCond = decrement ? (i) => i >= 0 : (i) => i < count;
    const loopChange = decrement ? (i) => --i : (i) => ++i;

    for (let i = loopInit; loopCond(i); i = loopChange(i)) {
      tiles.push(new entity(16, 16, x + dx * i, y + dy * i, 0, type, "", scale, false, 0));
    }
    if(tower){
      tiles.push(new entity(16, 16, x + dx, y + dy - 20, 0, types.CNE, "", scale, false, 0));
    }
};
}
