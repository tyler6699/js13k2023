function Projectile(x, y, targetX, targetY, speed) {
    this.x = x;
    this.y = y;
    // Calculate the direction to the target
    let dx = targetX - x;
    let dy = targetY - y;
    let len = Math.sqrt(dx * dx + dy * dy);
    this.dx = dx / len * speed;
    this.dy = dy / len * speed;
    this.angle = Math.atan2(dy, dx);

    this.update = function(delta) {
        this.x += this.dx;
        this.y += this.dy;
        // Handle collisions and other logic
    };

    this.draw = function(ctx) {
      ctx.save();
      ctx.translate(cart.cam.x, cart.cam.y);
      ctx.translate(this.x+8, this.y+1.5);
      ctx.rotate(this.angle);
      ctx.translate(-8, -1.5);
      ctx.fillRect(0, 0, 16, 3);
      ctx.restore();
    };
}
