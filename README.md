# 2D-Inverse-Kinematic-Animation
The result of some experimentation trying to calculate the angles for servo motors given the final x and y coordinates for a friend's project. The major constraint was that motors could not be placed at the arms. So both arms had to be moved using the motors at the base.
_This does not include the code for driving the motors. You will have to set up a serial server for that and modify the sendToSerial function in the sketch.js file to send the angles over the connection._

## To run:
- Clone the repo
- Open index.html in your favorite browser
- Try pressing on the purple box to see the arm move and the angles change (theta_1 and theta_2 change).

Take a look at this Desmos graph to see what theta_1 and theta_2 indicate: https://www.desmos.com/calculator/6owvnwl81b

## Preview:
https://osmansiddiquer.github.io/2D-Inverse-Kinematic-Animation/

![image](https://github.com/Osmansiddiquer/2D-Inverse-Kinematic-Animation/assets/90533561/668109ef-9eeb-46ce-b3a2-b4cbc11e41be)

The point N (see the Desmos graph) follows a straight path to the destination.
