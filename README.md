# SpatialVis
Web-based Visualization of Spatial Gesture Interaction Logs

Erik Paluka - 2015

MIT License

Currently, requires a large or high resolution monitor.

Steps
-----
1. Use LogfileCreator with Processing (processing.org) to log Leap Motion gesture data (creates a json file after starting the Processing sketch)
2. At the same time, record a video screen capture of the graphical user interface
3. Open up index.html & drag 'n drop the json file into the browser
4. Drag 'n drop the video recording into the browser
5. Use the visualization tools to analyze the spatial interaction data
6. Hover over the video timeline's scrubber to make the video play button appear

*Caveat*
The LogfileCreator sketch and the video screen capture should both be started at the same time, which can be difficult.
