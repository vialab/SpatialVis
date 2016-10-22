var heatmap,    // heatmap object
    heatLength = 125,   // Number of frames to use when creating the local heatmaps
    animHeatmap = false,    // use zeroTimeout to animate heatmap
    renderHeatmap = true,  // render heatmap on canvas
    heatCount = 1,    // the count value of each data point
    startHeatIndex = 0,     // The data point to start from
    miniHeatmap,    // the mini heatmap
    firstLoad = true; // global heatmap first loading

function initialHeatmaps(){
    setupHeatmap(jsonData.length);
    setupGlbHeatmap();
};

function setupHeatmap(numHeatFrames) {
    if(heatmap != null) {
        heatmap.clear();    
    } else {
        // configure heatmap
        var config = {
            element: d3.select('#middleContainer')[0][0],
            radius: 15,
            opacity: 50,
            width: canvasWidth,
            height: canvasHeight,
            visible: renderHeatmap,
            css: "z-index: 5; position: absolute; top: 124px; left: 10%",
            canvasId: "heatCanvas"
        };

        heatmap = h337.create(config);
    }   
    
    setTimeout(function() {
        startHeatIndex = lastTrackingIndex;//trackingIndex;
        
        if(startHeatIndex + numHeatFrames > jsonData.length) {
            numHeatFrames -= (startHeatIndex + numHeatFrames) - jsonData.length
        }
        
        loadHeatmapData(startHeatIndex, true, numHeatFrames, heatmap, 1);
    }, 100);
};

function setupGlbHeatmap() {
   
    var configMini = {
        element: d3.select('#options')[0][0],
        radius: 5,
        opacity: 50,
        width: glbStateWidth, //canvasWidth/3,
        height: glbStateHeight, //canvasHeight/3,
        visible: true,
        css: "z-index: 5; position: absolute; top: 260px; right: 15px",
        canvasId: "miniHeatCanvas"
    };

    miniHeatmap = h337.create(configMini);

    // code that is commented out is done inside loadHeatmap
    /*setTimeout(function() {
        var res = 3.668;
        loadHeatmapData(trackingIndex, false, -1, miniHeatmap, res);
    }, 100);*/
};

// Get gestures for heat map visualization
function loadHeatmapData(heatIndex, limited, numFrames, heatmap, divider){
    
    var frame = jsonData[heatIndex];
    
    if(frame.gestureCount > 0) {
        for(var j in frame.gestures) {
            var gest = frame.gestures[j],
                posArray = null;

        loop2:
            for(var k in frame.hands){
                for(var l in frame.hands[k].pointables){
                    var myPointable = frame.hands[k].pointables[l];

                    if(myPointable.id == gest.pointIDs[0]) {
                        var x = myPointable.stableTipPos.x,
                            y = myPointable.stableTipPos.y,
                            z = myPointable.stableTipPos.z;

                        posArray = checkStableTip(x, y, z, myPointable);
                        break loop2;
                    }
                }
            }
            
            if(posArray != null) {
                var xyz = changeCoord(posArray[0], posArray[1], posArray[2]);             
                heatmap.store.addDataPoint(xyz[0]/divider, xyz[1]/divider, heatCount);
                
                if (firstLoad) {
                    var resX = 4;//3.668;
                    var resY = 4;
                    miniHeatmap.store.addDataPoint(xyz[0]/resX, xyz[1]/resY, 5);
                }
            }
        }
    }

    heatIndex++;
        
    if((limited && heatIndex < startHeatIndex + numFrames && heatIndex < jsonData.length) || (!limited && heatIndex < jsonData.length)) {

        if(animHeatmap) {
            setTimeout(loadHeatmapData, 1, heatIndex, limited, numFrames, heatmap, divider);
        } else {
            loadHeatmapData(heatIndex, limited, numFrames, heatmap, divider);
        }
    } else {
        firstLoad = false;
    }
};