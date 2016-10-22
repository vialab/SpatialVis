import com.leapmotion.leap.*;
import com.leapmotion.leap.processing.LeapMotion;
import java.io.*;

LeapMotion leapMotion;
PrintWriter output;
JSONArray mainJson;
JSONArray frames;
int frameCounter;
//long startTime = 0;
//boolean firstFrameDone = false;

boolean textFileFlag = false;

/* Need to push ESC to save json file */
void setup() {
  size(16 * 50, 9 * 50);
  background(20);
  if(textFileFlag) {
    output = createWriter("logfile.txt");
  }
  mainJson = new JSONArray();
  frames = new JSONArray();
  frameCounter = 0;
  leapMotion = new LeapMotion(this);
  
  registerMethod("dispose", this);
  
}

void draw() {
  fill(200);
  rect(0, 0, width, height);
}

void dispose() {
  saveJSONArray(mainJson, "logFile.json");
}

void onInit(final Controller controller) {
  println("Leap Motion Controller has been Initialized");
  // Send Leap Motion data to pde even when not in focus
  controller.setPolicyFlags(Controller.PolicyFlag.POLICY_BACKGROUND_FRAMES);

  // Enable Gestures
  controller.enableGesture(Gesture.Type.TYPE_CIRCLE);
  controller.enableGesture(Gesture.Type.TYPE_SWIPE);
  controller.enableGesture(Gesture.Type.TYPE_KEY_TAP);
  controller.enableGesture(Gesture.Type.TYPE_SCREEN_TAP);
}

void onConnect(final Controller controller) {
  println("Leap Motion Controller has Connected");
}

void onDisconnect(final Controller controller) {
  println("Leap Motion Controller has Disconnected");
  output.flush();
}

void onExit(final Controller controller)
{
  println("Leap Motion Controller has Exited");
  output.flush();
  output.close();
}

void onFrame(final Controller controller) {
  Frame frame = controller.frame();
  
  //if (!firstFrameDone) {
  //  startTime = frame.timestamp();
  //  firstFrameDone = true;
 // }

  // Flag for flushing data to logfile
  // DO I REALLY NEED THIS ANYMORE????
  boolean notEmpty = false;


  //if (!frame.hands().isEmpty()) { 
    notEmpty = true;

   if(textFileFlag) {
    // Write out the time since the leap motion initialized
   output.print("{ \"Hands\"Time (µs): " + frame.timestamp() + ", ");
   output.print("Hands Count: " + frame.hands().count() + ", ");
   }
   
   JSONObject jFrame = new JSONObject();
   jFrame.setFloat("id", int(frame.id()));
   jFrame.setFloat("time", frame.timestamp());
   jFrame.setInt("handCount", frame.hands().count());
   //println(frameCounter);
   jFrame.setInt("gestureCount", frame.gestures().count()); 
   
   JSONArray jHandArray = new JSONArray();
   int handCounter = 0;

   for (Hand hand: frame.hands()) {
    if(textFileFlag) {
     output.print("Hand ID: " + hand.id() + ", ");
     output.print("Hand Direction: " + hand.direction() + ", ");
     output.print("Palm Normal: " + hand.palmNormal() + ", ");
     output.print("Palm Position: " + hand.palmPosition() + ", ");
     output.print("Stabilized Palm Position: " + hand.stabilizedPalmPosition() + ", ");
     output.print("Palm Velocity: " + hand.palmVelocity() + ", ");
     output.print("Sphere Centre: " + hand.sphereCenter() + ", ");
     output.print("Sphere Radius: " + hand.sphereRadius() + ", ");
     output.print("Time Visible (s): " + hand.timeVisible() + ", ");
     output.print("Finger Count: " + hand.fingers().count() + ", ");
     output.print("Tool Count: " + hand.tools().count() + ", ");
    }
     
     JSONObject jHand = new JSONObject();
     jHand.setInt("id", hand.id());
     
     JSONObject jDirection = new JSONObject();
     jDirection.setFloat("x", hand.direction().getX());
     jDirection.setFloat("y", hand.direction().getY());
     jDirection.setFloat("z", hand.direction().getZ());
     jHand.setJSONObject("direction", jDirection);
     
     JSONObject jPNormal = new JSONObject();
     jPNormal.setFloat("x", hand.palmNormal().getX());
     jPNormal.setFloat("y", hand.palmNormal().getY());
     jPNormal.setFloat("z", hand.palmNormal().getZ());
     jHand.setJSONObject("palmNormal", jPNormal);
     
     JSONObject jPPos = new JSONObject();
     jPPos.setFloat("x", hand.palmPosition().getX());
     jPPos.setFloat("y", hand.palmPosition().getY());
     jPPos.setFloat("z", hand.palmPosition().getZ());
     jHand.setJSONObject("palmPos", jPPos);
     
     JSONObject jSPPos = new JSONObject();
     jSPPos.setFloat("x", hand.stabilizedPalmPosition().getX());
     jSPPos.setFloat("y", hand.stabilizedPalmPosition().getY());
     jSPPos.setFloat("z", hand.stabilizedPalmPosition().getZ());
     jHand.setJSONObject("stablePalmPos", jSPPos);
     
     JSONObject jPVel = new JSONObject();
     jPVel.setFloat("x", hand.palmVelocity().getX());
     jPVel.setFloat("y", hand.palmVelocity().getY());
     jPVel.setFloat("z", hand.palmVelocity().getZ());
     jHand.setJSONObject("palmVel", jPVel);
     
     JSONObject jSCentre = new JSONObject();
     jSCentre.setFloat("x", hand.sphereCenter().getX());
     jSCentre.setFloat("y", hand.sphereCenter().getY());
     jSCentre.setFloat("z", hand.sphereCenter().getZ());
     jHand.setJSONObject("sphereCentre", jSCentre);
     
     jHand.setFloat("sphereRadius", hand.sphereRadius());
     jHand.setFloat("timeVisible", hand.timeVisible());
     jHand.setInt("fingers", hand.fingers().count());
     jHand.setInt("tools", hand.tools().count());
    
     
     JSONArray jPointArray = new JSONArray();
     int pointCounter = 0;
     
      for(Pointable p: hand.pointables()) {
        if(textFileFlag) {
         output.print("Pointable ID: " + p.id() + ", ");
         output.print("Associated Hand ID: " + p.hand().id() + ", ");
         output.print("Pointable Direction: " + p.direction() + ", ");
         output.print("Pointable Length: " + p.length() + ", ");
         output.print("Pointable Width: " + p.width() + ", ");
         output.print("Pointable Tip Position: " + p.tipPosition() + ", ");
         output.print("Pointable Stabilized Tip Position: " + p.stabilizedTipPosition() + ", ");
         output.print("Pointable Tip Velocity: " + p.tipVelocity() + ", ");
        
          if(p.isFinger()) {
           output.print("Pointable Type: finger, ");
          } else if(p.isTool()) {
           output.print("Pointable Type: tool, ");
          }
        }
        
        
        JSONObject jPoint = new JSONObject();
        jPoint.setInt("id", p.id());
        
        JSONObject jPoDirection = new JSONObject();
        jPoDirection.setFloat("x", p.direction().getX());
        jPoDirection.setFloat("y", p.direction().getY());
        jPoDirection.setFloat("z", p.direction().getZ());
        jPoint.setJSONObject("direction", jPoDirection);
        
        jPoint.setFloat("length", p.length());
        jPoint.setFloat("width", p.width());
        
        JSONObject jTipPos = new JSONObject();
       jTipPos.setFloat("x", p.tipPosition().getX());
       jTipPos.setFloat("y", p.tipPosition().getY());
       jTipPos.setFloat("z", p.tipPosition().getZ());
       jPoint.setJSONObject("tipPos", jTipPos);
       
       JSONObject jSTipPos = new JSONObject();
       jSTipPos.setFloat("x", p.stabilizedTipPosition().getX());
       jSTipPos.setFloat("y", p.stabilizedTipPosition().getY());
       jSTipPos.setFloat("z", p.stabilizedTipPosition().getZ());
       jPoint.setJSONObject("stableTipPos", jSTipPos);
       
       JSONObject jTipVel = new JSONObject();
       jTipVel.setFloat("x", p.tipVelocity().getX());
       jTipVel.setFloat("y", p.tipVelocity().getY());
       jTipVel.setFloat("z", p.tipVelocity().getZ());
       jPoint.setJSONObject("tipVel", jTipVel);
       
       if(p.isFinger()) {
         jPoint.setString("type", "finger");
        } else if(p.isTool()) {
         jPoint.setString("type", "tool");
        }       
        
        jPointArray.setJSONObject(pointCounter, jPoint);
        pointCounter++; 
      
      }
      
      jHand.setJSONArray("pointables", jPointArray);
      jHandArray.setJSONObject(handCounter, jHand);
      handCounter++;
    }
    jFrame.setJSONArray("hands", jHandArray);
        

    if (!frame.gestures().isEmpty()) {
      if (notEmpty && textFileFlag) {
        output.println();
      } else {
        notEmpty = true;
      }   
  
     if(textFileFlag) {
       output.print("Gesture Count: " + frame.gestures().count() + " ");
     }
      JSONArray jGestures = new JSONArray();
      int gestureCounter = 0;
      
      for (Gesture gesture : frame.gestures()) {
       if(textFileFlag) {
         output.print("Gesture Type: " + gesture.type() + ", ");
         output.print("Gesture ID: " + gesture.id() + ", ");
         output.print("Gesture State: " + gesture.state() + ", ");
         output.print("Gesture Duration (µs): " + gesture.duration() + ", ");
       }
       int type = gesture.type().swigValue();
       
       JSONObject jGest = new JSONObject();
       jGest.setInt("type", type);
       
       if(type == 1) {
         println("Swipe on frame " + frameCounter);
       } else if(type == 4) {
         println("Circle on frame " + frameCounter);
       } else if(type == 5) {
         println("Screen Tap on frame " + frameCounter);
       } else if(type == 6) {
         println("Key Tap on frame " + frameCounter);
       } 
       
       jGest.setInt("id", gesture.id());
       jGest.setInt("state", gesture.state().swigValue());
       jGest.setFloat("duration", gesture.duration());
       
       JSONArray jGestPointObj = new JSONArray();
       int c = 0;
       for(Pointable pp : gesture.pointables()) {
         jGestPointObj.setInt(c, pp.id());
         c++;
       }
       
       jGest.setJSONArray("pointIDs", jGestPointObj);
       
       JSONArray jGestHandObj = new JSONArray();
       c = 0;
       for(Hand hh : gesture.hands()) {
         jGestHandObj.setInt(c, hh.id());
         c++;
       }
       
       jGest.setJSONArray("handIDs", jGestHandObj);
       
       jGestures.setJSONObject(gestureCounter, jGest); 
       gestureCounter++;
       
      }
      
      jFrame.setJSONArray("gestures", jGestures);
    }
    
    
    mainJson.setJSONObject(frameCounter, jFrame);
    frameCounter++;
    
   //}

  if (notEmpty && textFileFlag) {
    output.println();
    output.println("---");
    output.flush();
  }
}

