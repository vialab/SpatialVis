## Leap Motion Logging
---
- Current time from when Leap Motion controller was initialized in micro-seconds
- Number of recognized Leap Motion devices
- If application has focus
- Number of hands
- Number of gestures being performed

#### For Each Frame



#### For Each Hand
- Hand ID  
- Hand Direction
- Palm Normal
- Palm Position and Palm Stabilized Palm Position
- Palm Velocity
- Sphere Centre - The centre of a sphere fit to the curvature of this hand.
- Sphere Radius
- Time Visible in seconds - The duration of time this Hand has been visible to the Leap Motion Controller.
- Finger Count  
- Tool Count
- rotationAngle (Frame sinceFrame)  
 - The angle of rotation around the rotation axis derived from the change in orientation of this hand, and any associated fingers and tools, between the current frame and the specified frame. 
- rotationAngle (Frame sinceFrame, Vector axis)
 - The angle of rotation around the specified axis derived from the change in orientation of this hand, and any associated fingers and tools, between the current frame and the specified frame. 
- rotationAxis (Frame sinceFrame)
 - The axis of rotation derived from the change in orientation of this hand, and any associated fingers and tools, between the current frame and the specified frame. 
- rotationMatrix (Frame sinceFrame)
  - The transform matrix expressing the rotation derived from the change in orientation of this hand, and any associated fingers and tools, between the current frame and the specified frame. 
- rotationProbability (Frame sinceFrame)
 - The estimated probability that the hand motion between the current frame and the specified frame is intended to be a rotating motion. 
- scaleFactor (Frame sinceFrame)
 - The scale factor derived from this hand's motion between the current frame and the specified frame. 
- scaleProbability (Frame sinceFrame)
 - The estimated probability that the hand motion between the current frame and the specified frame is intended to be a scaling motion. 
- translation (Frame sinceFrame)
 - The change of position of this hand between the current frame and the specified frame. 
- translationProbability (Frame sinceFrame)
 - The estimated probability that the hand motion between the current frame and the specified frame is intended to be a translating motion. 

#### For Each Pointable (Finger/Tool)
- Direction in which the finger/tool is pointing
- Frame and Hand associated with it
- ID
- Estimated Length in mm
- Tip Position and Stabilized Tip Position
- Time Visible
- Tip velocity in mm/s
- Estimated width in mm
- Touch Distance
 - A value proportional to the distance between this Pointable object and the adaptive touch plane. 
- Touch Zone - The current touch zone of this Pointable object. 

#### For Each Gesture 
- Gesture Type
- Gesture ID
- Gesture State (start, update, stop)
- Gesture Duration in micro-seconds or seconds
- Hands and pointables associated with the gesture

##### For Circle Gesture
- Centre Point
- Normal
- Pointable doing the gesture
- Progress - Number of circles
- Radius of the circle

##### For Key Tap Gesture
- Direction of the finger tip motion
- Pointable performing the gesture
- Position where the key tap is registered

##### For Screen Tap Gesture
- Direction of the finger tip motion
- Pointable performing gesture
- Position of where the screen tap is registered

##### For Swipe Gesture
- Unit direction vector parallel to swipe motion
- Pointable performing the gesture
- Current position of the swipe
- Swipe speed in mm/second
- Start Position - Position of where swipe began
  

 