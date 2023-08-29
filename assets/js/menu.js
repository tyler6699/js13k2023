function menu() {
  this.ui=[];
  // IU AND MENU
  ms=[[-32,types.HAM],[-116,types.SWD],[52,types.AX]];
  for(i=0;i<ms.length;i++){
    this.ui.push(new entity(16, 16, canvasW/2+ms[i][0], canvasH-88, 0, types.UI, "", 4, 0,true,ms[i][1]));
    this.ui.push(new entity(10, 10, canvasW/2+ms[i][0]+14, canvasH-80, 0, ms[i][1], "", 4, true));
  };

  for(i=0;i<5;i++){
    this.ui.push(new entity(16, 16, 20+(i*32), 0, 0, types.HP, "", 4, true));
  }

  this.ui.push(new entity(6, 16, 212, 0, 0, types.HPE, "", 4, true));
  m=new entity(6, 16, 0, 0, 0, types.HPE, "", 4, true);
  m.flip=true;
  this.ui.push(m);

  this.tick=function(){
    this.ui.forEach((e) => {
      if(e.type == types.UI){
        if(processClick){
          if(rectColiding(e.hb,clickedRec)){
            processClick=false;
            cart.hero.setWeapon(1,e.weapon);
          }
        }
      }
    });
  }
}
