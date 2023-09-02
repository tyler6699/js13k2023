function mob(w, h, x, y, angle, type, scale, maxHP) {
  this.e = new entity(w, h, x, y, angle, type, "", scale, false, maxHP);
  this.e.parent=this;
  this.type=mobtype.FOLLOW;
  // this.e.bow = new Bow();
  // this.e.bow.rate=rndNo(0,3)+.5-(STAGE/10);

  this.bspd=150;
  this.spd = .5;
  this.noX=false;
  this.noY=false;
  this.waitX=1;
  this.waitY=1;
  this.time=0;
  this.tryXSpeed=this.spd;
  this.tryYSpeed=this.spd;
  this.facing=RIGHT;

  this.hit = function(delta, type, power) {
    console.log(delta + " type: " + type + " power: " + power + " HP: " + this.e.hp);
  }

  this.update = function(delta) {
    this.time+=delta/1000;

    if(this.time > 2){
      this.time=0
      this.noX=false;
      this.noY=false;
      this.waitY=0;
      this.waitX=0;
      this.tryXSpeed = rndNo(0,10)>5 ? this.spd : -this.spd;
      this.tryYSpeed = rndNo(0,10)>5 ? this.spd : -this.spd;
    }
    let x = this.e.x;
    let y = this.e.y;

    e = this.e;

    // basic follow
    ny = y < cart.hero.e.y ? y += this.move(0,this.spd) : y += this.move(0,-this.spd);
    nx = x < cart.hero.e.x ? x += this.move(this.spd,0) : x += this.move(-this.spd,0);

    if(this.type == mobtype.FOLLOW){
      if(this.noX && this.waitX>0){
        this.waitX-=delta;
        e.y = y += this.move(0,this.tryYSpeed);
      } else {
        e.y = ny;
      }
      if(this.noY && this.waitY>0){
        this.waitY-=delta;
        e.x = x += this.move(this.tryXSpeed,0);
      } else {
        e.x = nx;
      }
    } else if(this.type==mobtype.SIMPLE){
      e.y = ny;
      e.x = nx;
    }

    if(this.e.x > cart.hero.e.x){
          this.e.flip=true;
    } else {
          this.e.flip=false;
    }

    //e.update(delta);

    // Draw HP
    // if(e.hp < e.maxHP){
    //   drawImg(ctx, e.image, 0, 32, 16, 8, e.x, e.y+(64+10), .8, e.scale);
    //   drawRect(ctx, e.x, e.y+(64+8),16,14,(48/e.maxHP)*e.hp,12,"#00dcf8",.8)
    // }

    // SHOOTING ARROWS and Attacks
    //this.e.gun.addBullets(this.e.x+32,this.e.y+32,cart.hero.e.x+32,cart.hero.e.y+32,true,this.e.type, this.bspd);
    //this.e.gun.drawBullets(delta, true);
  }

  this.move = function(x,y){
    rec = cloneRectanlge(this.e.hb);
    rec.x += x;
    rec.y += y;
    canMove = true;
    amount = x+y;

    // for (var t = 0; t < this.colArr.length; t++) {
    //   obj = this.colArr[t];
    //
    //   if(obj != this.e && obj.isSolid && rectColiding(obj.hb,rec)){
    //     canMove = false;
    //     amount=0;
    //     break;
    //   }
    // }

    if(amount==0){
      if(x != 0){
        this.noX=true;
        this.waitX=.8;
      } else {
        this.noY=true;
        this.waitY=.8;
      }
    } else {
      if(x != 0 && this.waitX==0){
        this.noX=false;
      } else if(this.waitY==0) {
        this.noY=false;
      }
    }

    return amount;
  }

}
