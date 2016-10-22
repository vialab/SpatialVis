var visStates = [], // Saved visualization states
    MAX_STATES = 3, // Maximum number of saved visualization states
    stateIndex = 1; // Index of the saved visualization states

function saveVisState() {    
    var state = new storeState(videoPlayer.currentTime, trackingIndex, shVizFlag, opDetect, shVidFlag, wholePlay, videoSpeed, opVideo, wholeTrail, trailLength, opTrail, shGestFlag, opGestOut, opGestIn, renderHeatmap, animHeatmap, heatLength, shAnnFlag, annColour, monoColour);
    
    if(stateIndex > 3) {
        var exp = stateIndex % 3;
        
        if(exp == 0) {
            visStates[2] = state;
        } else {
            visStates[exp-1] = state;
        }
        
    } else {
        visStates.push(state);
    }
    
    stateIndex++;    
};

// Load the visualization to a previous saved state
function loadVisState(stateNum) {
    var state = visStates[stateNum];
    
    videoPlayer.currentTime = state.vidTime;
    shVizFlag = state.showVis;
    opDetect = state.opPoint;
    shVidFlag = state.showVideo;
    wholePlay = state.playEntire;
    d3.select('#videoSpeedCont')[0][0].value = state.videoSpeed;
    opVideo = state.opVideo;
    wholeTrail = state.allTrail;
    trailLength = state.trailLen;
    opTrail = state.opTrail;
    shGestFlag = state.showGests;
    opGestOut = state.opOutGest;
    opGestIn = state.opInGest;
    
    
    if(renderHeatmap != state.renderHeat) {
        if(heatmap) {
            heatmap.toggleDisplay();
        }
    }
    renderHeatmap = state.renderHeat;
    
    
    animHeatmap = state.animHeat;
    heatLength = state.heatLen;
    shAnnFlag = state.showAnn;
    annColour = state.annCol;
    monoColour = state.monoCol;
    
    toggleVis();
    d3.select('#transDetect')[0][0].value = opDetect;
    toggleVideo();
    toggleWholePlay();
    setVideoSpeed();
    d3.select('#vidOSlider')[0][0].value = opVideo;
    d3.select('#myVideo').style('opacity', opVideo);
    toggleWholeTrail();
    d3.select('#trailLengthCont')[0][0].value = trailLength;
    d3.select('#transTrail')[0][0].value = opTrail;
    toggleGestures();
    d3.select('#gestOutSlider')[0][0].value = opGestOut;
    d3.select('#gestInSlider')[0][0].value = opGestIn;
    toggleHeatmap();
    toggleUseTotalHeat();
    
    /******************************************
    **********************************************
    TODO
    Include toggleHeatAnimation()
    animHeatmap = state.animHeat;
    ************************************************
    ************************************************/
    
    d3.select('#heatLengthCont')[0][0].value = heatLength;
    toggleAnnotations();
    d3.select('#annoColour')[0][0].value = annColour;
    d3.select('#annoColour').style('background-color', annColour);
    toggleMono();

};


// Save the current visualization's state
function storeState(vidTime, tipIndex, showVis, opPoint, showVideo, playEntire, videoSpeed, opVideo, allTrail, trailLen, opTrail, showGests, opOutGest, opInGest, renderHeat, animHeat, heatLen, showAnn, annCol, monoCol) {
    
    this['vidTime'] = vidTime;
    this['tipIndex'] = tipIndex;
    this['showVis'] = showVis;
    this['opPoint'] = opPoint;
    this['showVideo'] = showVideo;
    this['playEntire'] = playEntire;
    this['videoSpeed'] = videoSpeed;
    this['opVideo'] = opVideo;
    this['allTrail'] = allTrail;
    this['trailLen'] = trailLen;
    this['opTrail'] = opTrail;
    this['showGests'] = showGests;
    this['opOutGest'] = opOutGest;
    this['opInGest'] = opInGest;
    this['renderHeat'] = renderHeat;
    this['animHeat'] = animHeat;
    this['heatLen'] = heatLen;
    this['showAnn'] = showAnn;
    this['annCol'] = annCol;
    this['monoCol'] = monoCol;
};