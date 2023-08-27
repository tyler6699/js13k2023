function hero(w, h, x, y, angle, type, scale) {
  this.e = new entity(w, h, x, y, angle, type, "", scale, false, 100);
  this.e.z = 24; // Hero always starts on raised ground. Calculate this if island layout changes
  this.active=true;
  this.hp=2;
  this.particles=[];
  let curTile=null;
  let prevTile=null;
  let airTime=0;
  let idle=0;
  let speed=0;
  let maxSpeed=3;
  let lastDir = RIGHT;
  let prevPos={x: this.e.x, y: this.e.y};
  let runtime=0;
  let respawnTime=0;
  let cenX=0;
  let cenY=0;
  let offScreen=false;
  this.time=0;
  this.deaths=0;
  this.done=false;
  this.changeLevel=false;
  this.moved=false;
  this.weapon=0; // 0 Sword, 1 Hammer, 2 Ax
  // Hands
  let theta = 0;  // This is the angle that will increase over time
  let punchProgress = 0;
  let punch=false;
  let handState = 'idle';
  // BODY
  this.hands = [];
  this.hands.push(new entity(4, 4, x, y, 0, types.HAND, "", scale, false));
  this.hands.push(new entity(4, 4, x, y, 0, types.HAND, "", scale, false));

  this.update = function(ctx, delta){
    this.time+=delta;
    idle+=delta;
    this.moved=false;
    // Controls
    if(this.active){
      if(!left() && !right() && !up() && !down()){
        speed = 0;
        runtime = 0;
      } else {
        runtime += delta;
      }

      if (up()){
        this.e.y -= this.gMove(0,-1);
        this.moved=true;
      }

      if (down()){
        this.e.y += this.gMove(0,1);
        this.moved=true;
      }

      if (left()){
        this.e.x -= this.gMove(-1,0);
        this.e.flip = true;
        this.moved=true;
      }

      if (right()){
        this.e.x += this.gMove(1,0);
        this.e.flip = false;
        this.moved=true;
      }

      if(one()&&this.weapon!=1){
        this.weapon=1;
      }

      if(two()&&this.weapon!=2){
        this.weapon=2;
      }

      if(three()&&this.weapon!=3){
        this.weapon=3;
      }
    }

    // idle check
    if(up()||space()||one()||right()||left()) idle=0;
    if(idle>3){

    }

    // Particles
    for (let i = 0; i <= this.particles.length-1; i++){
      this.particles[i].update(ctx,delta);
    }

    // Hero Draw
    //this.e.update(delta);

    if(runtime>.35) this.addDust();

    // Remove Particles
    // this.particles = this.particles.filter(function (p) {
    //   return p.remove == false;
    // });

    // HANDS CONSTANTS
    const punchDistance = 65;
    const punchSpeed = 5;

    // hands move when in water
    const waterY = this.e.wet ? -6 : 0;

    // Calculate the sine value based on elapsed time
    const amount = this.moved ? 0.01 : 0.003;
    const sin = Math.sin(this.time * amount) * 1.7;
    const offsin = Math.sin(this.time * amount + Math.PI) * 1.7;

    // Set X position for both hands
    this.hands[0].x = 30;
    this.hands[1].x = 9;

    // Calculate Y position based on movement state
    if (this.moved) {
        this.hands[0].y = 29 + offsin + waterY;
    } else {
        this.hands[0].y = 29 + sin + waterY;
    }
    this.hands[1].y = 29 + sin + waterY;

    // Handle hands' actions
    if (one() && (handState == "idle" || handState == "spin")) {
        handState = 'spin';
        // 4 is Distance from pivot to hand's center
        theta += .8; // .8 is speed
        this.hands[1].x += 4 * Math.cos(theta);
        this.hands[1].y += 4 * Math.sin(theta);

        // If a full circle is achieved, prepare for punch
        if (theta >= 2 * Math.PI) {
            theta = 0;
            punch = true;
            punchProgress = 0;
        }
    } else {
      if (punch) {
        punchProgress += punchSpeed;
        this.hands[1].x = punchProgress;
        this.hands[1].scale += 0.1;
        handState = 'punch';

        if (punchProgress >= punchDistance) {
            handState = 'retracting';
            punch = false;
        }
      } else if (handState == 'retracting') {
        punchProgress -= punchSpeed;
        this.hands[1].x = punchProgress;
        this.hands[1].scale -= 0.1;

        if (punchProgress <= 0) {
          punchProgress = 0;
          handState = 'idle';
        }
      }
    }
    // HANDS

    // Do I need these?
    cenX = this.e.x-this.e.mhWScld;
    cenY = this.e.y-this.e.mhHScld;
  }

  this.reset = function(){
    this.done=false;
    this.particles=[];
    this.hp=2;
    let lvl=cart.levels[this.e.curLevel];
    this.e.x=lvl.startPos[0];
    this.e.y=lvl.startPos[1];
  }

  this.kill = function(){
    if(this.active){
      this.deaths++;
      cart.shakeTime=.15;
      playSound(DIEFX,1);
      this.hp--;
      this.active=false;
      respawnTime=.5;
      speed=0;
      this.e.sy=16;

      if(this.hp==0){this.hp++;}
    }
  }

  this.setCurrentTile = function(scaled) {
    if(this.moved){
      prevTile=curTile;
      // Convert hero's Cartesian position to grid position
      const gridX = (this.e.x) / scaled;
      const gridY = (this.e.y+this.e.height*2+this.e.z) / scaled * 2;

      // Convert this grid position to isometric grid position based on your setup
      const isoGridRow = gridY - gridX;
      const isoGridCol = gridX + gridY;

      heroRow = Math.floor(isoGridRow);
      heroCol = Math.floor(isoGridCol);

      heroTileIndex = heroCol + (cart.levels[this.e.curLevel].cols * heroRow);

      curTile = cart.level.tiles[heroTileIndex];
      // Deal with the elevation
      if (curTile && prevTile && curTile.id !== prevTile.id) {
          // Changed Tiles
          if (prevTile.up !== curTile.up) {
            this.e.z = -curTile.up*.25;
          }
      }
    }
    // Hero Speed based on the tile
    if(curTile != null){
      if(curTile.e.type==types.WTR){
        speed=1;
        this.e.wet=true;
      } else if(curTile.e.type==types.SEA){
        speed=.25;
        this.e.wet=true;
      } else {
        speed=maxSpeed;
        this.e.wet=false;
      }
    }
  }

  this.addDust = function(both=false){
    runtime = 0;
  }

  this.jump = function(){
    // Jump Code
  }

  this.gMove = function(xx,yy, grav=false, jump=false){
    this.e.idle=0;

    rec = cloneRectanlge(this.e.hb);
    rec.w=20; // Fudge a smaller HB
    rec.h=10;
    rec.x += xx * speed;
    rec.y += yy * speed;
    canMove = true;

    for (var t = 0; t < cart.level.objs.length; t++) {
      obj = cart.level.objs[t];
      if(obj!=null){
        if(rectColiding(obj.hb,rec)&&obj.type!=2){
          if(obj.isSolid){
            canMove = false;
            break;
          }
        }
      }
    }
    if(canMove){
      return speed;
    } else {
      return 0;
    }
  }

}
