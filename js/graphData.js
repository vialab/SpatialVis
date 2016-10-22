var frameInfo = [],
    prevTips = [],
    peakEvents = 0, // Highest number of gesture events in frmae
    peakTips = 0,   // Highest number of pointables in frame
    startTime,
    svgHeight,
    bottomGraphSVG,
    topGraphSVG,
    leftMargin,     // Size of the graph's left margin
    rightMargin,     // Size of the graph's right margin
    topMargin = 10,     // Size of the graph's top margin
    bottomMargin = 100,     // Size of the graph's bottom margin
    brushFlag = false,
    brushExtent,
    choosingGraphTop = false,   // If the user is choosing a new variable
    choosingGraphBot = false,   // to graph
    graphOptions = ['Pointables', 'Hands', 'Fingers', 'Tools', 'Gestures', 'Circles', 'Keytaps', 'Screentaps', 'Swipes'];  // Graph variable choices

// Starting function for graphs
function createGraphs() {
    getFrameData();
    
    // Set variables needed for graphs
    startTime = frameInfo[0].time;
    svgHeight = (midContHeight - ribHeight)/5;
    leftMargin = midContWidth*0.046;
    rightMargin = midContWidth*0.013;
    
    graphTop('Pointables');
    graphBottom('Gestures');
    setupGraphEvents();
};

function setupGraphEvents() {
  d3.selectAll('svg')
    .on('mouseup', function() {
       if(brushFlag) {
            var timeDiff = Math.abs(brushExtent[1] - brushExtent[0]);
            var frames = parseInt(timeDiff * calculatedFPS, 10);
            videoPlayer.currentTime = brushExtent[0];
            setupHeatmap(frames);
       }
    });
    
    d3.select('#topGraph')
        .select('.y')
        .on('click', function() {
            newVariableSel('top', 'graphChooserTop');
        });
    
    d3.select('#bottomGraph')
        .select('.y')
        .on('click', function() {
            newVariableSel('bottom', 'graphChooserBot');
        });
};

function newVariableSel(side, elStr) {
    var el, container;
    
    if(side == 'top' && choosingGraphTop
      || side == 'bottom' && choosingGraphBot) return;
            
    if(side == 'top') {
        choosingGraphTop = true;
        container = d3.select('#graphContTop');
    } else if(side == 'bottom') {
        choosingGraphBot = true;
        container = d3.select('#graphContBot');
    }

    
    container.append('div')
        .attr('id', elStr)
        .classed('graphChooserCont', true)
        .style('left', container[0][0].getBoundingClientRect().left + 'px')
        .style('top', container[0][0].getBoundingClientRect().top + 'px')
        .style('opacity', 1)
        .append('div')
        .classed('controlButtons', true)
        .classed('graphChgButtons', true)
        .html(graphOptions[0])
        .on('click', function() {
                createNewGraph(graphOptions[0], side);
            });

    el = d3.select('#' + elStr);
    
    d3.select('body')
        .append('div')
        .classed('backUnselect', true)
        .style('opacity', 1)
        .on('click', function() {
            d3.select('#graphChooserTop').remove();
            d3.select('#graphChooserBot').remove();
            d3.selectAll('.backUnselect').remove();
        
            choosingGraphTop = false;
            choosingGraphBot = false;
            return;
        });
            
    
    el.append('div')
        .classed('controlButtons', true)
        .classed('graphChgButtons', true)
        .html(graphOptions[1])
        .on('click', function() {
                createNewGraph(graphOptions[1], side);
            });

    el.append('div')
        .classed('controlButtons', true)
        .classed('graphChgButtons', true)
        .html(graphOptions[2])
        .on('click', function() {
                createNewGraph(graphOptions[2], side);
            });

    el.append('div')
        .classed('controlButtons', true)
        .classed('graphChgButtons', true)
        .html(graphOptions[3])
        .on('click', function() {
                createNewGraph(graphOptions[3], side);
            });

    el.append('div')
        .classed('controlButtons', true)
        .classed('graphChgButtons', true)
        .html(graphOptions[4])
        .on('click', function() {
                createNewGraph(graphOptions[4], side);
            });

    el.append('br');

    el.append('div')
        .classed('controlButtons', true)
        .classed('graphChgButtons', true)
        .html(graphOptions[5])
        .on('click', function() {
                createNewGraph(graphOptions[5], side);
            }); 

    el.append('div')
        .classed('controlButtons', true)
        .classed('graphChgButtons', true)
        .html(graphOptions[6])
        .on('click', function() {
                createNewGraph(graphOptions[6], side);
            });

    el.append('div')
        .classed('controlButtons', true)
        .classed('graphChgButtons', true)
        .html(graphOptions[7])
        .on('click', function() {
                createNewGraph(graphOptions[7], side);
            });

    el.append('div')
        .classed('controlButtons', true)
        .classed('graphChgButtons', true)
        .html(graphOptions[8])
        .on('click', function() {
                createNewGraph(graphOptions[8], side);
            });

    /*el.append('div')
        .classed('controlButtons', true)
        .html(graphOptions[9])
        .on('click', function() {
                createNewGraph(graphOptions[9], side);
            });*/
}

// Create new graph when user selects to
// graph a new variable
function createNewGraph(command, side) {
    d3.selectAll('.backUnselect').remove();
    
    if(side == 'top') {
        d3.select('#graphChooserTop').remove();
        
        choosingGraphTop = false;
        
        
        //if(command == 'Cancel') {
        //    return;
        //} else {
            d3.select('#topGraph').remove();
            d3.select('#chgGraphTop').remove();
            graphTop(command);
        //}
    } else if(side == 'bottom') {
         d3.select('#graphChooserBot').remove();
        
        choosingGraphBot = false;
        
        //if(command == 'Cancel') {
        //    return;
        //} else {
            d3.select('#bottomGraph').remove();
            d3.select('#chgGraphBot').remove();
            graphBottom(command);
            setupGraphEvents();
       // }
    }    
    
    setupGraphEvents();
};

// Get the frame data needed for graphs
function getFrameData() {
    for(var frameIndex in jsonData) {
        var curFrame = jsonData[frameIndex],
            pointsInFrame = [],
            handsInFrame = [],
            fingersInFrame = [],
            toolsInFrame = [],
            gestureArray = [],
            circleGestsInFrame = [],
            keytapGestsInFrame = [],
            screentapGestsInFrame = [],
            swipeGestsInFrame = [],
            curFrameTips = [];

        // Get Gestures
        for(var h in curFrame.gestures) {
            
            gestureArray.push(curFrame.gestures[h]);  
            
            if(curFrame.gestures[h].type == 1) {
                swipeGestsInFrame.push(curFrame.gestures[h]);
            } else if(curFrame.gestures[h].type == 4) {
                circleGestsInFrame.push(curFrame.gestures[h]);
            } else if(curFrame.gestures[h].type == 5) {
                screentapGestsInFrame.push(curFrame.gestures[h]);
            } else if(curFrame.gestures[h].type == 6) {
                keytapGestsInFrame.push(curFrame.gestures[h]);
            }
        }
        
        if(gestureArray.length > peakEvents) {
            peakEvents = gestureArray.length;
        }

        for(var i in curFrame.hands) { 
            handsInFrame.push(curFrame.hands[i]);
            
            for(var j in curFrame.hands[i].pointables) {

                var p = curFrame.hands[i].pointables[j];
                
                if(p.type == 'finger') {
                    fingersInFrame.push(p);
                } else if(p.type == 'tool') {
                    toolsInFrame.push(p);
                }
                
                // Make sure tip positions are valid (not (0, 0, 0))
                var tipsXYZ = checkStableTip(p.stableTipPos.x, p.stableTipPos.y, p.stableTipPos.z, p);
                var newCoord = changeCoord(tipsXYZ[0], tipsXYZ[1], tipsXYZ[2]),
                    lastCoord = null,
                    contFlag = 0;   // If the current tip is a continuation from last frame

                curFrameTips.push(p.id);

                if(prevTips.length > 0 && prevTips.indexOf(p.id) > -1) {
                    contFlag = 1;                
                    var lastHandP = getOldPointable(p.id, frameIndex, true);
                    var lastP = jsonData[(frameIndex-1)].hands[lastHandP.handIndex].pointables[lastHandP.pIndex];

                    // Make sure tip positions are valid
                    var lastFrameXYZ = checkStableTip(lastP.stableTipPos.x, lastP.stableTipPos.y, lastP.stableTipPos.z, lastP);
                    lastCoord = changeCoord(lastFrameXYZ[0], lastFrameXYZ[1], lastFrameXYZ[2]);
                } 

                pointsInFrame.push([newCoord, lastCoord, contFlag]);
            }
        }

        if(curFrameTips.length > peakTips) {
            peakTips = curFrameTips.length;
        }
        
        prevTips = curFrameTips;

        frameInfo.push({
           'tips': pointsInFrame,
            'hands': handsInFrame,
            'fingers': fingersInFrame,
            'tools': toolsInFrame,
            'gestures': gestureArray,
            'circleGests': circleGestsInFrame,
            'keytapGests': keytapGestsInFrame,
            'screentapGests': screentapGestsInFrame,
            'swipeGests': swipeGestsInFrame,
            'frameIndex': frameIndex,
            'time': curFrame.time
        });
    }
    
    console.log('Highest Number of Pointables: ' + peakTips);
    console.log('Highest Number of Gestures (Events): ' + peakEvents);
};

// Create focus + context graphs for visualizing 
// the number of pointables at each frame
function graphTop(varToGraph) {
    var margin = {top: topMargin, right: rightMargin, bottom: bottomMargin, left: leftMargin},
        width = midContWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom,
        
        margin2 = {top: (svgHeight - 70), right: rightMargin, bottom: 20, left: leftMargin},
        height2 = svgHeight - margin2.top - margin2.bottom,
        
        x = d3.scale.linear().range([0, width]),
        y = d3.scale.linear().range([height, 0]),
        xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(25),
        yAxis = d3.svg.axis().scale(y).orient('left').ticks(peakTips/2),
        
        x2 = d3.scale.linear().range([0, width]),
        y2 = d3.scale.linear().range([height2, 0]),
        x2Axis = d3.svg.axis().scale(x2).orient('bottom').ticks(25);
    
    var brush = d3.svg.brush().x(x2).on('brush', brushed);
        
    
    var area = d3.svg.area()
                //.interpolate('basis')
                .interpolate('step-after')
                .x(function(d) {return x((d.time - startTime)/microConvert); })
                .y0(height)
                .y1(function(d) {
                    if(varToGraph == "Pointables") {
                        return y(d.tips.length);
                    } else if(varToGraph == "Hands") {
                        return y(d.hands.length);
                    } else if(varToGraph == "Fingers") {
                        return y(d.fingers.length);
                    } else if(varToGraph == "Tools") {
                        return y(d.tools.length);
                    } else if(varToGraph == "Gestures") {
                        return y(d.gestures.length);
                    } else if(varToGraph == "Circles") {
                        return y(d.circleGests.length);
                    } else if(varToGraph == "Keytaps") {
                        return y(d.keytapGests.length);
                    } else if(varToGraph == "Screentaps") {
                        return y(d.screentapGests.length);
                    } else if(varToGraph == "Swipes") {
                        return y(d.swipeGests.length);
                    }
                    
                     });
    
    var area2 = d3.svg.area()
                //.interpolate('basis')
                .interpolate('step-after')
                .x(function(d) {return x2((d.time - startTime)/microConvert); })
                .y0(height2)
                .y1(function(d) {
                    if(varToGraph == "Pointables") {
                        return y2(d.tips.length);
                    } else if(varToGraph == "Hands") {
                        return y2(d.hands.length);
                    } else if(varToGraph == "Fingers") {
                        return y2(d.fingers.length);
                    } else if(varToGraph == "Tools") {
                        return y2(d.tools.length);
                    } else if(varToGraph == "Gestures") {
                        return y2(d.gestures.length);
                    } else if(varToGraph == "Circles") {
                        return y2(d.circleGests.length);
                    } else if(varToGraph == "Keytaps") {
                        return y2(d.keytapGests.length);
                    } else if(varToGraph == "Screentaps") {
                        return y2(d.screentapGests.length);
                    } else if(varToGraph == "Swipes") {
                        return y2(d.swipeGests.length);
                    }
                    
                     });
    
    var svg = d3.select('#graphContTop')
                .append('svg')
                .attr('id', 'topGraph')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);
                
    svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', width)
        .attr('height', height);
    
    topGraphSVG = svg.append('g')
                .attr('class', 'focus')
                .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    
    var context = svg.append('g')
                .attr('class', 'context')
                .attr('transform', 'translate(' + margin2.left + ', ' + margin2.top + ')');
    
    x.domain(d3.extent(frameInfo, function(d) { return (d.time - startTime)/microConvert; }));
    y.domain([0, d3.max(frameInfo, function(d) { 
                if(varToGraph == "Pointables") {
                        return d.tips.length;
                    } else if(varToGraph == "Hands") {
                        return d.hands.length;
                    } else if(varToGraph == "Fingers") {
                        return d.fingers.length;
                    } else if(varToGraph == "Tools") {
                        return d.tools.length;
                    } else if(varToGraph == "Gestures") {
                        return d.gestures.length;
                    } else if(varToGraph == "Circles") {
                        return d.circleGests.length;
                    } else if(varToGraph == "Keytaps") {
                        return d.keytapGests.length;
                    } else if(varToGraph == "Screentaps") {
                        return d.screentapGests.length;
                    } else if(varToGraph == "Swipes") {
                        return d.swipeGests.length;
                    }
        })]);
    
    x2.domain(x.domain());
    y2.domain(y.domain());
    
    topGraphSVG.x = x;
    topGraphSVG.x2 = x2;
    topGraphSVG.xAxis = xAxis;
    topGraphSVG.area = area;
    topGraphSVG.area2 = area2;
    
    topGraphSVG.append('path')
        .datum(frameInfo)
        .attr('class', 'area')
        .attr('d', area);
    
    topGraphSVG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append('text')
        .attr('x', width)
        .attr('y', margin.bottom/4)
        .style('text-anchor', 'end')
        .text('Time in Seconds');

    topGraphSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -43)
      .attr("dy", "0.51em")
      .style("text-anchor", "end")
      .text("Number of " + varToGraph);
    
    context.append('path')
        .datum(frameInfo)
        .attr('class', 'area')
        .attr('d', area2);
    
    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(x2Axis)
        .append('text')
        .attr('x', width/2)
        .attr('y', margin.bottom)
        .style('text-anchor', 'middle')
        .text('Time in Seconds');

    context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll('rect')
      .attr("y", -6)
      .attr("height", height2 + 7);

    
    
    d3.select('#topGraph')
        .select('.y')
        .style('cursor', 'pointer');
    
    d3.select("#graphContTop")
        .append('div')
        .attr('id', 'chgGraphTop')
        .classed('controlButtons', true)
        .classed('chgGraph', true)
        .html('Change Data')
        .on('click', function() {
                newVariableSel('top', 'graphChooserTop');
            });
    
    
    function brushed() {
        topGraphSVG.x.domain(brush.empty() ? x2.domain() : brush.extent());
        bottomGraphSVG.x.domain(brush.empty() ? x2.domain() : brush.extent());
        executeBrush();
        setWidths(d3.select('#topGraph'), d3.select('#bottomGraph'));
        setBrushFlag(brush);
    };
};

// Create focus + context graphs for visualizing gestures (events)
function graphBottom(varToGraph) {
    var margin = {top: topMargin, right: rightMargin, bottom: bottomMargin, left: leftMargin},
        width = midContWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom,
        
        margin2 = {top: (svgHeight - 70), right: rightMargin, bottom: 20, left: leftMargin},
        height2 = svgHeight - margin2.top - margin2.bottom,
        
        x = d3.scale.linear().range([0, width]),
        y = d3.scale.linear().range([height, 0]),
        xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(25),
        yAxis = d3.svg.axis().scale(y).orient('left').ticks(peakEvents/2),
        
        x2 = d3.scale.linear().range([0, width]),
        y2 = d3.scale.linear().range([height2, 0]),
        x2Axis = d3.svg.axis().scale(x2).orient('bottom').ticks(25);
    
    var brush = d3.svg.brush().x(x2).on('brush', brushed);
        
    
    var area = d3.svg.area()
                //.interpolate('basis')
                .interpolate('step-after')
                .x(function(d) {return x((d.time - startTime)/microConvert); })
                .y0(height)
                .y1(function(d) {
                    if(varToGraph == "Pointables") {
                        return y(d.tips.length);
                    } else if(varToGraph == "Hands") {
                        return y(d.hands.length);
                    } else if(varToGraph == "Fingers") {
                        return y(d.fingers.length);
                    } else if(varToGraph == "Tools") {
                        return y(d.tools.length);
                    } else if(varToGraph == "Gestures") {
                        return y(d.gestures.length);
                    } else if(varToGraph == "Circles") {
                        return y(d.circleGests.length);
                    } else if(varToGraph == "Keytaps") {
                        return y(d.keytapGests.length);
                    } else if(varToGraph == "Screentaps") {
                        return y(d.screentapGests.length);
                    } else if(varToGraph == "Swipes") {
                        return y(d.swipeGests.length);
                    }
                    
                     });
    
    var area2 = d3.svg.area()
                //.interpolate('basis')
                .interpolate('step-after')
                .x(function(d) {return x2((d.time - startTime)/microConvert); })
                .y0(height2)
                .y1(function(d) {
                    if(varToGraph == "Pointables") {
                        return y2(d.tips.length);
                    } else if(varToGraph == "Hands") {
                        return y2(d.hands.length);
                    } else if(varToGraph == "Fingers") {
                        return y2(d.fingers.length);
                    } else if(varToGraph == "Tools") {
                        return y2(d.tools.length);
                    } else if(varToGraph == "Gestures") {
                        return y2(d.gestures.length);
                    } else if(varToGraph == "Circles") {
                        return y2(d.circleGests.length);
                    } else if(varToGraph == "Keytaps") {
                        return y2(d.keytapGests.length);
                    } else if(varToGraph == "Screentaps") {
                        return y2(d.screentapGests.length);
                    } else if(varToGraph == "Swipes") {
                        return y2(d.swipeGests.length);
                    }
                    
                     });
    
    var svg = d3.select('#graphContBot')
                .append('svg')
                .attr('id', 'bottomGraph')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);
                
    svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', width)
        .attr('height', height);
    
    bottomGraphSVG = svg.append('g')
                .attr('class', 'focus')
                .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    
    var context = svg.append('g')
                .attr('class', 'context')
                .attr('transform', 'translate(' + margin2.left + ', ' + margin2.top + ')');
    
    x.domain(d3.extent(frameInfo, function(d) { return (d.time - startTime)/microConvert; }));
    y.domain([0, d3.max(frameInfo, function(d) { 
                if(varToGraph == "Pointables") {
                        return d.tips.length;
                    } else if(varToGraph == "Hands") {
                        return d.hands.length;
                    } else if(varToGraph == "Fingers") {
                        return d.fingers.length;
                    } else if(varToGraph == "Tools") {
                        return d.tools.length;
                    } else if(varToGraph == "Gestures") {
                        return d.gestures.length;
                    } else if(varToGraph == "Circles") {
                        return d.circleGests.length;
                    } else if(varToGraph == "Keytaps") {
                        return d.keytapGests.length;
                    } else if(varToGraph == "Screentaps") {
                        return d.screentapGests.length;
                    } else if(varToGraph == "Swipes") {
                        return d.swipeGests.length;
                    }
        })]);
    
    x2.domain(x.domain());
    y2.domain(y.domain());
    
    bottomGraphSVG.x = x;
    bottomGraphSVG.x2 = x2;
    bottomGraphSVG.xAxis = xAxis;
    bottomGraphSVG.area = area;
    bottomGraphSVG.area2 = area2;
    
    bottomGraphSVG.append('path')
        .datum(frameInfo)
        .attr('class', 'area')
        .attr('d', area);
    
    bottomGraphSVG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append('text')
        .attr('x', width)
        .attr('y', margin.bottom/4)
        .style('text-anchor', 'end')
        .text('Time in Seconds');

    bottomGraphSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -43)
      .attr("dy", "0.51em")
      .style("text-anchor", "end")
      .text("Number of " + varToGraph);
    
    context.append('path')
        .datum(frameInfo)
        .attr('class', 'area')
        .attr('d', area2);
    
    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(x2Axis)
        .append('text')
        .attr('x', width/2)
        .attr('y', margin.bottom)
        .style('text-anchor', 'middle')
        .text('Time in Seconds');

    context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll('rect')
      .attr("y", -6)
      .attr("height", height2 + 7);    
    
    d3.select('#bottomGraph')
        .style('margin-top', -10)
        .select('.y')
        .style('cursor', 'pointer');
    
    d3.select("#graphContBot")
        .append('div')
        .attr('id', 'chgGraphBot')
        .classed('controlButtons', true)
        .classed('chgGraph', true)
        .html('Change Data')
        .on('click', function() {
                newVariableSel('bottom', 'graphChooserBot');
            });
    
    function brushed() {
        bottomGraphSVG.x.domain(brush.empty() ? x2.domain() : brush.extent());
        topGraphSVG.x.domain(brush.empty() ? x2.domain() : brush.extent());
        executeBrush();
        setWidths(d3.select('#bottomGraph'), d3.select('#topGraph'));
        setBrushFlag(brush);
    };   
};

function executeBrush2(graphOne, selectionOne, graphTwo, selectionTwo) {
    bottomGraphSVG.select('.area').attr('d', bottomGraphSVG.area);
    bottomGraphSVG.select('.x.axis').call(bottomGraphSVG.xAxis);
    
    var ex = d3.select('#bottomGraph').select('.extent').attr('x');
    var ew = d3.select('#bottomGraph').select('.extent').attr('width');

    topGraphSVG.select('.area').attr('d', topGraphSVG.area);
    topGraphSVG.select('.x.axis').call(topGraphSVG.xAxis);
    
    d3.select('#topGraph').select('.extent').attr('x', ex);
    d3.select('#topGraph').select('.extent').attr('width', ew);
};

function executeBrush() {
    topGraphSVG.select('.area').attr('d', topGraphSVG.area);
    topGraphSVG.select('.x.axis').call(topGraphSVG.xAxis);
    
    bottomGraphSVG.select('.area').attr('d', bottomGraphSVG.area);
    bottomGraphSVG.select('.x.axis').call(bottomGraphSVG.xAxis);
};

function setWidths(graphOne, graphTwo) {
    var ex = graphOne.select('.extent').attr('x');
    var ew = graphOne.select('.extent').attr('width');
    
    graphTwo.select('.extent').attr('x', ex);
    graphTwo.select('.extent').attr('width', ew);
};

function cancelBrush() {
    bottomGraphSVG.x.domain(bottomGraphSVG.x2.domain());
    topGraphSVG.x.domain(topGraphSVG.x2.domain());
    executeBrush();
    d3.select("#bottomGraph").select('.extent').attr('width', 0);
    d3.select("#bottomGraph").select('.resize').attr('width', 0);

    d3.select("#topGraph").select('.extent').attr('width', 0);
    d3.select("#topGraph").select('.resize').attr('width', 0);
    brushFlag = false;
};

function setBrushFlag(brush) {
    if(!brush.empty()) {
        resetThumb();
        brushFlag = true;
        brushExtent = brush.extent();
        videoPlayer.currentTime = brushExtent[0];
        seekLoadVideo(-1);
        
       
    } else {
        brushFlag = false;
    }
};