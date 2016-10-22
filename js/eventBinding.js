var shVidFlag = true, // Show or hide video
    shVizFlag = true, // Show or hide visualization
    shAnnFlag = true,   // Show or hide annotations
    shGestFlag = true,   // Show or hide gesture visualizations
    useTotDataHeat = false, // Use all data to use in heatmap
    stateFlag1 = false, 
    stateFlag2 = false,
    stateFlag3 = false;
    


// Bind events to functions
function bindEvents() {

    d3.select('#fileInput').on('change', handleFileSelect);
    d3.select('#videoInput').on('change', handleFileSelect);

    // Handle entering and dropping on elements within the middle container 
    d3.select('#middleContainer')
        .on('dragover', handleFileDrag)
        .on('dragleave', handleFileLeave);
    
    d3.select('#dropMask')
        .on('dragleave', handleFileLeave)
        .on('drop', handleFileDrop)
        .on('click', handleMaskClick);


    d3.select('#fileSubmit').on('click', readFile);
    d3.select('#videoSubmit').on('click', readFile);

    d3.select('#logVisContainer')
    .on('drop', cancelDrop)
    .on('dragover', cancelDrop);
    
    // Render entire trail button
    d3.select('#trailFlag').on('click', function() {
        wholeTrail = !wholeTrail;
        toggleWholeTrail();
    });
    
    // Show/Hide video button
    d3.select('#shVideo').on('click', function() {
        shVidFlag = !shVidFlag;
        toggleVideo();
    });
    
    // Show/Hide visualization button
    d3.select('#shViz').on('click', function() {
        shVizFlag = !shVizFlag;
        toggleVis();
    });
    
    // Set the colour of the annotations
    d3.select('#annoColour').on('change', function() {
        annColour = this.value;
    });
    
    // Show/Hide annotations button
    d3.select('#shAnn').on('click', function() {
        shAnnFlag = !shAnnFlag;
        toggleAnnotations();
    });
    
    // Show/Hide gesture visualizations button
    d3.select('#shGest').on('click', function() {
        shGestFlag = !shGestFlag;
        toggleGestures();
    });
    
    // Opacity level of outer gesture visualization
    d3.select('#gestOutSlider').on('change', function() {
        opGestOut = this.value;
    });
    // Opacity level of inner gesture visualization
    d3.select('#gestInSlider').on('change', function() {
        opGestIn = this.value;
    });
    // Length of trail in number of frames
    d3.select('#trailLengthCont').on('change', function() {
        trailLength = parseInt(this.value, 10);
    });
    // Opacity level of trail
    d3.select('#transTrail').on('change', function() {
        opTrail = this.value;
    });
    // Opacity level of initial detection point of pointable
    d3.select('#transDetect').on('change', function() {
        opDetect = this.value;
    });
    // Length of heatmap in number of frames
    d3.select('#heatLengthCont').on('change', function() {
        heatLength = parseInt(this.value, 10);
    });
    // Video speed
    d3.select('#videoSpeedCont').on('change', setVideoSpeed);
    
    // Play entire video or only subsections
    d3.select('#fullVidPlay').on('click', function() {
        wholePlay = !wholePlay;
        toggleWholePlay();
    });
    // Use Timeout to render heatmap
    d3.select('#animHeatFlag').on('click', function() {
        if(animHeatmap) {
            d3.select('#animHeatFlag').classed('off', true);
        } else {
            if(!renderHeatmap) {
                d3.select('#renderHeat').classed('off', false);
                if(heatmap) {
                    heatmap.toggleDisplay();
                }
                renderHeatmap = !renderHeatmap;
            }

            d3.select('#animHeatFlag').classed('off', false);
        }

        animHeatmap = !animHeatmap;
        setupHeatmap(jsonData.length);
    });
    // Render the heatmap
    d3.select('#renderHeat').on('click', function() { 
        if(heatmap) {
            heatmap.toggleDisplay();
        }
        renderHeatmap = !renderHeatmap;   
        toggleHeatmap();
    });
    // Use all data to render heatmap
    d3.select('#totalDataHeat').on('click', function() { 
        useTotDataHeat = !useTotDataHeat;   
        toggleUseTotalHeat();
    });
    
    // Change color modes of the z-depth legend
    d3.select('#chgLengend').on('click', function() {
        monoColour = !monoColour;
        toggleMono();
    });
    
    // Clear annotations
    d3.select('#clear').on('click', function() {
        anntCanvas.getContext("2d").clearRect(0, 0, anntCanvas.width, anntCanvas.height); 
    });
    
    // Save visualization state
    d3.select('#saveState')
        .on('click', function () {
            if(d3.selectAll('*').classed('noEvents')) return;
            
            saveVisState();
            numSStates++;
            
            if (numSStates > 3) { 
                numSStates = 1;
            }
            
            var canv = d3.select('#state' + numSStates)[0][0];
            canv.width = canvasWidth; //glbStateWidth; //canvasWidth / 3;
            canv.height = canvasHeight; //glbStateHeight; //canvasHeight / 3;
            var stateCtx = canv.getContext('2d');
            
            
            if(shVidFlag) {
                stateCtx.globalAlpha = opVideo;
                stateCtx.drawImage(videoPlayer, 0, 0, canv.width, canv.height);
                stateCtx.globalAlpha = 1.0;
            }

            if(shVizFlag) {
                stateCtx.drawImage(trailCanvas, 0, 0, canv.width, canv.height);
            }

            if(renderHeatmap) {
                stateCtx.drawImage(d3.select('#heatCanvas')[0][0], 0, 0, canv.width, canv.height);
            }

            if(shAnnFlag) {
                stateCtx.drawImage(anntCanvas, 0, 0, canv.width, canv.height);
            }
            
            var img = document.createElement('img');
            img.src = canv.toDataURL('image/png');
            d3.select('#imgState' + numSStates)[0][0].src = img.src;
            //img.style.padding = 5;
            img.width = canv.width;
            img.height = canv.height;

            var link = d3.select('#stateLink' + numSStates)[0][0];
            link.href = img.src;
            link.download = 'Visualization State Image' + numSStates;
            
            if(numSStates == 1) {
                stateFlag1 = true;
            } else if(numSStates == 2) {
                stateFlag2 = true;
            } else if(numSStates == 3) {
                stateFlag3 = true;  
            }
        
        });;  
    
    d3.select('#loadState1')
        .on('click', function() {
            loadVisState(0);
       });
    
    d3.select('#loadState2')
        .on('click', function() {
            loadVisState(1);
       });
    
    d3.select('#loadState3')
        .on('click', function() {
            loadVisState(2);
       });

    
    d3.select('#divLoad1')
        .on('mouseover', function() {
            if(stateFlag1) {
                d3.select('#stateBut1')
                    .style('opacity', 1);
               
            }
       })
        .on('mouseout', function() {
            if(stateFlag1) {
                d3.select('#stateBut1')
                    .style('opacity', 0);
               
            }
       });
    
    d3.select('#divLoad2')
        .on('mouseover', function() {
            if(stateFlag2) {
                d3.select('#stateBut2')
                    .style('opacity', 1);
               
            }
       })
        .on('mouseout', function() {
            if(stateFlag2) {
                d3.select('#stateBut2')
                    .style('opacity', 0);
               
            }
       });
    
    d3.select('#divLoad3')
        .on('mouseover', function() {
            if(stateFlag3) {
                d3.select('#stateBut3')
                    .style('opacity', 1);
                
                d3.select('#progressBar')
                    .style('z-index', 0);   
            }
       })
        .on('mouseout', function() {
            if(stateFlag3) {
                d3.select('#stateBut3')
                    .style('opacity', 0);
               
            }
       });
    
};

// Remove event bindings after logfile and/or video is read
function unbindEvents() {
    d3.select('#middleContainer')
        .on('dragover', '');
    
    d3.select('#dropMask').remove();
    d3.select('#dropInfo').remove();
    
};

function toggleVis() {
    if(!shVizFlag) {
        d3.select('#shViz').classed('off', true);
        d3.select('#trailCanvas').style('visibility', 'hidden');
    } else {
        d3.select('#shViz').classed('off', false);
        d3.select('#trailCanvas').style('visibility', 'visible');
    }
};

function toggleVideo() {
    if(!shVidFlag) {
        d3.select('#shVideo').classed('off', true);
        d3.select('#myVideo').style('visibility', 'hidden');
    } else {
        d3.select('#shVideo').classed('off', false);
        d3.select('#myVideo').style('visibility', 'visible');
    }     
};

function toggleWholePlay() {
    if(!wholePlay) {
        d3.select('#fullVidPlay').classed('off', true);
    } else {
        d3.select('#fullVidPlay').classed('off', false);
    }  
};

function setVideoSpeed() {
    videoSpeed = parseFloat(d3.select('#videoSpeedCont')[0][0].value, 10);

    if(videoLoaded) {
        videoPlayer.defaultPlaybackRate = videoSpeed;
        videoPlayer.playbackRate = videoSpeed;
    }
}

function toggleWholeTrail() {
    if(!wholeTrail) {
        d3.select('#trailFlag').classed('off', true);
    } else {
        d3.select('#trailFlag').classed('off', false);
    }
};

function toggleGestures() {
   if(!shGestFlag) {
        d3.select('#shGest').classed('off', true);
    } else {
        d3.select('#shGest').classed('off', false);
    }
};

function toggleHeatmap() {
    if(!renderHeatmap) {
        d3.select('#renderHeat').classed('off', true);
    } else {
        d3.select('#renderHeat').classed('off', false);
    }
};

function toggleAnnotations() {
    if(!shAnnFlag) {
        d3.select('#shAnn').classed('off', true);
        d3.select('#anntCanvas').style('visibility', 'hidden');
    } else {
        d3.select('#shAnn').classed('off', false);
        d3.select('#anntCanvas').style('visibility', 'visible');
    }
};

function toggleUseTotalHeat() {
    if(!useTotDataHeat) {
        d3.select('#totalDataHeat').classed('off', true);
        setupHeatmap(heatLength);
    } else {
        d3.select('#totalDataHeat').classed('off', false);
        setupHeatmap(jsonData.length);
    }  
};

function toggleMono() {
    if(!monoColour) {
        d3.select('#zColours').classed('mono', false);
    } else {
        d3.select('#zColours').classed('mono', true);
    }
};

// Add click listeners to control buttons
function addListenersVidControls() {
    d3.select('#iPlay').on('click', play);
    d3.select('#iPause').on('click', pause);
    d3.select('#iRestart').on('click', restart);
};

// Starting function
function start() {
    checkFileAPI();
    
    if (fileAPI) {
        bindEvents();
        //d3.select('#progressBar').style('transition', 'opacity 700ms');
    }
};


window.addEventListener('load', start(), false);