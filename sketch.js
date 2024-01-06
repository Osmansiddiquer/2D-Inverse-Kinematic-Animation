let A = {}, B = {}, C = {}, D = {}, E = {}, J = {}, N = {}, P = {}, M = {};
let theta_1 = 0, theta_2 = 0;
let O = { x: 0, y: 0 }
let status = "";
let speed = 40; //pixels per second 1px = 1mm

let serial;
let COM_PORT = "COM5" // Select your COM port here


let canvas;

function sendToSerial(theta_1, theta_2){ // takes angle in radians
    // serial.write(`${theta_1},${theta_2}`);
}

function setup() {
    createCanvas(1200, 600);
    updateJointPos();
}

setInterval(()=>{
    if(status !== ""){
        setTimeout(()=>{
            status = ""
        }, 5000)
    }
}, 20);

function mouseClicked() {
    // serial.open(COM_PORT);


    if(!checkXYConstraints((mouseX - width / 3) / 2, (mouseY - 2 * height / 3) / (-2))){
       status = "Invalid destination coordinates"; 
       return;
    }
    let thetas = calculateThetas((mouseX - width / 3) / 2, (mouseY - 2 * height / 3) / (-2));
    if(!thetas){
        status = "Sorry, the robot cannot reach such angles";
        return;
    }
    MoveSmoothly((mouseX - width / 3) / 2, (mouseY - 2 * height / 3) / (-2));
}

function draw() {
    background(220, 210, 232);
    translate(width / 3, 2 * height / 3);
    scale(2, -2);
    drawLinkage(O, A, N, P, M);
    drawLinkage(O, D, E, A);
    drawLinkage(J, C, B, A, C);
    drawLinkage(N, M, B);
    fill(0);
    circle(0, 0, 5);
    fill(255);
    scale(1/2, -1/2);
    translate(-width / 3, -2 * height / 3);
    text(`status: ${status}`, 20, 20);
    text(`Coordinates: (${N.x}, ${N.y})`, 20, 40);
    text(`Thetas: theta_1 = ${theta_1}, theta_2 = ${theta_2}`, 20, 60);
}

function drawLinkage(...points) {
    for (let i = 0; i < points.length - 1; i++) {
        line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
        circle(points[i].x, points[i].y, 5);
        circle(points[i + 1].x, points[i + 1].y, 5);
    }

}

function checkXYConstraints(x, y) {
    let valid = true;

    // CONSTRAINT 1
    if (x < 0)
        valid = false;

    // CONSTRAINT 2
    let distance = Math.sqrt(x * x + y * y);
    if (distance < 30 || distance > 250) {
        console.log(distance);
        valid = false;
    }

    return valid;
}

function checkThetaConstraints(t1, t2) {
    let valid = true;

    // CONSTRAINT 1
    if (t2 < -10 || t2 > 120) {
        valid = false;
    }

    // CONSTRAINT 2
    if (t1 + t2 < 0 || t1 + t2 > 160)
        valid = false;

    return valid;
}

function calculateThetas(x, y) {
    console.log(x, y);

    if (!checkXYConstraints(x, y)) {
        console.log("XY constraints failed");
        return null;
    }

    // Finding possible values of A_x and A_y
    let A1_x, A1_y, A2_x, A2_y

    if (x == 0 && y == 0) {
        A1_x = 0; A2_x = 0;
        A1_y = 125;
        A2_y = -125;
    }

    else if (y == 0) {
        A1_x = x / 2; A2_x = x / 2;
        A1_y = Math.sqrt(62500 - x ** 2) / 2;
        A2_y = -Math.sqrt(62500 - x ** 2) / 2;
    }

    else {
        A1_x = ((x ** 3) - sqrt(-(y ** 2) * ((x ** 4) + 2 * (x ** 2) * (y ** 2 - 31250) + (y ** 2) * (y ** 2 - 62500))) + x * (y ** 2)) / (2 * (x ** 2 + y ** 2))
        A1_y = ((x ** 2) * (y ** 2) + x * Math.sqrt(-(y ** 2) * ((x ** 4) + 2 * (x ** 2) * (y ** 2) - 62500 * (x ** 2) + (y ** 4) - 62500 * (y ** 2))) + (y ** 4)) / (2 * (x ** 2) * y + 2 * (y ** 3))

        A2_x = ((x ** 3) + sqrt(-(y ** 2) * ((x ** 4) + 2 * (x ** 2) * (y ** 2 - 31250) + (y ** 2) * (y ** 2 - 62500))) + x * (y ** 2)) / (2 * (x ** 2 + y ** 2))
        A2_y = ((x ** 2) * (y ** 2) - x * Math.sqrt(-(y ** 2) * ((x ** 4) + 2 * (x ** 2) * (y ** 2) - 62500 * (x ** 2) + (y ** 4) - 62500 * (y ** 2))) + (y ** 4)) / (2 * (x ** 2) * y + 2 * (y ** 3))
    }
    let theta_1, theta_2;
    if (A1_y > A2_y) {
        theta_1 = Math.atan(A1_y / A1_x);
        if (A1_x < 0) theta_1 += Math.PI;

        theta_2 = Math.atan((A1_y - y) / (x - A1_x));
        if (x - A1_x < 0) theta_2 += Math.PI;
    }
    else {
        theta_1 = Math.atan(A2_y / A2_x);
        if (A2_x < 0) theta_1 += Math.PI;

        theta_2 = Math.atan((A2_y - y) / (x - A2_x));
        if (x - A2_x < 0) theta_2 += Math.PI;
    }

    if (!checkThetaConstraints(theta_1, theta_2)) {
        console.log("Theta constraints failed");
        return null;
    }

    return [theta_1, theta_2];
}

function updateJointPos() {
    A.x = 125 * Math.cos(theta_1);
    A.y = 125 * Math.sin(theta_1);

    B.x = A.x + 12.792;
    B.y = A.y + 27.685;

    C.x = A.x - 10.716;
    C.y = A.y + 28.552;

    J.x = -10.716
    J.y = 28.552

    D.x = -40 * Math.cos(theta_2);
    D.y = 40 * Math.sin(theta_2);

    E.x = A.x + D.x;
    E.y = A.y + D.y;

    N.x = A.x + 125 * Math.cos(theta_2);
    N.y = A.y - 125 * Math.sin(theta_2);
    console.log(N);

    P.x = N.x + 40;
    P.y = N.y;

    M.x = N.x + 12.792;
    M.y = N.y + 27.685;
}

function MoveSmoothly(dest_x, dest_y) {
    // Clear any pre-existing intervals
    if(animation_interval)
        clearInterval(animation_interval);
    function move() {
        const deltaX = dest_x - N.x;
        const deltaY = dest_y - N.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Normalize the direction vector
        const directionX = deltaX / distance;
        const directionY = deltaY / distance;

        // Update the pixel position
        let thetas = calculateThetas(
            N.x + directionX * speed * deltaTime / 1000,
            N.y + directionY * speed * deltaTime / 1000
        );

        if (thetas){
            [theta_1, theta_2] = thetas;

            sendToSerial(theta_1, theta_2);
        }
        else
            console.log("Cannot go further. Constraints violated")
        // console.log(degrees(theta_1), degrees(theta_2));
        updateJointPos();   // updates to new values for theta_1 and theta_2

        // clear interval if destination has been reached
        if (
            Math.abs(N.x - dest_x) < speed*deltaTime/1000 &&
            Math.abs(N.y - dest_y) < speed*deltaTime/1000
        )
            clearInterval(animation_interval);
    }
    animation_interval = setInterval(move, 16);
}

let animation_interval;


// // Serial read and animate example
// // Reads an ASCII-encoded string from a seiral port via a webSocket server.
// // Animates the text on the screen with the received value
// // You can use this with the included Arduino example called AnalogReadSerial.
// // Works with P5 editor as the socket/serial server, version 0.5.5 or later.
// // written 2 Oct 2015
// // by Tom Igoe

// // constant for example name
// const exampleName = '05-readAndAnimate';

// // variable for background color of the p5.js canvas
// let yellow;

// // variable for text color
// let black;

// // variable for p5.SerialPort object
// let serial;

// // variable por serialPortName
// let serialPortName = '/192.168.1.11/8081';

// // variable for HTML DOM input for serial port name
// let htmlInputPortName;

// // variable for HTML DOM button for entering new serial port name
// let htmlButtonPortName;

// let textXpos = 10;

// // p5.js setup() runs once, at the beginning
// function setup() {
//   // small canvas
//   createCanvas(300, 300);

//   // set yellow color for background
//   yellow = color(255, 255, (255 * 2) / 8);

//   // set black color for text
//   black = color(0);

//   // set text alignment
//   textAlign(LEFT, CENTER);

//   // p5.js to create HTML input and set initial value
//   htmlInputPortName = createInput(serialPortName);

//   // p5.js to create HTML button and set message
//   button = createButton('update port');

//   // p5.js to add callback function for mouse press
//   button.mousePressed(updatePort);

//   // create instance of p5.SerialPort
//   serial = new p5.SerialPort();

//   // print version of p5.serialport library
//   console.log('p5.serialport.js ' + serial.version);

//   // Get a list the ports available
//   // You should have a callback defined to see the results. See gotList, below:
//   serial.list();

//   // Assuming our Arduino is connected,  open the connection to it
//   serial.openPort(serialPortName);

//   // When you get a list of serial ports that are available
//   serial.on('list', gotList);

//   // When you some data from the serial port
//   serial.on('data', gotData);
// }

// // p5.js draw() runs after setup(), on a loop
// function draw() {
//   // paint background
//   background(yellow);

//   // set text color
//   fill(black);

//   // set text alignment
//   textAlign(LEFT, CENTER);

//   // place example name on the top of the canvas
//   text(exampleName, (5 * width) / 100, (5 * height) / 100);

//   text('sensor value: ' + textXpos, textXpos, 30);
// }

// // callback function to update serial port name
// function updatePort() {
//   // retrieve serial port name from the text area
//   serialPortName = htmlInputPortName.value();
//   // open the serial port
//   serial.openPort(serialPortName);
// }

// // Got the list of ports
// function gotList(thelist) {
//   print('List of Serial Ports:');
//   // theList is an array of their names
//   for (let i = 0; i < thelist.length; i++) {
//     // Display in the console
//     print(i + ' ' + thelist[i]);
//   }
// }

// // Called when there is data available from the serial port
// function gotData() {
//   let currentString = serial.readLine(); // read the incoming data
//   trim(currentString); // trim off trailing whitespace
//   if (!currentString) return; // if the incoming string is empty, do no more
//   console.log(currentString);
//   if (!isNaN(currentString)) {
//     // make sure the string is a number (i.e. NOT Not a Number (NaN))
//     textXpos = currentString; // save the currentString to use for the text position in draw()
//   }
// }