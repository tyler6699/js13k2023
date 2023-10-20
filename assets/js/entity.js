function entity(w, h, x, y, angle, type, colour, isButton = false) {
  this.type = type;
  this.width = w;
  this.height = h;
  this.mhWidth = w / -2;
  this.mhHeight = h / -2;
  this.mhWScld = (w / -2) * scale;
  this.mhHScld = (h / -2) * scale;
  this.hWidth = w / 2;
  this.hHeight = h / 2;
  this.cenX=x-this.mhWScld;
  this.cenY=y-this.mhHScld;
  this.angle = angle;
  this.x = x;
  this.y = y;
  this.z = 0;
  this.active = true;
  this.image = atlas;
  this.alpha = 1;
  this.isSolid = false;
  this.isButton = isButton;
  this.time=0;
  this.maxHP=maxHP;
  this.flip=false;
  this.offsetY=0;
  this.parent=null;

  // ATLAS Positions
  this.sx=0;
  this.sy=0;

  this.setHitbox = function() {
    this.hb = new rectanlge(0, 0, 0, 0);
    this.sensor = new rectanlge(0, 0, 0, 0);
    if(this.isButton){
      this.hb.w = this.width * 2*this.scale;
      this.hb.h = this.height * 2*this.scale
    }
  }
  this.setHitbox();

  this.updateHitbox = function() {
    // Buttons are rendered the screen size and do not need scaling
    if(this.isButton){
      this.hb.x = this.x - this.width;
      this.hb.y = this.y - this.height;
    } else {
      // Images are all scaled up so hitboxes are also scaled up
      this.hb.x = this.x + (this.scale/2);
      this.hb.y = this.y + (this.scale/2);
      this.hb.w = (this.width * this.scale) - this.scale - 10;
      this.hb.h = (this.height * this.scale) - this.scale;

      this.sensor.x = this.x-5;
      this.sensor.y = this.y-5;
      this.sensor.w = (this.width * this.scale) + 10;
      this.sensor.h = (this.height * this.scale) + 10;
    }
  }

  // Render
  this.update = function(delta, shadow=false) {
    this.updateHitbox();

    if(this.active) {
      ctx.save();
      // Z value user to lift up the hero when on raised land
      ctx.translate(this.x, this.y-this.z);
      ctx.globalAlpha = this.alpha;

      img = this.image;
      s   = this.scale;
      mhw = this.mhWidth;
      mhh = this.mhHeight;
      hw  = this.hWidth;
      hh  = this.hHeight;
      w   = this.width;
      h   = this.height;

      // Screen shake
      if(cart.shakeTime>0){ctx.translate(cart.shake,cart.shake);}

      // Camera Tracking
      ctx.translate(cart.cam.x,cart.cam.y);

      if (this.flip){
        ctx.scale(-1, 1);
        ctx.translate(-(w*s)-w,0);
      } else {
        ctx.scale(1, 1);
      }

      z=0;
      if(this.angle > 0){
        let z=24;
        ctx.translate(z,z);
        ctx.rotate(this.angle*Math.PI/180);
        ctx.translate(-z,-z);
      }

      // HERO
      if(this.isHero()&&!shadow){
        let x=cart.hero;

        // Render HERO
        ctx.drawImage(img, this.sx, this.sy, w, h, hw+z, hh, w * s, h * s);
        if(x.defence>=2)ctx.drawImage(img, 96, 16, 11, 10, 12, 12, 11*s, 10*s);
      } else {
        // Where all entities get drawn
        if(shadow){
          ctx.scale(1,-1);
          ctx.shadowColor = "#000";  // Shadow color
          ctx.shadowBlur = 8;        // Shadow blur level
          ctx.globalAlpha = 0.1;
          let yoff=this.isHero()?3.2:3.6;
          if(this.isSkelly())yoff=3;
          ctx.drawImage(shadowImage, this.sx, this.sy, w, h, hw+z, -yoff*h, w * s, h * s);
        } else {
          ctx.drawImage(img, this.sx, this.sy, w, h, hw+z, hh, w * s, h * s);
        }
      }

      ctx.restore();
    }
    this.cenX=this.x-this.mhWScld;
    this.cenY=this.y-this.mhHScld;
  }


  this.setType = function(){
    this.alpha = 1;
    this.sy=0;
    this.sx=0;
    this.isSolid = false;

    switch(this.type){
      case types.HERO:
        this.isSolid = true;
        this.sx=0;
        this.sy=0;
        break;
      case types.GRASS:
        this.sx=16;
        break;
    }
  }

  this.setType();
}
