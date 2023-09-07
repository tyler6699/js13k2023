function mob(w, h, x, y, angle, type, mtype, scale, maxHP) {
  this.e = new entity(w, h, x, y, angle, type, "", scale, false, maxHP);
  this.e.parent=this;
  this.mtype=mtype;
  this.lastShotTime = 0;  // Initialize a timer variable
  this.spears=[];
  this.bspd=100;
  this.spd = .3;
  this.time=0;
  this.facing=RIGHT;
  this.e.hands.push(new entity(4, 4, x, y, 0, types.HAND, "", scale, false));
  this.e.hands.push(new entity(4, 4, x, y, 0, types.HAND, "", scale, false));
  this.shotDelay=1+rndNo(0,5);
  this.dead=false;

  this.hit = function(delta, type, power) {
    this.e.hp -= 1+power;
  }

  this.update = function(delta) {
    this.time+=delta/1000;
    let x = this.e.x;
    let y = this.e.y;
    e = this.e;

    if(e.hp<=0){ // dead
      if(!this.dead){
        zzfx(...[2.02,,164,.01,.05,.01,,.96,-5.1,,,-0.01,,,,.3,.12,.53,.04,.01]); // Shoot 130 - Mutation 2
        this.dead=true;
      }

      e.x-= Math.cos(this.time*1000 * 0.008)*2;
      e.y-=0.7;
      e.alpha=e.alpha-0.03>0?e.alpha-=0.03:0;
    } else {
      let sin = Math.sin(this.time*500 * 0.008) * 1.7;
      e.hands[0].y = 25+sin;
      e.hands[1].y = 25-sin;
      e.hands[0].x = 25;
      e.hands[1].x = 15;

      let steerPow = this.steerFromNearbyMobs(cart.level.mobs, 26);
      if(this.mtype==mobtype.FOLLOW){
        // basic follow with steering
        e.y = y < cart.hero.e.y ? y += this.spd/2 + steerPow.y : y += -this.spd/2 + steerPow.y;
        e.x = x < cart.hero.e.x ? x += this.spd + steerPow.x : x += -this.spd + steerPow.x;
      } else if(this.mtype==mobtype.RANGED){
        // Check the distance between the Goblin and the hero
        let dist = Math.sqrt(Math.pow(this.e.x - cart.hero.e.x, 2) + Math.pow(this.e.y - cart.hero.e.y, 2));

        // If the distance is less than 100, move the Goblin away from the hero
        if (dist < 120) {
            let dx = this.e.x - cart.hero.e.x;
            let dy = this.e.y - cart.hero.e.y;

            // Normalize the direction vector
            let mag = Math.sqrt(dx * dx + dy * dy);
            dx /= mag;
            dy /= mag;

            // Move the Goblin away from the hero
            this.e.x += dx * this.spd*.8;
            this.e.y += dy * this.spd*.8;
          } else {
              e.y = y < cart.hero.e.y ? y += this.spd/4 + steerPow.y : y += -this.spd/4 + steerPow.y;
              e.x = x < cart.hero.e.x ? x += this.spd/2 + steerPow.x : x += -this.spd/2 + steerPow.x;
          }

          // Projectile
          if (this.time - this.lastShotTime >= this.shotDelay) {
              // Create a new projectile towards the hero
              let proj = new Projectile(this.e.x+20, this.e.y+20, cart.hero.e.x+16, cart.hero.e.y+16, 2.5); // speed of 5, adjust as needed
              this.spears.push(proj);
              this.lastShotTime = this.time;
              // SOUND
              if(rndNo(0,100)>50){
                zzfx(...[1.02,,947,.04,.05,.14,2,.8,-1.1,-0.4,-100,.04,-0.01,,,,.01,.6,.02,.1]);
              } else {
                zzfx(...[1.02,,947,.04,.06,.14,2,.8,-1.1,-0.4,-100,.04,-0.01,,,-0.1,.01,.6,.02,.1]);
              }
          }
        }

      if(this.e.x > cart.hero.e.x){
        this.e.flip=true;
      } else {
        this.e.flip=false;
      }

      // Update and draw all spears
      for(let i = 0; i < this.spears.length; i++) {
          this.spears[i].update(delta);
          this.spears[i].draw(ctx);
      }
    }
  }

  this.steerFromNearbyMobs = function(allMobs, maxDist) {
    let steerX = 0;
    let steerY = 0;
    let count = 0;

    for(let i = 0; i < allMobs.length; i++) {
        let mob = allMobs[i];
        let d = Math.sqrt(Math.pow(this.e.x - mob.e.x, 2) + Math.pow(this.e.y - mob.e.y, 2));

        if (mob !== this && d < maxDist) {
            steerX += (this.e.x - mob.e.x);
            steerY += (this.e.y - mob.e.y);
            count++;
        }
    }

    if (count > 0) {
        steerX /= count;
        steerY /= count;
    }

    // Normalize steering force, and adjust its mag
    let mag = Math.sqrt(steerX * steerX + steerY * steerY);
    if (mag > 0) {
        steerX /= mag;
        steerY /= mag;
    }
    return { x: steerX, y: steerY };
  };
}
