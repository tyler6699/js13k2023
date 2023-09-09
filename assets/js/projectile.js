function Projectile(x, y, targetX, targetY, speed) {
    this.x = x;
    this.y = y;
    this.dst = 0;  // initialize it to 0
    this.remove=false;
    this.dud=false;
    // Calculate the direction to the target
    let dx = targetX - x;
    let dy = targetY - y;
    let len = Math.sqrt(dx * dx + dy * dy);
    this.dx = dx / len * speed;
    this.dy = dy / len * speed;
    this.angle = Math.atan2(dy, dx);
    this.hb=new rectanlge(0, 0, 0, 0);

    this.update = function(delta) {
        this.dst += Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        this.x += this.dx;
        this.y += this.dy;

        this.hb.x = this.x;
        this.hb.y = this.y;
        this.hb.w = (5 * 2) - 2 - 10;
        this.hb.h = (5 * 2) - 2;

        if(rectColiding(this.hb, cart.hero.e.hb)){
          if(this.dud){
            cart.level.duds.push(this);
          } else {
            if(!shift()){
              cart.shakeTime=.2;
              cart.hero.hit(3, this);
              this.remove=true;
            } else {
              cart.shakeTime=.2;
              zzfx(...[1.12,,205,,.02,,1,2.25,,-5.5,,,,.2,,.2,,.45,.1,.09]); // Hit 244
              this.dud=true;
              this.dx=+ (Math.random() - .5) * 4;
              this.dy=+ (Math.random() - .5) * 4
              this.dx *= -0.8;
              this.dy *= -0.8;
              this.angle = Math.atan2(this.dy, this.dx);
            }
          }
        }
    };

    this.draw = function(ctx,held) {
      ctx.save();
      ctx.translate(cart.cam.x + this.x, cart.cam.y + this.y);
      // if held point at hero and hide when thrown
      ctx.rotate(this.angle);
      ctx.fillStyle = "#7B3F00";
      ctx.fillRect(0, -1.5, 16, 3);

      // Draw the arrowhead (triangle)
      ctx.fillStyle = "silver";
      ctx.strokeStyle = "#56675B";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(20, 0);    // tip of the arrowhead (middle)
      ctx.lineTo(14, -4);   // upper corner of the triangle
      ctx.lineTo(14, 4);    // lower corner of the triangle
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    this.isSkelly = function(){
      return false;
    }

}
