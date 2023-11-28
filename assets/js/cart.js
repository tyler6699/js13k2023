function Cart() {
  this.cam=new Camera();
  this.tips=true;
  this.time=0;

  // if the window is 800px and your canvas 600px, apply scale(/*800/600 = */ 1.2)
  this.scale = 1;
  this.reset=false;

  // Set up one entity to render test
  this.entity = new Entity(16, 16, 0, 0, 0, types.HERO);

  // Render & Logic
  this.update = function(delta, time, gameStarted=false) {
    this.time+=delta;

    if(gameStarted){ // Game loop
      mg.clear();
      let font = "30px Papyrus";
      writeTxt(ctx, 1, font,"WHITE","Main Game:", canvasW-300, 200);
      // Test drawing one entity
      this.entity.update(delta);
    } else { // Intro Screen
      let fontSize=getResponsiveFontSize(.05);
      mg.clear();
      ctx.save();
      drawBox(ctx,0.8,"black",0,0,canvasW,canvasH)
      let font=`${fontSize}px Arial`;
      writeTxt(ctx, 1, font,"WHITE","Game Title", 30, 90);
      writeTxt(ctx, 1, font,"WHITE",startDelay>0?"Generating World ..":"Press any key to start", 30, canvasH-120);
      writeTxt(ctx, 1, font,"WHITE","INTRO SCREEN " + TIME, 30, 200);
      ctx.restore();
    }
  }
}
