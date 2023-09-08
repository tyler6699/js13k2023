function entity(w, h, x, y, angle, type, colour, scale, isButton = false, maxHP = 0,weapon=0) {
  this.weapon = weapon;
  this.scale = scale;
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
  this.colour = colour;
  this.image = atlas;
  this.alpha = 1;
  this.currentTile=0;
  this.isSolid = false;
  this.isButton = isButton;
  this.time=0;
  this.maxHP=maxHP;
  this.hp=this.maxHP;
  this.flip=false;
  this.idle=0;
  this.offsetY=0;
  this.parent=null;
  this.wet=false;
  this.ui=false;
  this.hands = [];
  this.dead=false;

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
    this.idle+=delta/1000;
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

      if(cart.shakeTime>0){ctx.translate(cart.shake,cart.shake);}

      if(this.ui){
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (this.flip){
          ctx.scale(-1, 1);
          ctx.translate(-w*s,0);
        }

        ctx.drawImage(img, this.sx, this.sy, w, h, this.x, this.y, w*s, h*s);
      } else {
        // Camera Tracking
        ctx.translate(cart.cam.x,cart.cam.y);

        // Animate Image
        if (this.image == null) {
          ctx.fillStyle = this.colour;
          ctx.fillRect((mhw *.5) * s, (mhh * .5) * s, (w * .5) * s, (h * .5) * s);
        // Image
        } else {
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

          if(this.wet) h-=2;
          // HERO
          if(this.isHero()&&!shadow){
            // Draw the hands, hair etc, weapon
            cart.hero.hands.forEach((i) => {
                ctx.drawImage(img, i.sx, i.sy, i.width, i.height, i.x, i.y, i.width*i.scale, i.height*i.scale);
            });

            // Hero
            if(cart.hero.dance){
              ctx.shadowColor = "gold";  // Shadow color
              ctx.shadowBlur = 10;        // Shadow blur level
            }

            // Show some blood
            if(cart.hero.isGad){
              ctx.shadowColor = "red";
              ctx.shadowBlur = 20;
            }

            // Render HERO
            ctx.drawImage(img, this.sx, this.sy, w, h, hw+z, hh, w * s, h * s);

            if(shift()){
              let sh = cart.hero.shield;
              ctx.drawImage(img, sh.sx, sh.sy, sh.width, sh.height, sh.x, sh.y, sh.width*sh.scale, sh.height*sh.scale);
            }

            if(cart.hero.renderPower){
              ctx.globalAlpha = cart.hero.wepPower>2?cart.hero.wepPower/10:0;
              // Draw power up
              let f=cart.hero.wepPower<10;
              // Patch the issue rather than fixing :D
              let arcX=cart.hero.facing==RIGHT?w*s-10:w*s-20;
              let arcY= -h+10;

              // Draw the arc
              if(cart.hero.facing!=RIGHT){
                ctx.scale(-1, 1);
                ctx.translate(-(w*s),0);
              }
              ctx.beginPath();
              ctx.arc(arcX, arcY, 20, Math.PI, 2 * Math.PI);
              ctx.lineWidth = f?10:15; // Width of the line, adjust if needed

              // Fill based on power
              let gradient = ctx.createLinearGradient(arcX - 20, arcY, arcX + 20, arcY);
              gradient.addColorStop(0, f?'#0a910f':'#fff'); // Start color (you can change it)
              gradient.addColorStop(cart.hero.wepPower / 10, '#db6532'); // Color at the end of the power level
              let val = cart.hero.wepPower / 10 + 0.01 > 1 ? 1 : cart.hero.wepPower / 10 + 0.01;
              gradient.addColorStop(val, f?'#06062e':'#db6532'); // Rest of the arc

              ctx.strokeStyle = gradient;
              ctx.stroke();
            }

          } else {
            // Where all entities get drawn
            if(shadow){
              ctx.scale(1,-1);
              ctx.shadowColor = "#000";  // Shadow color
              ctx.shadowBlur = 8;        // Shadow blur level
              ctx.globalAlpha = 0.1;
              let yoff=this.isHero()?3.2:3.6;
              ctx.drawImage(shadowImage, this.sx, this.sy, w, h, hw+z, -yoff*h, w * s, h * s);
            } else {
              if((this.type==types.ROCK || this.type==types.TREE) && STAGE < 5){
                ctx.shadowColor = "gold";  // Shadow color
                ctx.shadowBlur = 10;        // Shadow blur level
              }
              ctx.drawImage(img, this.sx, this.sy, w, h, hw+z, hh, w * s, h * s);

              // MOB
              if(this.type==types.SKELLY || this.type==types.GOB){
                this.hands.forEach((i) => {
                    ctx.drawImage(img, i.sx, i.sy, i.width, i.height, i.x, i.y, i.width*i.scale, i.height*i.scale);
                });
              }

              if(this.type==types.SKELLY || this.type==types.GOB || this.type==types.ROCK || this.type==types.TREE){
                //Draw HP
                if(this.hp < this.maxHP && this.alpha==1){
                  ctx.globalAlpha = .7;
                  ctx.fillRect(8, -15, 26, 10);
                  ctx.fillStyle = this.type==types.ROCK? "#ededed" : "#E15353";
                  ctx.fillStyle = this.type==types.TREE? "green" : ctx.fillStyle;
                  ctx.fillRect(10, -13, (22/this.maxHP)*this.hp, 6);
                }
              }
            }
          }
        }
      }

      ctx.restore();
    }
    this.cenX=this.x-this.mhWScld;
    this.cenY=this.y-this.mhHScld;
  }

  this.isHero = function(){
    return this.type == types.HERO;
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
      case types.BRDE:
        this.sx=32;
        break;
      case types.WTR:
        this.sx=48;
        break;
      case types.SEA:
        this.sx=48;
        break;
      case types.AIR:
        this.sx=144;
        break;
      case types.SND:
        this.sy=16;
        break;
      case types.TREE:
        this.isSolid = true;
        this.sx=80;
        break;
      case types.ROCK:
        this.isSolid = true;
        this.sx=64;
        break;
      case types.CST:
        this.isSolid = true;
        this.sx=64;
        this.sy=16;
        break;
      case types.CNE:
        this.sx=48;
        this.sy=16;
        break;
      case types.UI:
        this.ui=true;
        this.sy=32;
        break;
      case types.HAM:
        this.sx=16;
        this.sy=33;
        this.ui=true;
        break;
      case types.SWD:
        this.sx=26;
        this.sy=33;
        this.ui=true;
        break;
      case types.AX:
        this.sx=36;
        this.sy=32;
        this.ui=true;
        break;
      case types.HP:
        this.sx=48;
        this.sy=32;
        this.ui=true;
        break;
      case types.HPE:
        this.sx=64;
        this.sy=32;
        this.ui=true;
        break;
      case types.HAND:
        this.sx=71;
        this.sy=42;
        this.ui=true;
        break;
      case types.SKELLY:
        this.sx=96;
        this.sy=16;
        break;
      case types.GOB:
        this.sx=83;
        this.sy=33;
        break;
      case types.GRAVE:
        this.sx=85;
        this.sy=23;
        break;
      case types.SHIELD:
        this.sx=77;
        this.sy=32;
        break;
      case types.STUMP:
        this.sx=81;
        this.sy=23;
        break;
    }
  }

  this.setType();
}
