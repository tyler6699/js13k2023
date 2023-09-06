function Projectile(x, y, targetX, targetY, speed) {
    this.x = x;
    this.y = y;
    // Calculate the direction to the target
    let dx = targetX - x;
    let dy = targetY - y;
    let len = Math.sqrt(dx * dx + dy * dy);
    this.dx = dx / len * speed;
    this.dy = dy / len * speed;

    this.update = function(delta) {
        this.x += this.dx;
        this.y += this.dy;
        // Handle collisions and other logic
    };

    this.draw = function(ctx) {
        // Draw the projectile, e.g., as a circle
        ctx.save();
        ctx.translate(cart.cam.x, cart.cam.y);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2); // a simple circle
        ctx.fill();
        ctx.restore();
    };
}
