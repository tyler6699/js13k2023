function mob(w, h, x, y, angle, type, mtype, scale, maxHP) {
  this.e = new entity(w, h, x, y, angle, type, "", scale, false, maxHP);
  this.e.parent=this;
  this.mtype=mtype;
  // this.e.bow = new Bow();
  // this.e.bow.rate=rndNo(0,3)+.5-(STAGE/10);

  this.bspd=100;
  this.spd = .5;
  this.time=0;
  this.facing=RIGHT;
  this.e.hands.push(new entity(4, 4, x, y, 0, types.HAND, "", scale, false));
  this.e.hands.push(new entity(4, 4, x, y, 0, types.HAND, "", scale, false));

  this.hit = function(delta, type, power) {
    this.e.hp -= 1+power;
  }

  this.update = function(delta) {
    this.time+=delta/1000;
    let x = this.e.x;
    let y = this.e.y;
    e = this.e;

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
      }

    if(this.e.x > cart.hero.e.x){
          this.e.flip=true;
    } else {
          this.e.flip=false;
    }

    // SHOOTING ARROWS and Attacks
    //this.e.gun.addBullets(this.e.x+32,this.e.y+32,cart.hero.e.x+32,cart.hero.e.y+32,true,this.e.type, this.bspd);
    //this.e.gun.drawBullets(delta, true);
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
