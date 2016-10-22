var lx=900, hx=0, ly=900, hy=0;

for(var i in jsonData) {
        for(var j in jsonData[i].hands){
              var numPointables = jsonData[i].hands[j].pointables.length;

          for(var k = 0; k < numPointables; k++) {
            var p = jsonData[i].hands[j].pointables[k];
            
            // Make sure tip positions are valid (not (0, 0, 0))
            var tipsXYZ = checkStableTip(p.stableTipPos.x, p.stableTipPos.y, p.stableTipPos.z, p);
            
            var x = tipsXYZ[0],
                y = tipsXYZ[1],
                z = tipsXYZ[2];
           
            
            var newCoord = changeCoord(x, y, z);
            x = newCoord[0]; y = newCoord[1];

            if(x < lx) { lx = x;}
            if(x > hx) { hx = x;}
           if(y < ly) { ly = y;}
           if(y > hy) { hy = y;} 
          if(x > 1300){ 
             console.log(jsonData[i].time + ' big x');
          } else if(x < 0) {
            console.log(jsonData[i].time + ' small x');
          }

          if(y > 864) { 
                console.log(jsonData[i].time + ' big y');    
          } else if(y < 0) {
              console.log(jsonData[i].time + ' small y');    
          }
      }
  }
}
console.log(lx + ' ' + hx + ' ' + ly + ' ' + hy);