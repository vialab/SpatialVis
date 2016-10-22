var midContWidth,   // Width of content within middle container
    midContHeight,   // Height of content within middle container,
    canvasWidth,    // Width of canvas and video   
    canvasHeight,   // Height of canvas and video
    glbStateWidth = 256,    // Width of the global state/heatmap
    glbStateHeight = 160,    // Height of the global state/heatmap
    wholePlay = false, // If the whole entire video should be played, or stop at sections
    monoColour = true, // If true, use monochromatic colours or else use other set colours
    anntCanvas, // For annotations
    anntFlag = false, // For annotations
    aLineWidth = 4, // For annotations
    aCtx, // For annotations
    aPrevX = 0, // For annotations
    aCurrX = 0, // For annotations
    aPrevY = 0, // For annotations
    aCurrY = 0, // For annotations
    annColour = 'FFFFFF',   // Colour of annotations
    numSStates = 0, // Number of saved states
    placeholder; // Placeholder image for saved states


// animate file upload elements and transition to canvas creation
// time1 and time2 are for allowing CSS transitions to end
function transitionToCanvas(time1, time2) {
    d3.select('#middleContainer')
        .style('transition', 'border 1s linear, background-color 1s linear')
        .classed('doneUpload', true)
        .style('animation-play-state', 'running')
        .style('-webkit-animation-play-state', 'running');

    d3.select('#logVisContainer')
        .classed('grnBack', false)
        .classed('blkBack', true);

    setTimeout(function () {
        d3.select('#dropInfo').style('opacity', 0);
        d3.select('#leftSideBar').style('opacity', '1');

        setTimeout(function () {
            loadContent();
        }, time2);
    }, time1);
}

// Create the canvas and video container
// Load the video and the heatmap
function loadContent() {
    unbindEvents();

    midContWidth = parseInt(d3.select('#middleContainer').style('width'), 10);
    midContHeight = parseInt(d3.select('#middleContainer').style('height'), 10);

    d3.select('#middleContainer')
        .style('transition', 'background-color 1s')
        .html('');

    d3.select('#middleContainer')
        .append('video')
        .attr('id', 'myVideo')
        .classed('videoCanvas', true)
        .style('opacity', 0.75);

    d3.select('#vidOSlider')
        .on('change', function () {
            opVideo = d3.select('#vidOSlider')[0][0].value;
            d3.select('#myVideo')
                .style('opacity', opVideo);
        });


    d3.select('#middleContainer')
        .append('div')
        .attr('id', 'videoRibbon')
        .append('div')
        .attr('id', 'vertLine');


    ribWidth = parseFloat(d3.select('#videoRibbon').style('width'), 10);
    ribHeight = parseFloat(d3.select('#videoRibbon').style('height'), 10);
    
    canvasHeight = parseInt(d3.select('#myVideo').style('width'), 10) * 0.625;
    canvasWidth = parseInt(d3.select('#myVideo').style('width'), 10);

    d3.select('#middleContainer')
        .append('canvas')
        .attr('id', 'trailCanvas')
        .classed('videoCanvas', true)
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);

    d3.select('#middleContainer')
        .append('canvas')
        .attr('id', 'anntCanvas')
        .classed('videoCanvas', true)
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);
    
    d3.select('#middleContainer')
        .append('div')
        .attr('id', 'graphCont')
        .append('div')
        .attr('id', 'graphContTop');
    
    d3.select('#graphCont')
        .append('div')
        .attr('id', 'graphContBot');

    d3.select('#glbState')
        .append('video')
        .attr('id', 'heatVideo')
        .attr('width', glbStateWidth) //canvasWidth / 3)
        .attr('height', glbStateHeight) //canvasHeight / 3)
        .style('opacity', '0.75');

    d3.select('#logVisContainer')
        .append('div')
        .attr('id', 'progressBar')
        .style('opacity', 0)
        .style('left', '39%')
        .style('bottom', '11%')
        //.style('left', '37.5%')
        //.style('width', '40%')
        .append('span')
        .attr('id', 'loadProgress')
        .style('width', '100%');

    setTimeout(function() {
    
        setProgressBar(1, 'Loading Application', '100%');
            // Turn off events
            d3.selectAll('*').classed('noEvents', true);

            setupTrailVis();
            createGraphs();
            setupAnnotations();
            initialHeatmaps();
            // Repeat no events for all newly created elements
            d3.selectAll('*').classed('noEvents', true);
            initializeVideo(); 
            d3.selectAll('*').style('-webkit-user-select', 'none');
    }, 100);
};

function setupAnnotations() {
    anntCanvas = d3.select('#anntCanvas')[0][0];
    aCtx = anntCanvas.getContext("2d");

    d3.select('#anntCanvas')
        .on('mousemove', function () {
            findxy('move', d3.event);
        })
        .on('mousedown', function () {
            findxy('down', d3.event);
        })
        .on('mouseup', function () {
            findxy('up', d3.event);
        })
        .on('mouseout', function () {
            findxy('out', d3.event);
        });
};

function findxy(res, e) {
    var xy = d3.mouse(anntCanvas);

    if (res == 'down') {
        aPrevX = aCurrX;
        aPrevY = aCurrY;
        aCurrX = xy[0]; //e.clientX - anntCanvas.offsetLeft;
        aCurrY = xy[1]; //e.clientY - anntCanvas.offsetTop;

        anntFlag = true;

        aCtx.beginPath();
        aCtx.fillStyle = '#' + d3.select('#annoColour')[0][0].value;
        aCtx.fillRect(aCurrX, aCurrY, aLineWidth, aLineWidth);
        aCtx.closePath();

    } else if (res == 'up' || res == "out") {
        anntFlag = false;
    } else if (res == 'move') {
        if (anntFlag) {
            aPrevX = aCurrX;
            aPrevY = aCurrY;
            aCurrX = xy[0]; //e.clientX - anntCanvas.offsetLeft;
            aCurrY = xy[1]; //e.clientY - anntCanvas.offsetTop;
            draw();
        }
    }
};

function draw() {
    aCtx.beginPath();
    aCtx.moveTo(aPrevX, aPrevY);
    aCtx.lineTo(aCurrX, aCurrY);
    aCtx.strokeStyle = '#' + annColour;
    aCtx.lineWidth = aLineWidth;
    aCtx.stroke();
    aCtx.closePath();
};