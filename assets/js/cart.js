function Cart() {
  var totalWidth = 800;
  var totalHeight = 600;
  var widthToHeight = 4 / 3;
  var newWidthToHeight = totalHeight / canvasH;
  var resize=true;
  this.cam=new Camera();
  this.ratio=1;
  this.tips=true;
  this.time=0;

  if (canvasW > totalWidth) {
    this.ratio=canvasW / totalWidth;
  } else {
    this.ratio=canvasH / totalHeight;
  }

  // if the window is 800px and your canvas 600px, apply scale(/*800/600 = */ 1.2)
  this.scale = 1;
  this.reset=false;

  // Menu

  // Render & Logic
  this.update = function(delta, time, gameStarted=false) {
    this.time+=delta;

    if(gameStarted){
      // Game loop
      mg.clear();
      let font = "30px Papyrus";
      writeTxt(ctx, 1, font,"WHITE","Main Game:", canvasW-300, 200);
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
