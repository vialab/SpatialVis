var videoPlayer, // HTML video element
    videoLoaded = false, // Flag for loading state of video
    ribWidth,           // Width of the video ribbon in pixels
    ribHeight,    // Height of the video ribbon in pixels
    curVidCanvas = -1  // Canvas element of video thumbnail that has been clicked
    videoSpeed = 1.0,   // Speed of the video
    numThumbs = 10,     // Number of frames to draw
    timeVidThumbs = 600,  // Time between creating each new video thumbnail
    videoSeeked = false,    // If the video is currently being seeked
    opVideo = 0.75,    // The opacity of the video
    videoSrc = null,   // The video source data
    microConvert = 1000000,    // Number of microseconds in a second
    calculatedFPS = 30,  // Leap motion's assumed frames per second data capturing speed
    videoTotalTime = 0,   // Total video time in seconds
    scrubberChanged = false; // scrubber currently selected
    //aproxTotalFrames;   // Approximately the total number of frames in video and is based on the framesPS

function initializeVideo() {    
    videoPlayer = d3.select('#myVideo')[0][0];
    videoPlayer.addEventListener('loadeddata', function() {
            d3.select('#vidTimeDura')
                .html(videoPlayer.duration.toFixed(2) + 's &nbsp;');
            
            // Caculate the data's FPS rate
            videoTotalTime = (jsonData[jsonData.length-1].time - jsonData[0].time)/microConvert;
            calculatedFPS = jsonData.length/videoTotalTime;
        
            setTimeout(createRibbon, 500, 0);
        }, false);

    // Need for opacity transition for progress bar
    setTimeout(function () {
        videoSrc = 'data:video/mp4;base64,' + btoa(binaryVideo);
        videoPlayer.src = videoSrc;
        
        // Set video source for heatmap canvas
        d3.select('#heatVideo')[0][0].src = videoSrc;
    }, 1);
};

// Reset the thumbnail so none are selected
function resetThumb() {
    if(curVidCanvas != -1) {
        curVidCanvas.classed('thumbSelect', false);
        curVidCanvas = -1;
    }
};

// creates the video ribbon
function createRibbon(index) {
    videoPlayer.currentTime = index * (Math.round(videoPlayer.duration/numThumbs));
    
    // Time is needed to allow videoplayer to seek
    setTimeout(function() {
        d3.select('#videoRibbon')
            .append('canvas')
            .attr('id', 'rib' + index)
            .classed('videoThumb', true)
            .on('click', function() {
                drawingEnded = false;
                if(curVidCanvas != -1 || (curVidCanvas == d3.select(this))) { 
                    resetThumb();
                }
                
                if(curVidCanvas != d3.select(this)) d3.select(this).classed('thumbSelect', true);
                
                seekLoadVideo(d3.select(this)); 
                setupHeatmap(heatLength);
            });    
        
        var canv = d3.select('#rib' + index)[0][0];
        
        // Negating 4 since border is 2px width
        var negate = 4;
        // Negate twice to fit in canvas (static UI)
        if(index == 0 || index == 9) {
            negate *=2;
        }
        canv.width = Math.ceil(ribWidth/numThumbs - negate);
        canv.height = midContHeight/10;
        var thumbnailCtx = canv.getContext('2d');
        thumbnailCtx.drawImage(videoPlayer, 0, 0, canv.width, canv.height);
        index++;

        if(index < numThumbs) {
            createRibbon(index);
        } else {
                        
            // Add video controls/scrubber
            d3.select('#videoRibbon')
                .append('div')
                .attr('id', 'vidControls');
            
            d3.select('#vidControls')
                .append('input')
                .attr('id', 'scrubber')
                .attr('type', 'range')
                .attr('min', 0)
                .attr('max', videoPlayer.duration)
                .attr('step', 0.001)
                .attr('value', 0)
                .on('change', function() {
                    scrubberChanged = true;
                    resetThumb();
                    videoPlayer.currentTime = this.value;
                    
                    if(brushFlag && (videoPlayer.currentTime < brushExtent[0] || videoPlayer.currentTime > brushExtent[1])) {
                        cancelBrush();
                    }
                    seekLoadVideo(-1);
                    setupHeatmap(heatLength);
                    scrubberChanged = false;
                })
                .on('mousemove', function() {
                    var xy = d3.mouse(this);
                    var width = d3.select('#controls').style('width');
                    this.style.cursor = "pointer";
                    d3.select('#controls')
                        .style('left', (xy[0] - parseInt(width, 10)/2) + 'px');
                });
            
           d3.select('#vidControls') 
                .append('div')
                .attr('id', 'controls')
                .append('div')
                .attr('id', 'vPlay')
                .append('img')
                .attr('id', 'iPlay')
                .attr('src', 'img/play.png');
            
            d3.select('#controls')
                .append('div')
                .attr('id', 'vPause')
                .append('img')
                .attr('id', 'iPause')
                .attr('src', 'img/pause.png');
            
            d3.select('#controls')
                .append('div')
                .attr('id', 'vRestart')
                .append('img')
                .attr('id', 'iRestart')
                .attr('src', 'img/restart.png');
            
            addListenersVidControls();
            
            // This function fires when the video plays
            // Move the red line
            videoPlayer.addEventListener('timeupdate', function() {
                    d3.select('#vidTimeCurr')
                        .html(videoPlayer.currentTime.toFixed(2) + 's &nbsp;');
                
                    var lineX = ribWidth * 
                        (videoPlayer.currentTime/videoPlayer.duration)
                        .toFixed(3);

                    d3.select('#vertLine').style('left', lineX + 'px');
                    d3.select('#scrubber')[0][0].value = videoPlayer.currentTime;    

                    // Pause the video at end of video thumbnail's time period
                    if(!wholePlay && curVidCanvas != -1 
                       && (lineX >= ((ribWidth/numThumbs) * 
                                (parseInt(curVidCanvas.attr('id').slice(3), 10) + 1)))
                      
                      || (brushFlag && videoPlayer.currentTime >= brushExtent[1])){
                        
                        pause();
                    }
                }, false);
            
            videoLoaded = true;
            videoPlayer.currentTime = 0;
            seekLoadVideo(-1);
            // Turn back on events
            d3.selectAll('*').classed('noEvents', false);
            setProgressBar(1, 'Loading Complete', '100%');
            setTimeout(function() {
                d3.select('#progressBar').style('opacity', '0');
            }, 1000);
        }
    }, timeVidThumbs);
};

// Show the video section associated with thumbnail
function seekLoadVideo(el) {
    
    if(el != -1) {
        videoPlayer.currentTime = parseInt(el.attr('id').slice(3),10) * (videoPlayer.duration/numThumbs);
    }
    
    curVidCanvas = el;
    
    // Reset drawing variables
    pause();
    resetDrawing();
    // Line up the tracking data index with the video
    for(var i = 0; i < jsonData.length; i++) {
        var t1 = jsonData[0].time/microConvert,
            t2 = jsonData[i].time/microConvert;
        
        if(Math.ceil(t2 - t1) == Math.ceil(videoPlayer.currentTime)) {
            trackingIndex = i;
            lastTrackingIndex = i;
            break;//return;
        }
    }
    
    // Draw the visualization starting at 'trackingIndex - trailLength'
    var start = Math.max(0, trackingIndex - trailLength),
        duration = trailLength;
    videoSeeked = true;
    if(start == 0) {
        duration = trackingIndex;
    }
    for(var i = start; i < start + duration; i++) {
        getVideoVisData(i);
    }
    renderVis();
    videoSeeked = false;
};