var trailCanvas, // Trail visualization canvas element
    trailCtx,    // canvas 2D context
    pointRadius = 10,   // Radius of initial detection point of pointable
    outGestRad = pointRadius*1.5,   // Radius of outter gesture visualization
    trailLineWidth = 7, // Line width of trail visualization
    tipColour = "#A2322E",  // Colour of the pointable's tips
    initialPointColour = [0, 150, 0], // Colour of initial point detection
    gestureColour = [255, 255, 255], // Colour of gesture event
    lastFrameTips = [], // pointable tips from last frame
    lastTips = [], // pointable tips from last 'trailLength' number of frames
    lastGests = [], // gestures from last 'trailLength' number of frames
    pauseDraw = false, // flag to pause drawing
    restartDraw = false, // flag to restart drawing
    drawingEnded = false, // if the drawing is complete/has ended
    trackingIndex = 0, // frame index 
    lastTrackingIndex = 0, // last frame index
    trailLength = 125,      // number of frames used in the trail visualization
    wholeTrail = false,  // True if the whole trail should be rendered
    opTrail = 0.5,   // Transparency of trail
    opDetect = 0.6, // Transparency of detection starting point of pointable
    opGestOut = 0.15, // Transparency of outer gesture visualization
    opGestIn = 0.6, // Transparency of In gesture visualization
    pointsInFrame, // Coordinates of pointables in current frame
    gestsInFrame;   // Coordinates of gestures in current frame

// Setup trail visualization
function setupTrailVis() {
    trailCanvas = d3.select('#trailCanvas')[0][0];
    trailCtx = trailCanvas.getContext('2d');  
};

// Pause the drawing of tracking data
function pause(){
    pauseDraw = true;
    videoPlayer.pause();
};

// Play the drawing of tracking data
function play(){
    if(videoLoaded) {
        if (drawingEnded) {
            restart();
        } else {
            pauseDraw = false; 
            videoPlayer.play();
            drawPoints(); 
        }
    }
};

// Reset drawing data structures and canvas 
function resetDrawing() {
    lastFrameTips = [];
    lastTips = [];
    lastGests = [];
    trailCtx.clearRect (0, 0, trailCanvas.width, trailCanvas.height);
};

// Clear the canvas and restart the drawing
// of tracking data
function restart(){
    
    if(videoLoaded) {
        pauseDraw = false;
        restartDraw = false;
        drawingEnded = false;
        resetDrawing();
        resetThumb();
        if(brushFlag) cancelBrush();        
        videoPlayer.currentTime = 0;
        trackingIndex = 0;
        //seekLoadVideo(-1);
        setupHeatmap(heatLength);
        videoPlayer.play();
        drawPoints();  
    }
};

// Draw the tracking data
function drawPoints() {
    var timeStart = new Date().getTime()
    getVideoVisData(trackingIndex);
    renderVis();
    
    var trackJustDrawn = trackingIndex;
    trackingIndex++;
    
    // Pause drawing
    if(pauseDraw || restartDraw) {
        if (restartDraw) { restart();};
        return;
    }
    
    if(trackingIndex < jsonData.length){
        
        // Time taken to render points
        var timeTaken = (new Date().getTime()) - timeStart;
                
        var dif = jsonData[trackingIndex].time - jsonData[trackJustDrawn].time;
        dif /= 1000;
        dif -= timeTaken;
        
        if(dif < 0) {
            dif = 0;
        }
        
        var logTime = (jsonData[trackingIndex].time - jsonData[0].time) / 1000000;
        
        if (!scrubberChanged && 
            (videoPlayer.currentTime - logTime > 0.001)) {
            //|| (videoPlayer.currentTime - logTime < -0.1))) {
                videoPlayer.currentTime = logTime;
        }

        setTimeout(function() {
            drawPoints();
        }, dif);
    } else {
        drawingEnded = true;
    }
    
    
};

function getVideoVisData(tIndex) {
    var curFrame = jsonData[tIndex],
        curFrameTips = [];
    
        pointsInFrame = [];        
        gestsInFrame = [];
    
    // Get tip positions
    for(var i in curFrame.hands) {    
        for(var j in curFrame.hands[i].pointables) {
            
            var p = curFrame.hands[i].pointables[j];
            
            // Make sure tip positions are valid (not (0, 0, 0))
            var tipsXYZ = checkStableTip(p.stableTipPos.x, p.stableTipPos.y, p.stableTipPos.z, p);
            var newCoord = changeCoord(tipsXYZ[0], tipsXYZ[1], tipsXYZ[2]),
                lastCoord = null,
                contFlag = 0;   // If the current tip is a continuation from last frame
            
            curFrameTips.push(p.id);
            
            if(lastFrameTips.length > 0 && lastFrameTips.indexOf(p.id) > -1) {
                //if((!forwardDraw && (tIndex + 1) < jsonData.length)
                  //  || forwardDraw) {
                    
                    var lastTrackIndex = tIndex - 1;
                
                    contFlag = 1;                
                    var lastHandP = getOldPointable(p.id, tIndex);
                    var lastP = jsonData[lastTrackIndex].hands[lastHandP.handIndex].pointables[lastHandP.pIndex];

                    // Make sure tip positions are valid
                    var lastFrameXYZ = checkStableTip(lastP.stableTipPos.x, lastP.stableTipPos.y, lastP.stableTipPos.z, lastP);

                    lastCoord = changeCoord(lastFrameXYZ[0], lastFrameXYZ[1], lastFrameXYZ[2]);
                //}
            } 
            
            pointsInFrame.push([newCoord, lastCoord, contFlag]);
        }
    }
    
     lastFrameTips = curFrameTips;
    
    // Add all pointables in current frame to lastTips
    lastTips.push(pointsInFrame);
    // Remove oldest tip so trail of path is small
    while(!wholeTrail) {
        if(lastTips.length > trailLength) {
            lastTips.shift();
        } else {
            break;   
        }
    }
    
    
    // Get Gestures
    if(curFrame.gestureCount > 0) {

        for(var i in curFrame.gestures) {
            //curGestures.push(curFrame.gestures[i]);
            
            var gest = curFrame.gestures[i],
            posArray = null;

            if(gest.pointIDs.length > 0) {
                loop2:
                    for(var k in curFrame.hands){
                        for(var l in curFrame.hands[k].pointables){
                            var myPointable = curFrame.hands[k].pointables[l];

                            if(myPointable.id == gest.pointIDs[0]) {
                                var x = myPointable.stableTipPos.x,
                                    y = myPointable.stableTipPos.y,
                                    z = myPointable.stableTipPos.z;

                                posArray = checkStableTip(x, y, z, myPointable);
                                var xyz = changeCoord(posArray[0], posArray[1], posArray[2]);
                                gestsInFrame.push(xyz);
                                break loop2;
                            }
                        }
                    }
            }
        }
    }
    
    // Add all gestures in current frame to lastGests
    lastGests.push(gestsInFrame);
    // Remove oldest tip so trail of path is small
    while(!wholeTrail) {
        if(lastGests.length > trailLength) {
            lastGests.shift();
        } else {
            break;   
        }
    }   
};

// Render the visualization
function renderVis() {
    if(!wholeTrail) {
        trailCtx.clearRect (0, 0, trailCanvas.width, trailCanvas.height);
    }
    
    renderTrail();
    
    if(shGestFlag) {
        renderGestures();
    }
};

// Render Trail
function renderTrail() {
    if(!wholeTrail || videoSeeked) {

        for(var i in lastTips) {
            for(var j in lastTips[i]){
                var curObj = lastTips[i][j];

                if(curObj[2]) {
                    renderPath(curObj[0], curObj[1]);
                } else {
                    renderPoint(curObj[0][0], curObj[0][1], initialPointColour[0], initialPointColour[1], initialPointColour[2], opDetect);
                }
                
                if(i == lastTips.length - 1) {
                    trailCtx.fillStyle = tipColour;
                    trailCtx.beginPath();
                    trailCtx.moveTo(curObj[0][0] - pointRadius, curObj[0][1]);
                    trailCtx.lineTo(curObj[0][0], curObj[0][1] - pointRadius);
                    trailCtx.lineTo(curObj[0][0] + pointRadius, curObj[0][1]);
                    trailCtx.closePath();
                    trailCtx.fill();
                }
            }

        }
    } else { // Render the whole trail
        for(var i in pointsInFrame){
            var curObj = pointsInFrame[i];

            if(curObj[2]) {
                renderPath(curObj[0], curObj[1]);
            } else {
                renderPoint(curObj[0][0], curObj[0][1], initialPointColour[0], initialPointColour[1], initialPointColour[2], opDetect);
            }
        }
    }
};

// Render Gestures
function renderGestures() {
    var data = null;
    
    if(!wholeTrail || videoSeeked) {
        data = lastGests;
        
        for(var i in data) {
            for(var j in data[i]) {
                renderPoint(data[i][j][0], data[i][j][1], gestureColour[0], gestureColour[1], gestureColour[2], opGestIn);

                trailCtx.fillStyle = 'rgba(' + gestureColour[0] + ', ' + gestureColour[1] + ', ' + gestureColour[2] + ', ' + opGestOut + ')';

                circle(data[i][j][0], data[i][j][1], outGestRad, false, true);
            }
        }
    } else {
        data = gestsInFrame;
        
        for(var i in data) {
            renderPoint(data[i][0], data[i][1], gestureColour[0], gestureColour[1], gestureColour[2], opGestIn);

            trailCtx.fillStyle = 'rgba(' + gestureColour[0] + ', ' + gestureColour[1] + ', ' + gestureColour[2] + ', ' + opGestOut + ')';

            circle(data[i][0], data[i][1], outGestRad, false, true);
        }
    }
};

// Render the path of the pointable tips
function renderPath(newPoints, oldPoints) {
    //console.log(oldPoints[2]);
    //return;
    //var zOld = Math.round(Math.min(Math.max(oldPoints[2], 0), 255)),
     //   zNew = Math.round(Math.min(Math.max(newPoints[2], 0), 255));
    //var zOld = Math.round(oldPoints[2]),
    //    zNew = Math.round(newPoints[2]);
    var grad = trailCtx.createLinearGradient(oldPoints[0], oldPoints[1], newPoints[0], newPoints[1]);
    
    var oldC = getColours(oldPoints[2]),
        newC = getColours(newPoints[2]);
    
    grad.addColorStop(0, 'rgba(' + oldC[0] + ', ' + oldC[1] + ', ' + oldC[2] + ', ' + opTrail + ')');
    grad.addColorStop(1, 'rgba(' + newC[0] + ', ' + newC[1] + ', ' + newC[2] + ', ' + opTrail + ')');
    trailCtx.beginPath();
    trailCtx.shadowBlur = 10; 
    trailCtx.strokeStyle = grad;//'rgba(255, 255, 255, 0.3)';
    trailCtx.shadowColor = grad;//'rgba(255, 255, 255, 1)';
    trailCtx.lineWidth = trailLineWidth;
    trailCtx.moveTo(oldPoints[0], oldPoints[1]);
    trailCtx.lineTo(newPoints[0], newPoints[1]);
    trailCtx.stroke();
    trailCtx.closePath();
};

// Render the first tip position 
// First time the device has tracked this tip
function renderPoint(x, y, r, g, b, a) {
    trailCtx.fillStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    circle(x, y, pointRadius, false, true);
    //trailCtx.fillRect(newPoints[0], newPoints[1], 15, 15);  
};

// Draw circle in canvas
function circle(x, y, radius, direction, fill) {
    var startAngle = (Math.PI/180)*0,
        endAngle = (Math.PI/180)*360;
    trailCtx.beginPath();
    trailCtx.arc(x, y, radius, startAngle, endAngle, direction);
    if(fill) { trailCtx.fill(); }
    trailCtx.closePath();
};

// Get the pointable with the same id, but
// in the previous frame
// Returns an array containing 
// the hand index, and pointable index
function getOldPointable(id, i) {
    var obj = null,
        lFrame = null;
    
    lFrame = jsonData[(i-1)];
    
    
    var handNumber = lFrame.hands.length;

    for(var l = 0; l < handNumber; l++) {
        var numP = lFrame.hands[l].pointables.length;

        for(var m = 0; m < numP; m++) {
            var pointa = lFrame.hands[l].pointables[m];

            if(pointa.id == id) {
                obj = {handIndex: l, pIndex: m};
                return obj;
            }
        }
       
    }
    return obj;
}

// Change the coordinate system from Leap to Canvas
// TODO: find a more empirically derived multiplier
function changeCoord(x, y, z) {
    
    /*var multiplier = 1.8,
        yMult = 1.5,
        newX, newY, newZ;
    
    newX = Math.round((x * multiplier) + trailCanvas.width/2 + trailCanvas.width/16);
    newY = Math.round((-y * yMult) + trailCanvas.height);
    newZ = Math.round(z * multiplier);*/
    
    var multiplier = 4,
        yMult = 4,
        newX, newY, newZ;
    
    newX = Math.round((x * multiplier) + trailCanvas.width/2);
    newY = Math.round((-y * yMult) + trailCanvas.height * 1.9);
    newZ = Math.round(z * multiplier);
    
    var debug = false;
    
    if(debug) {
        if(newX < 0) {
            console.log('x is too small: ' + x);
        } else if(newX > trailCanvas.width) {
            console.log('x is too big: ' + x);   
        } else if(newY < 0) {
            console.log('y is too small: ' + y);
        } else if(newY > trailCanvas.height) {
            console.log('y is too big: ' + y);   
        }
    }
    
    return [newX, newY, newZ];
}

// Check if the stable tip position is (0, 0, 0)
// The probability is very low that this is
// the real tip position
function checkStableTip(x, y, z, p) {
    
    if(x == 0 && y == 0 && z == 0) {
        x = p.tipPos.x; 
        y = p.tipPos.y;
        z = p.tipPos.z;
    }
    
    return [x, y, z];
}

// Get colours based on depth
// From brown (< -200) to blue (> 200)
function getColours(point) {
    var r, g, b; 
    
    if(monoColour) {
        if(point > 200) {
            r = 121;
            g = 0;
            b = 123;
        } else if(point > 150) {
            r = 160;
            g = 0;
            b = 163;
        } else if(point > 100) {
            r = 198;
            g = 0;
            b = 202;
        } else if(point > 50) {
            r = 237;
            g = 0;
            b = 241;
        } else if(point > 0) {
            r = 251;
            g = 25;
            b = 255;
        } else if(point > -50) {
            r = 252;
            g = 65;
            b = 255;
        } else if(point > -100) {
            r = 252;
            g = 104;
            b = 255;
        } else if(point > -150) {
            r = 253;
            g = 143;
            b = 255;
        } else if(point > -200) {
            r = 254;
            g = 182;
            b = 255;
        } else {
            r = 254;
            g = 221;
            b = 255;
        }
    } else {
        if(point > 200) {
            r = 59;
            g = 10;
            b = 57;
        } else if(point > 150) {
            r = 111;
            g = 32;
            b = 140;
        } else if(point > 100) {
            r = 118;
            g = 51;
            b = 199;
        } else if(point > 50) {
            r = 88;
            g = 62;
            b = 240;
        } else if(point > 0) {
            r = 60;
            g = 92;
            b = 247;
        } else if(point > -50) {
            r = 25;
            g = 71;
            b = 224;
        } else if(point > -100) {
            r = 34;
            g = 107;
            b = 140;
        } else if(point > -150) {
            r = 42;
            g = 190;
            b = 199;
        } else if(point > -200) {
            r = 47;
            g = 240;
            b = 200;
        } else {
            r = 56;
            g = 247;
            b = 164;
        }
    }    
    return [r, g, b];
}