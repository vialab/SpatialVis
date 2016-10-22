var fileAPI = false,
    logFile = null,
    jsonData = null,
    logSubmitted = false,
    videoFile = null,
    binaryVideo;

// Make sure the browser supports the File API
function checkFileAPI() {
   
    if (window.File && window.FileReader && window.FileList) {
        fileAPI = true;
    } else {
        alert('The File API needed to run this application is not supported by this browser');   
    }
};


// Check if the file contains valid JSON syntax
function validateJSON(file) {
    try {
        jsonData = JSON.parse(file);
    } catch(e) {
        jsonData = null;
        alert('The logFile must be in JSON format');  
    }
    
    if(jsonData) {
        logSubmitted = true;
        d3.select('#fileSubmit').on('click', null);
        d3.select('#fileInput').on('change', null);
        setupVideoDrop();
    }
};

// Handle input element's file selection
function handleFileSelect() {
    var file;
    
    if(!logSubmitted) {
        file = d3.select('#fileInput').property('files')[0];
    } else {
        file = d3.select('#videoInput').property('files')[0];
    }
    outputFileInfo(file);
};

// Prevent defaults for dragging file
// Change dashed border colour with a class
function handleFileDrag(){
    d3.event.stopPropagation();
    d3.event.preventDefault();
    d3.event.dataTransfer.dropEffect = 'copy';
    d3.select('#middleContainer').classed('borderColour', true);
};

// Revert back dashed border to gray by removing a class
function handleFileLeave(){
    d3.select('#middleContainer').classed('borderColour', false);
};

// Handle dropping file for submission
function handleFileDrop(){
    d3.event.stopPropagation();
    d3.event.preventDefault();
    d3.select('#middleContainer').classed('borderColour', false);
    var file;
    
    //Remove input element's file
    if(!logSubmitted){
        d3.select('#fileInput').property('value', '');
        file = d3.event.dataTransfer.files[0];
    } else {
        d3.select('#videoInput').property('value', '');
        file = d3.event.dataTransfer.files[0];
    }
    outputFileInfo(file);
};

// Create click event for input element
// A fake click event is needed since a 'mask' is placed over the input element
function handleMaskClick() {
    var fakeEvent = document.createEvent('MouseEvents');
    fakeEvent.initMouseEvent('click', false, true, window, 1, d3.event.x, d3.event.y, d3.event.clientX, d3.event.clientY, false, false, false, false, 0, null);
   
    if(!logSubmitted) {
        var submitButton = d3.select('#fileSubmit')[0][0],
            fileButton = d3.select('#fileInput')[0][0];
        var buttonBounds = submitButton.getBoundingClientRect(),
            fileBounds = fileButton.getBoundingClientRect();

        // Invoke a click event on the submit button if it is clicked
        // Otherwise, invoke the event on the file input element
        if (logFile !== null && 
                d3.event.x >= buttonBounds.left && 
                d3.event.x <= (buttonBounds.left + submitButton.offsetWidth) &&
                d3.event.y >= buttonBounds.top && 
                d3.event.y <= (buttonBounds.top + submitButton.offsetHeight)) {

            d3.select('#fileSubmit')[0][0].dispatchEvent(fakeEvent);

        } else if (d3.event.x >= fileBounds.left && 
                d3.event.x <= (fileBounds.left + fileButton.offsetWidth) &&
                d3.event.y >= fileBounds.top && 
                d3.event.y <= (fileBounds.top + fileButton.offsetHeight)) {

            d3.select('#fileInput')[0][0].dispatchEvent(fakeEvent);
        }
    } else {
        var videoSubmitB = d3.select('#videoSubmit')[0][0],
            fileButton = d3.select('#videoInput')[0][0];
        var buttonBounds = videoSubmitB.getBoundingClientRect(),
            videoBounds = fileButton.getBoundingClientRect();
            //skipButton = d3.select('#skipVideo')[0][0];
        //var skipBounds = skipButton.getBoundingClientRect();

        // Invoke a click event on the video submit button if it is clicked
        // or invoke the event on the video file input element
        if (videoFile !== null && 
                d3.event.x >= buttonBounds.left && 
                d3.event.x <= (buttonBounds.left + videoSubmitB.offsetWidth) &&
                d3.event.y >= buttonBounds.top && 
                d3.event.y <= (buttonBounds.top + videoSubmitB.offsetHeight)) {

            d3.select('#videoSubmit')[0][0].dispatchEvent(fakeEvent);

        } else if (d3.event.x >= videoBounds.left && 
                d3.event.x <= (videoBounds.left + fileButton.offsetWidth) &&
                d3.event.y >= videoBounds.top && 
                d3.event.y <= (videoBounds.top + fileButton.offsetHeight)) {

            d3.select('#videoInput')[0][0].dispatchEvent(fakeEvent);
            
        }        
    }
};

// Output selected file's information
function outputFileInfo(file){
    
    if(!logSubmitted) {
        logFile = file;
        
        d3.select('#fileInfo').html('File Name: <strong>' + logFile.name + 
                '</strong><br> ' + 'Media Type (MIME): ' + 
                (logFile.type || 'N/A') + '<br> Size: ' + 
                logFile.size/1000 + ' kilobytes <br> Last Modified On: ' + 
        (logFile.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'N/A'));
        
        d3.select('#fileSubmit').style('opacity', 1);
        d3.select('#fileInfo').style('opacity', 1);
    } else {
        videoFile = file;
        
        d3.select('#videoInfo').html('File Name: <strong>' + videoFile.name + 
                '</strong><br> ' + 'Media Type (MIME): ' + (videoFile.type || 'N/A') + 
                '<br> Size: ' + videoFile.size/1000 + 
                ' kilobytes <br> Last Modified On: ' + 
        (videoFile.lastModifiedDate ? videoFile.lastModifiedDate.toLocaleDateString() : 'N/A'));
        
        d3.select('#videoSubmit').style('opacity', 1);
        d3.select('#videoInfo').style('opacity', 1);
    }
};

// Read the submitted file
function readFile() {
    var reader = new FileReader();
    
    //reader.onloadstart = function(e) {};
    
    reader.onprogress = function(e) {
        var amountLoaded = Math.round((e.loaded / e.total) * 100);
        setProgressBar(1, (amountLoaded + '% Read'), (amountLoaded + '%'));
    };
    
    reader.onload = function(e) {       
        var file = e.target.result;
        
        if(!logSubmitted) {
            resetProgressBar(false);
            validateJSON(file); 
        } else {
            binaryVideo = file;        
            resetProgressBar(true);
        }
    };
    
    reader.onerror = function(e) {
        switch(e.target.error.code) {
            case e.target.error.NOT_FOUND_ERR:
                alert('File not found error.');
                break;
            case e.target.error.NOT_READABLE_ERR:
                alert('File is not readable.');
                break;
            case e.target.error.ABORT_ERR:
                break;
            default:
                alert('An error occured when reading the file.')
        };
    };
    
    reader.onabort = function(e) {
        alert('Reading the file has been cancelled.');
    };
    
    if(!logSubmitted) {
        reader.readAsText(logFile);
    } else {
        if (videoFile.type.match('video/mp4')) {
            reader.readAsBinaryString(videoFile);
        } else {
            // Check if the file is a mp4 encoded file by
            // checking its MIME type (video/mp4)
            alert('File must have a \'video/mp4\' MIME type.');
        }
    }
};

// Set opacity, text and width of progress bar
function setProgressBar(opacityLvl, text, wPercent) {
    d3.select('#progressBar').style('opacity', opacityLvl);
    d3.select('#loadProgress').html(text);
    d3.select('#loadProgress').style('width', wPercent);
}

// Resets the progress bar 
function resetProgressBar(videoSubmitted) {
    setTimeout(function () {
            d3.select('#progressBar').style('opacity', 0);
            setTimeout(function () {
                d3.select('#loadProgress').style('width', '1%');
                
                if(videoSubmitted) {
                    d3.select('#videoSubmit')
                    .style('animation-play-state', 'running')
                    .style('-webkit-animation-play-state', 'running');
                    transitionToCanvas(1150, 1000);
                }                
            }, 1000);
            
        }, 1150);
};

// Move log file info and make video file elements visible
function setupVideoDrop() {
    d3.select('#logFileElements')
    .style('position', 'relative')
    .style('animation-play-state', 'running')
    .style('-webkit-animation-play-state', 'running');
    
    d3.select('#fileSubmit')
    .style('animation-play-state', 'running')
    .style('-webkit-animation-play-state', 'running');
    
    d3.select('#visualMediaFileElements')
    .style('position', 'relative')
    .style('animation-play-state', 'running')
    .style('-webkit-animation-play-state', 'running');
    console.log("a");
    
};

// Cancel drop if not in drop zone
function cancelDrop() {    
    d3.event.dataTransfer.dropEffect = 'copy';
    d3.event.stopPropagation();
    d3.event.preventDefault();
};