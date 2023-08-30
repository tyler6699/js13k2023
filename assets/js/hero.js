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
  let dirs={right:0,left:0,up:0,down:0}
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
  this.weapon=4; // 0 Sword, 1 Hammer, 2 Ax, 4 Hands
  this.eWep=new entity(10, 10, x, y, 0, types.SWD, "", scale);
  this.eWep.setType();
  this.wepPower=0;
  this.attackTime=0;

  // Hands
  const swipeRadius = 30;  // The distance of the arc's radius
  const swipeSpeed = 0.2;  // Speed at which the swipe progresses
  let theta = 0;  // This is the angle that will increase over time
  this.punchProgress = 0;
  let punch=false;
  let hState = 'idle';
  this.hState=hState;
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
        this.moved=true;
      }

      if (up()){
        this.e.y -= this.gMove(0,-1);
        lastDir=UP;
      }

      if (down()){
        this.e.y += this.gMove(0,1);
        lastDir=DOWN;
      }

      if (left()){
        this.e.x -= this.gMove(-1,0);
        if((hState != 'punch' && hState != 'retracting')) this.e.flip = true;
        lastDir=LEFT;
      }

      if (right()){
        this.e.x += this.gMove(1,0);
        if((hState != 'punch' && hState != 'retracting')) this.e.flip = false;
        lastDir=RIGHT;
      }

      // SWORD
      if(one()&&this.weapon!=0)this.setWeapon(0,types.SWD);
      // HAMMER
      if(two()&&this.weapon!=1)this.setWeapon(1,types.HAM);
      // AXE
      if(three()&&this.weapon!=2)this.setWeapon(2,types.AX,true);
      //HANDS
      if(four()&&this.weapon!=4)this.setWeapon(4,types.HAND);
    }

    // idle check
    if(up()||space()||one()||right()||left()) idle=0;
    //if(idle>3){ }

    // Particles
    for (let i = 0; i <= this.particles.length-1; i++){
      this.particles[i].update(ctx,delta);
    }

    // HANDS CONSTANTS
    this.punchDistance = 65;
    this.punchSpeed = 5;

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
    this.hands[0].y= this.moved? 29 + offsin + waterY : 29 + sin + waterY;
    this.hands[1].y = 29 + sin + waterY;

    // Weapon Position
    this.setWeaponX(delta);
    this.setWeaponY();

    // Hand logic
    if(space() && (hState=='idle' || hState=='spin' || hState=='swipe')){
      switch (hState) {
        case 'idle':
          if(this.weapon==4){ // HANDS
            hState = 'spin';
          } else { // SWORD, AXE, HAMMER
            hState = 'swipe';
          }
          break;

        case 'spin':
          theta += .8; // .8 is speed
          this.hands[1].x += 4 * Math.cos(theta); // 4 is Distance from pivot to hand's center
          this.hands[1].y += 4 * Math.sin(theta);

          if (theta >= 2 * Math.PI) { // If a full circle is achieved, prepare for punch
            theta = 0;
            punch = true;
            this.punchProgress = 0;
          }
          this.chargeUp();
          break;
      }
    } else { // Button is not down
      // If Hands
      if (punch) {
        this.punchProgress += this.punchSpeed;
        this.hands[1].x = this.punchProgress;
        this.hands[1].scale += 0.1;
        this.eWep.scale += 0.1;
        hState = 'punch';

        if (this.punchProgress >= this.punchDistance) {
          hState = 'retracting';
          punch = false;
          this.wepPower=0;
        }
      }

      switch (hState) {
        case 'idle':
          this.wepPower=0;
          break;
        case 'swipe':
          hState = 'retracting'
          break;
      }
    }

    // Do I need these?
    cenX = this.e.x-this.e.mhWScld;
    cenY = this.e.y-this.e.mhHScld;

    // remove after testing
    this.hState=hState;
  } // End of Update

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

  this.setWeaponX = function(delta){
    switch(this.weapon){
      case 0: // SWORD
        if(hState=='idle')this.eWep.angle=lastDir==RIGHT?80:45;
        if(hState=="swipe"){
          this.chargeUp();
          if(lastDir==RIGHT){
            if(this.eWep.angle>10)this.eWep.angle-=3;
          } else {
            if(this.eWep.angle<90)this.eWep.angle+=3;
          }
        }
        if(hState=='retracting') this.retract();
        this.eWep.x=this.e.x+this.hands[1].x+1;
        break;
      case 1: // HAMMER
        if(hState=="idle")this.eWep.angle=lastDir==RIGHT?70:30;
        if(hState=="swipe"){
          this.eWep.angle=this.eWep.angle=lastDir==RIGHT?30:70;
          this.hands[0].y-=10;
          this.hands[1].y-=7;
        };
        if(hState=='retracting') this.retract();
        this.eWep.x=lastDir==RIGHT?this.e.x+this.hands[1].x+1:this.e.x+this.hands[1].x-20;
        this.hands[1].x = 30;
        break;
      case 2: // AXE
        if(hState=="idle")this.eWep.angle=30;
        if(hState=="swipe"){
          this.eWep.angle=90;
          this.hands[0].y-=10;
          this.hands[1].y-=7;
        };
        if(hState=='retracting') this.retract();
        this.eWep.flip=lastDir==RIGHT;
        this.hands[1].x = 30;
        this.eWep.x=lastDir==RIGHT?this.e.x+this.hands[0].x+1 : this.e.x+this.hands[0].x-40;
        break;
      case 4: // HANDS
        if(hState=='retracting'){
          this.punchProgress -= this.punchSpeed;
          this.hands[1].x = this.punchProgress;
          this.hands[1].scale -= 0.1;
          this.eWep.scale -= 0.1;
          if (this.punchProgress <= 0) {
            this.punchProgress = 0;
            hState = 'idle';
          }
        }
        break;
    }
  }

  this.setWeaponY=function(){
    if(hState=="idle"||hState=="swipe"){
      // Weapon position in hands
      let h=lastDir==RIGHT?0:1;
      this.eWep.y=this.hands[h].y+this.e.y-this.e.z-17;
    }
  }

  this.chargeUp=function(){
    this.wepPower=this.wepPower>=10?10:this.wepPower+=1;
  }

  this.retract=function(){
    let h=lastDir==RIGHT?1:0;
    this.eWep.y=this.hands[h].y+this.e.y-this.e.z-17;
    if(this.eWep.type==types.AX){
      this.eWep.angle=330;
    } else if(this.eWep.type==types.HAM) {
      this.eWep.angle=lastDir==RIGHT?120:330;
    } else if(this.eWep.type==types.SWD) {
      if(lastDir==RIGHT){
        this.eWep.angle=lerp(this.eWep.angle,120,.8);
      } else {
        console.log(this.eWep.angle);
        this.eWep.angle=330;
      }
    }
    if(this.attackTime>.2){
        hState='idle';
        this.attackTime=0;
    } else {
      this.attackTime+=delta/1000;
    }
  }

  this.setWeapon = function(w,t,f=false){
    if(hState=='idle'){
      this.weapon=w;
      this.eWep.type=t;
      this.eWep.setType();
      this.eWep.flip=f;
      this.eWep.ui=false;
    }
  }

  this.gMove = function(xx,yy, grav=false, jump=false){
    this.e.idle=0;

    rec = cloneRectanlge(this.e.hb);
    rec.w=20; // Fudge a smaller HB
    rec.h=10;
    rec.x += xx * speed;
    rec.y += yy * speed/2;
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
      if(yy!=0){
        return speed/2;
      } else {
        return speed;
      }
    } else {
      return 0;
    }
  }

}
