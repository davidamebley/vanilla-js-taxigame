// https://github.com/pothonprogramming/pothonprogramming.github.io/blob/master/content/collision/collision.js 	
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// https://stackoverflow.com/questions/31106189/create-a-simple-10-second-countdown
// GLOBAL VARIABLES


var CANVAS;
var SIZE=1000;
var CANVAS_WIDTH=1000
var CANVAS_HEIGHT=1000
var frame=0;
var SOUNDS = [];
var PASSENGER_SCREAMS = [];
var PASSENGER_IMAGE = [];
var PASSENGER_IMAGE_REVERSE = [];
var DESTINATION_NAMES = ["the hospital", "work", "the airport", "his girlfriend's place"];
//Road Boundaries For Taxi
var UPPER_BOUNDARY = 0.0;var LOWER_BOUNDARY = 0.8;var RIGHT_BOUNDARY = 0.65;var LEFT_BOUNDARY = 0.15;
// ROAD VARS
sidepathstartingpintx=0;road_loc=0.2;sidepath2startingpointx=0.8

road_bound_pos_x1=road_loc;road_bound_pos_x2=parseFloat(sidepath2startingpointx);road_bound_pos_y=0

let lineProp={
	strokes:3,
	lanes:2,
	location:[road_bound_pos_x1,road_bound_pos_x2,road_bound_pos_y],
	scale_x:0.6,
	scale_y:1
}

// TAXI variables
const SPEED = 0.01;const currentKeysPressed = {};const OBJECTS = []; let seconds_stored=[]

// Car Obstacle Variables

let carsarr=[];let carsarr1=[];let carsarr2=[];let carsarr3=[];let carsarr4=[];


let basicCanvas;let obstaclesCanvas;let secondsCanvas;let passengerCanvas;let backgroundforpassenger;


// let GAMESPEED=0.001;
let loopcomplete=false;let firstfunc=true;
// let lvl=0;
// Animate
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
var myReq;var continueAnimating = true;


// Animate Passenger PICK
var requestAnimationFramePass = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFramePass = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
var passReq;var continueAnimatingPass = true;

// Animate Passenger DROP
var requestAnimationFramePassDrop = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFramePassDrop = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
var passDropReq;var continueAnimatingPassDrop = true;

//Audio
var AUDIO_CONTEXT;
//PASSENGER
var passctx;
var isPaused = false;
//Preload Passenger Image Src
preload_passenger_images();
//Get a random passenger image int
var randomPassengerInteger;
var randomPassengerInteger2;

// 
var time_in_ms_main=0;

let passengers_distances=[20,50,80,100];
// let passengers_distances=[5,20,50,70];

//Get a random name once for first passenger
let first_destination_name = getRandomDestinationNames();

var current_destination_distance;
// let secs=0;
let taxi_dis=0;
let SCORE=0;
var COUNTDOWNPAUSED=false;

var animate_runtime_in_secs=0;


var NOSFLAG=false;
var NOSSPEED=0.02

// Class Object Arrays. 
var ROADLINES=[]
let colorRects=[];
let PASSENGER = [];
let CAROBSTACLES=[];
const TAXI = [];
// Class Objects
let taxiObject;
let taxicolor;
let carObstaclesObject;
let gameObject;
let animatePassengerObject;
let animateObject;
let scoreBoardObject;

//Boolean to check Passenger picked status
let isPassengerPicked = false;
let isNextPassengerPicked = false;


function initializeCanvas(canvasID){
	const canvas=document.getElementById(canvasID);
	canvas.width=CANVAS_WIDTH
	canvas.height=CANVAS_HEIGHT
	return canvas
}

function main(){
	basicCanvas=initializeCanvas("basicRoadCanvas");
	obstaclesCanvas=initializeCanvas("obstaclesCanvas");
	passengerCanvas=initializeCanvas("passengerCanvas");
	backgroundforpassenger=initializeCanvas("backgroundforpassenger");
	var ctx=basicCanvas.getContext('2d');
	var passctx=passengerCanvas.getContext('2d');
	var bgin=backgroundforpassenger.getContext('2d');
	ctx.scale(SIZE,SIZE);
	passctx.scale(SIZE,SIZE);
	bgin.scale(SIZE,SIZE);

	//Event Listeners
	addEventListeners(basicCanvas);

	//Click Listeners
	passengerCanvas.addEventListener('click', ()=> {//Click to pick Passenger
		pickPassenger(); 
		}, false);
	//Click to remove Pick Passenger Overlay
	document.getElementById("pick_passenger_overlay").addEventListener('click', ()=> {
		pickPassenger();
		}, false);

	//Load All Sounds
	loadSounds();

	// Road lines creation.
	ROADLINES.push(new roadLineClass (lineProp));

	taxiObject=new Taxi("",[0.6,0.8],0.2,0.2)
	taxiObject.loadTaxi("https://imgur.com/thKSvp1.png");
	TAXI.push(taxiObject);
	taxicolor = new Rectangle([0.66,0.82], 0.0687, 0.16, "rgba(0,0,0,0.6)");

	carObstaclesObject=new carObstacles("","","","","")
	carObstaclesObject.loadObstaclesImagesOnce();

	
	gameObject=new Game(10,1000,10,'');
	var lvl=gameObject.getGameLevel(0);

	carsarr=carObstaclesObject.loadObstaclesImages(lvl);

	passengerObject = new Passenger("",[1,1],0.15,0.15)
	randomPassengerInteger = getRandomPassengerImageInt();
	passengerObject.loadPassenger(getPassengerImage(0, randomPassengerInteger)); //direction:left or right(reverse), index: which passenger (Face Taxi)
	// passengerObject.loadPassenger("https://imgur.com/9Tob07C.png");
	PASSENGER.push(passengerObject);
	// // Passenger Animation 
	animatePassengerObject=new AnimatePassenger();
	animateObject=new Animate();// animate();

	animatePassengerObject.animatePassenger();
}



function drawScene(){
	basicCanvas = document.getElementById("basicRoadCanvas")
	obstaclesCanvas = document.getElementById("basicRoadCanvas")

	let ctx=basicCanvas.getContext("2d");
	let obsCtx=obstaclesCanvas.getContext("2d");
	drawbackGround(ctx);
	
	drawRoad(ctx,ROADLINES[0].getRoadProps());
	ROADLINES[0].location[2]+=gameObject.getGameSpeed();	  
	ROADLINES[0].drawRoadLine(ctx)
	if (ROADLINES[0].location[2]>0.4){
	ROADLINES[0].location[2]=0;
	} 

	TAXI[0].draw(ctx);
	
	if(CAROBSTACLES.length!=0){
		for (var i=0;i<CAROBSTACLES.length;i++){
			CAROBSTACLES[i].draw(obsCtx);
		}
	}
	taxicolor.draw(ctx);


	for (var i=0;i<colorRects.length;i++){
		colorRects[i].draw(obsCtx);
		if (colorRects[i].testCollision(taxicolor) ) {
			continueAnimating=false;
			showOverlay();
		}
	}



}

function drawbackGround(ctx){

//   Blue Section
	ctx.beginPath();
	ctx.fillStyle="lightgreen";
	ctx.rect(0,0,0.2,1);
	ctx.fill();
// Road Part
	ctx.beginPath();
	ctx.fillStyle="rgba(40,30,60,0.2)";
	ctx.rect(0.2,0,0.6,1);
	ctx.fill();
  
// Red Part
	ctx.beginPath();
	ctx.fillStyle="lightgreen";
	ctx.rect(0.8,0,0.2,1);
	ctx.fill();
	
}

function drawRoad(ctx,props){
	ctx.save()

    ctx.translate(props.location[0],props.location[2]);
    ctx.scale(props.scale_x,props.scale_y);
	ctx.beginPath();  
	ctx.fillStyle="rgba(20,40,40,0.5)";
	
	ctx.rect(0,0,1,1);
	ctx.fill();
	
	ctx.restore();

}


class roadLineClass{
	constructor(prop){
	
		this.strokes=prop.strokes;
		this.lanes=prop.lanes;
		this.location=prop.location;
		this.scale_x=prop.scale_x;
		this.scale_y=prop.scale_y;
	}
	drawRoadLine(ctx){
		ctx.save()
	
		ctx.translate(this.location[0],this.location[2]);
		ctx.scale(this.scale_x,this.scale_y);
		 pos_x=0

		if(this.lanes!=1){
		var pos_x=this.scale_x/this.lanes
		var diff_in_lanes=this.location[1]/this.lanes
		}
		else{
			pos_x=this.lanes/2
		}
	
		for(let i=1;i<=this.lanes;i++){
			ctx.save()
			for(let i=1;i<=this.strokes;i++){
				ctx.beginPath();  
				ctx.fillStyle="rgba(255,255,0,0.8)";
				
				ctx.rect(pos_x,0,0.05,0.1);
				ctx.fill();
				ctx.translate(0,0.4);
			}
			if(this.lanes!=1){
				pos_x+=diff_in_lanes
			}
			ctx.restore()
			
		}
		ctx.restore();
	
	
	}
	getRoadProps(){
		let roadProp={
			location:[road_bound_pos_x1,road_bound_pos_x2,road_bound_pos_y],
			scale_x:0.6,
			scale_y:1
		}
		return roadProp
	}
}
class Rectangle{
	constructor(loc, width, height, color) {
		this.location = loc;
		this.width = width;
		this.height = height;
		this.color = color;
	}
	draw(ctx){
		ctx.beginPath();
		ctx.rect(this.location[0], this.location[1], this.width, this.height);
		ctx.fillStyle = this.color;
    	ctx.fill();
	}	
	get bottom() { return this.location[1] + this.height; }
	get left() { return this.location[0]; }
	get right() { return this.location[0] + this.width; }
	get top() { return this.location[1]; }

	testCollision(rectangle){
		if (this.top > rectangle.bottom || this.right < rectangle.left || this.bottom < rectangle.top || this.left > rectangle.right) {
			return false;
	  
		  }
	  
		  return true;
	  
	}

}


//Function Pick Passenger
function pickPassenger(){
	if (isPassengerPicked == false) {
		isPassengerPicked=true;
		removePickPassengerOverlay();
		
		stopSound(7);
	}
}


//Taxi
class Taxi{
	constructor(image,location,width, height){
		this.image = image;
		this.location = location;
		this.width = width;
		this.height = height;

	} draw(ctx){
		ctx.save();//Store current context coordinates

	    	ctx.drawImage(this.image, this.location[0],this.location[1],this.width,this.height);
		ctx.restore();
	}
	loadTaxi(path){
		//Load Taxi Image from File
		var taxiImage = new Image(); 

		taxiImage.onload = () => {
			console.log("Image loaded");
		};
		taxiImage.src =	path;
		this.image=taxiImage;
	}
	steerTaxi(ctx,canvas){
	
		if(currentKeysPressed['ArrowUp'] && TAXI[0].location[1] > UPPER_BOUNDARY) {
			/* Arrow up was just pressed, or is being held down*/
			  ctx.save();
			  NOSFLAG=true;
			  ROADLINES[0].location[2]+=NOSSPEED;	
			  if (CAROBSTACLES.length!=0){
				  for (var i=0;i<carsarr.length;i++){
					  CAROBSTACLES[i].location[1]+=NOSSPEED;	 
					  colorRects[i].location[1]+=NOSSPEED;	  
		   
				  }  
	  		  }
			  //Play Rev Sound
			  playSound(8);
			  ctx.restore();
			  
		}else{
			//Stop Rev Sound
			stopSound(8);
		}
		if(currentKeysPressed['ArrowDown'] && TAXI[0].location[1] < LOWER_BOUNDARY) {
			  /* Arrow up was just pressed, or is being held down*/
			  ctx.save();
		  // TAXI[0].location[1] +=SPEED;
			  ROADLINES[0].location[2]-=0.01;	
			  for (var i=0;i<carsarr.length;i++){
				  CAROBSTACLES[i].location[1]+=0.002;	  
			  
			  }    
			  
			  ctx.restore();
	  }
		if(currentKeysPressed['ArrowRight'] && TAXI[0].location[0] < RIGHT_BOUNDARY) {
			   /* Arrow up was just pressed, or is being held down*/
				ctx.save();
	  
				TAXI[0].location[0]+=SPEED;
				taxicolor.location[0]+=SPEED;
				
			  ctx.restore();
		}
	  
		
	  
		if(currentKeysPressed['ArrowLeft'] && TAXI[0].location[0] > LEFT_BOUNDARY) {
			/* Arrow up was just pressed, or is being held down*/
			ctx.save();
			TAXI[0].location[0]-=SPEED;
			taxicolor.location[0]-=SPEED;
	  
			ctx.restore();
		}

	}
}


class ScoreBoard{
	updateBoard(){
		var gs = document.getElementById('gamespeed');
		gs.innerText = "Game Speed:"+gameObject.getGameSpeed()*1000;
		// sc = document.getElementById('secondscounter');
		// sc.innerText = "Seconds:  "+seconds;
	}
	
}
// var totaltime=20;
// var setintervaltime=2000;
// var totaltime2=20;
// var setInvObject;
var lvl=1
var GAMELEVELS = [1,2,3];
class Game{
	constructor(totaltime,setintervaltime,totaltime2,setInvObject){
		this.GAMELEVELS = [1,2,3];
		this.totaltime=totaltime;
		this.setintervaltime=setintervaltime;
		this.totaltime2=totaltime2;
		this.setInvObject=setInvObject;
		this.lvlindx=0;
		this.lvl=1;
		this.secs_passed=0;
		this.GAMESPEED=0.002;
		// this.NOSSPEED=0.02
	}
	selectGameLevel(){
		if(loopcomplete==true){
			var inx=getRandomIntInclusive(0,this.GAMELEVELS.length-1);
			lvl=GAMELEVELS[inx]
			// lvl=2;
		
			loopcomplete=false;
			if(lvl==1){
				console.log("LEVEL>>>>>>>>>>>>>1")
	
				loopcomplete=animateObject.levelOneAnimation();
			}
			else if (lvl==2){
				console.log("LEVEL>>>>>>>>>>>>>2")
				loopcomplete=animateObject.levelTwoAnimation();
			}
			else if (lvl==3){
				console.log("LEVEL>>>>>>>>>>>>>3")
				loopcomplete=animateObject.levelThreeAnimation();
			}
			// else if (lvl==4){
			// 	console.log("LEVEL>>>>>>>>>>>>>4")
			// 	loopcomplete=animateObject.levelFourAnimation();
			// }
		}

	}
	increaseGameSpeed(seconds){
		// Increases the spped after 5 seconds. 
		if(!seconds_stored.includes(seconds) && seconds!=0){
			if (seconds%5==0){
				seconds_stored.push(seconds)
				if (this.GAMESPEED>=0.018){
					this.GAMESPEED=0.018;
				}
				else{
					this.GAMESPEED+=0.001
				}
			}
		}
	}
	countScore(PASSENGERDROPPED){
		if (PASSENGERDROPPED){
			SCORE+=50;
			SCORE=parseFloat(SCORE.toFixed(2));
		}else{
			SCORE+=2;
			SCORE=parseFloat(SCORE.toFixed(2));

		}
		document.getElementById("score").innerHTML ="Score:"+ SCORE ;
	}
	countDown(){
		if (COUNTDOWNPAUSED==false){
			if(gameObject.getTotalTime()<= 0){
				// Clear Interval STOP
				clearInterval(gameObject.getSetIntervalObject());
				document.getElementById("countdown").innerHTML = "Time is Exhausted";
				continueAnimating=false;
				window.cancelAnimationFrame(myReq);
				timeOver();
			  } else {
				//   Count Down TIME
					//   Time Spent Playing (SECS)
				console.log("this.totalTime",gameObject.getTotalTime())

				gameObject.setSecsPassed(Math.abs(gameObject.getTotalTime()-gameObject.getTotalTimeTwo()));
				// this.secs_passed=this.setInvObject
				document.getElementById("timetravelled").innerHTML ="Time Secs:"+ gameObject.getSecsPassed();
				document.getElementById("countdown").innerHTML ="Remaining Time Secs:"+ gameObject.getTotalTime() ;
			}
			var tottime=gameObject.getTotalTime();
			console.log("tottime",tottime)
			tottime-=1;
			console.log("tottime--",tottime)
			// debugger

			gameObject.setTotalTime(tottime);

			if (!PASSENGERDROPPED){
			gameObject.countScore(PASSENGERDROPPED);
			}

	
		}
		
	}
	calculateDistance(){
		// Check if Up Arrow Key is pressed.  
		// If not==// Run this is the Game speed is gradually increasing. 
		if(NOSFLAG==false){
			var gamespeed=this.GAMESPEED*1000
		

			taxi_dis=taxi_dis+gamespeed*gameObject.getSecsPassed()/1000;
			console.log("taxi_dis",taxi_dis)

			document.getElementById("distancecovered").innerHTML ="Distance: "+ parseFloat(taxi_dis.toFixed(5))+" Km";
		}
		// Else Run this For NOS SPEED 
		else{
			var gamespeed=NOSSPEED*1000
			taxi_dis=taxi_dis+gamespeed*gameObject.getSecsPassed()/1000

			document.getElementById("distancecovered").innerHTML ="Distance: "+ parseFloat(taxi_dis.toFixed(5))+" Km";
		}
	}
	getTotalTime(){
		return this.totaltime;
	}
	setTotalTime(totaltime){
		this.totaltime=totaltime;
	}
	updateTotalTime(totaltime){
		this.totaltime=this.totaltime+totaltime;
	}
	getTotalTimeTwo(){
		return this.totaltime2;
	}
	setTotalTimeTwo(totaltime2){
		this.totaltime2=totaltime2;
	}
	updateTotalTime2(totaltime2){
		this.totaltime2=this.totaltime2+totaltime2;
	}
	getSetIntervalTime(){
		return this.setintervaltime;
	}
	setSetIntervalTime(setintervaltime){
		 this.setintervaltime=setintervaltime;
	}
	updateSetIntervalTime(setintervaltime){
		this.setintervaltime=this.setintervaltime+setintervaltime;
   }
	getSetIntervalObject(){
		return this.setInvObject;
	}
	setSetIntervalObject(setInvObject){
		 this.setInvObject=setInvObject;
	}
	getGameSpeed(){
		return this.GAMESPEED;
	}
	setGameSpeed(){
		return this.GAMESPEED=0.002
	}
	
	setGameLevels(gamelevels){
		this.GAMELEVELS=gamelevels;
	}
	getGameLevel(lvlinx){
		return this.GAMELEVELS[lvlinx]
	}
	getCurrentLevel(){
		return this.GAMELEVELS[this.lvlindx]
	}
	setCurrentInx(inx){
		this.lvlindx=inx;
	}
	setSecsPassed(secs){
		this.secs_passed=secs;
	}
	getSecsPassed(){
		return this.secs_passed
	}
}

//carObstacles
class carObstacles{

	constructor(image,location,width, height){
		this.image = image;
		this.location = location;
		this.width = width;
		this.height = height;
		// this.obstacles_imgarray=imgarray;
		// this.carsarr1=[];
		// this.carsarr2=[];
		// this.carsarr3=[];
		// this.carsarr4=[];


	} draw(ctx){
		ctx.save();//Store current context coordinates
			ctx.drawImage(this.image, this.location[0],this.location[1],this.width,this.height);
		ctx.restore();
	}
	loadObstaclesImages(lvl){
		carsarr=[]
		if (lvl==1){
			carsarr=carsarr1;
		}
		else if (lvl==2){
			carsarr=carsarr2;
		}
		else if(lvl==3){
			carsarr=carsarr3;
		}
		else {
			carsarr=carsarr4;
		}		
	}
	loadObstaclesImagesOnce(){
		//Load Images from files
			
		var Image1 = new Image(); Image1.src = "https://imgur.com/m7AD1UC.png";carsarr1.push(Image1)
		var Image2 = new Image(); Image2.src = "https://imgur.com/BOWK3Pf.png";carsarr1.push(Image2)

		var Image1 = new Image(); Image1.src = "https://imgur.com/m7AD1UC.png";carsarr2.push(Image1)
		var Image2 = new Image(); Image2.src = "https://imgur.com/BOWK3Pf.png";carsarr2.push(Image2)
		var Image3 = new Image(); Image3.src = "https://imgur.com/jFvirpb.png";carsarr2.push(Image3)
		var Image4 = new Image(); Image4.src = "https://imgur.com/h2YEQ8X.png";carsarr2.push(Image4)

		var Image1 = new Image(); Image1.src = "https://imgur.com/m7AD1UC.png";carsarr3.push(Image1)
		var Image2 = new Image(); Image2.src = "https://imgur.com/BOWK3Pf.png";carsarr3.push(Image2)
		var Image3 = new Image(); Image3.src = "https://imgur.com/jFvirpb.png";carsarr3.push(Image3)
		var Image4 = new Image(); Image4.src = "https://imgur.com/h2YEQ8X.png";carsarr3.push(Image4)
		var Image5 = new Image(); Image5.src = "https://imgur.com/jFvirpb.png";carsarr3.push(Image5)
		var Image6= new Image(); Image6.src = "https://imgur.com/h2YEQ8X.png";carsarr3.push(Image6)

		var Image1 = new Image(); Image1.src = "https://imgur.com/ZEuezr7.png";carsarr4.push(Image1)
		var Image2 = new Image(); Image2.src = "https://imgur.com/BOWK3Pf.png";carsarr4.push(Image2)
		var Image3 = new Image(); Image3.src = "https://imgur.com/jFvirpb.png";carsarr4.push(Image3)
		var Image4 = new Image(); Image4.src = "https://imgur.com/h2YEQ8X.png";carsarr4.push(Image4)
		var Image5 = new Image(); Image5.src = "https://imgur.com/Izxthmp.png";carsarr4.push(Image5)
		var Image6= new Image(); Image6.src = "https://imgur.com/ahckrxO.png";carsarr4.push(Image6)
		var Image7 = new Image(); Image7.src = "https://imgur.com/h2YEQ8X.png";carsarr4.push(Image7)
		var Image8 = new Image(); Image8.src = "https://imgur.com/Izxthmp.png";carsarr4.push(Image8)
		var Image9= new Image(); Image9.src = "https://imgur.com/ahckrxO.png";carsarr4.push(Image9)
	}

	

	
}
var firstimePassengerAnimationRan=true
var PASSENGERDROPPED=false;
var lastPassengerDrop=false;

//Generate Random Passenger Integer for Selection
function getRandomPassengerImageInt(){
	let max = PASSENGER_IMAGE.length-1; //Setting the range of possible values
	let min = 0;
	let num = 0;

	num = Math.floor(Math.random() * (max - min +1)) + min;
	return num; //Get random int from our range
}

//Get Passenger Image from Array
function getPassengerImage(direction, index) {//direction:left or right(reverse), index: which passenger
	if (direction == 0) {//Passenger facing taxi
		return PASSENGER_IMAGE[index];
	}else{//Passenger facing away
		return PASSENGER_IMAGE_REVERSE[index];
	}
}

//Preload Passenger Image Src
function preload_passenger_images() {
	PASSENGER_IMAGE.push("https://imgur.com/9Tob07C.png"); /*Passenger facing Taxi */ PASSENGER_IMAGE_REVERSE.push("https://imgur.com/QgY6KOq.png"); /*Passenger facing away */
	PASSENGER_IMAGE.push("https://imgur.com/T67FG1Z.png"); /*Passenger facing Taxi */ PASSENGER_IMAGE_REVERSE.push("https://imgur.com/K3DlCzQ.png"); /*Passenger facing away */
	PASSENGER_IMAGE.push("https://imgur.com/axF0KpN.png"); /*Passenger facing Taxi */ PASSENGER_IMAGE_REVERSE.push("https://imgur.com/px0knLT.png"); /*Passenger facing away */
}

//Generate Random Passenger Destination Names
function getRandomDestinationNames(){
	let max = DESTINATION_NAMES.length-1; //Setting the range of possible values
	let min = 0;
	let num = 0;

	num = Math.floor(Math.random() * (max - min +1)) + min;
	return DESTINATION_NAMES[num]; //Get random int from our range
}

//Get Destination Distance From Array
function getcurrent_destination_distance(argument) {
	return passengers_distances[0];
}

//Passenger
class Passenger{

	constructor(image,location,width, height){
		this.image = image;
		this.location = location;
		this.width = width;
		this.height = height;
	
	} draw(ctx){
	
		ctx.save();//Store current context coordinates
		// ctx.translate(this.location[0],this.location[1]);
		ctx.clearRect(0, 0, SIZE, SIZE);  // clear canvas
		ctx.drawImage(this.image, this.location[0],this.location[1],-this.width,-this.height);
		ctx.restore();
	
	}
	clearcanvas(ctx){
		ctx.clearRect(0, 0, 1, 1);  // clear canvas
	}
	loadPassenger(path){
		//Load Passenger Image from File
		var passengerImage = new Image();
		passengerImage.onload = () => {
		console.log("Passenger image loaded");
		};
		passengerImage.src = path;
		this.image=passengerImage;
	}

	callTaxi(ctx){
		//Shout for Taxi
		playSound(7);

		ctx.save();//Store current context coordinates
		ctx.strokeStyle = "white";
		ctx.lineWidth = 0.001;
		ctx.font = '0.035px Arial';
		ctx.strokeText("Taxi...", this.location[0]-0.18,this.location[1]-0.07);

		ctx.restore();

		//Show Pick Passenger Overlay Text After 3 Secs
		if (isPassengerPicked == false) {
			// setTimeout(showPickPassengerOverlay,3000);
			showPickPassengerOverlay();
		}
	}

	stopCallingTaxi(ctx){
		ctx.save();//Store current context coordinates
		ctx.strokeStyle = "white";
		ctx.lineWidth = 0.001;
		ctx.font = '0.035px Arial';
		ctx.strokeText("", this.location[0]-0.18,this.location[1]-0.07);

		ctx.restore();
	}


	// Checks the taxi distance with destination distance.
	// If passengers are finished, it will also check it and thats the case then
	// layout for "You Won" will show and stopping the animation.
	// If we are to drop the passenger and pick new passenger
	dropPassenger(){
		

		// indx=getRandomIntInclusive(0,car_locs_y.length-1)
		current_destination_distance=passengers_distances[0];
		if (taxi_dis>=current_destination_distance){
			passengers_distances.splice(0,1);
			// IF PLAYEER WON
			if (passengers_distances.length==0){
				
				gameObject.setTotalTime(0);
				
				
				continueAnimating=false;
				window.cancelAnimationFrame(myReq);

				lastPassengerDrop=true;
				COUNTDOWNPAUSED=true;
				// animateObject.refreshAnimation();
				let element = document.getElementById('gamestatus');
				element.style.display='block';
                element.innerHTML="You Won!\nAll Passengers Dropped Safely\nSCORE: "+SCORE +"\nClick To Play Again";
               
                // Pause all sounds
                stopAllSounds();
                 // Passenger Thanking the Taxi Driver. 
                playSound(10);
                setTimeout(()=>{
                	playSound(11); //Congratulations
                },4000);

                setTimeout(()=>{
                	playSound(12); //Play Short Music
                },4000);

                setTimeout(()=>{
                	playSound(13); //Play Applause Sound
                },2000);

				continueAnimatingPassDrop=true;  
				animatePassengerObject.animatePassengerDropOff();

				return 
			}
			//Stop Playing All Sounds
			stopAllSounds();
			// For adding Score of 50 
			PASSENGERDROPPED=true;
			// firstfunc=true;
			// Animation for droping passenger. 
			continueAnimating=false;
			window.cancelAnimationFrame(myReq);
			let element=document.getElementById("pause");
			element.style.display='block';
			// Stopping countdown, Score, Everything
			COUNTDOWNPAUSED=true;
			// Update the Score will add 50 poiintes to the score. 
			gameObject.countScore(PASSENGERDROPPED)
			// Add Time To the Count Down-  10SECS
			gameObject.updateTotalTime(10);
			gameObject.updateTotalTime2(10);

			gameObject.updateSetIntervalTime(1000);
			// Default Speed 
			gameObject.setGameSpeed();

			// Remove the  distance from the list. 
			taxi_dis=0;
            animateObject.refreshAnimation();
              // Passenger Thanking the Taxi Driver. 
              playSound(10);
            continueAnimatingPassDrop=true;  
            animatePassengerObject.animatePassengerDropOff();
           
		}
	}
	
}
class Animate{
	constructor(){
	
		}

	levelOneAnimation(){
		var cars_yloc=-0.2
		// carlocations=[0.2,0.4,0.6];
		var carlocations=[0.2,0.3,0.4,0.5,0.6];
		carObstaclesObject.loadObstaclesImages(1)

		var index1=getRandomIntInclusive(0,carlocations.length-1)
		var carOneLoc=carlocations[index1]
		carlocations.splice(index1, 1);
		var index2=getRandomIntInclusive(0,carlocations.length-1)
		var carTwoLoc=carlocations[index2]
		
		for (var i=0;i<carsarr.length;i++){

			if (CAROBSTACLES.length==0){
				CAROBSTACLES.push(new carObstacles(carsarr[0],[carOneLoc,cars_yloc],0.2,0.18))
				CAROBSTACLES.push(new carObstacles(carsarr[1],[carTwoLoc,cars_yloc],0.2,0.18))
				colorRects.push(new Rectangle([carOneLoc+0.07,cars_yloc], 0.06, 0.16, "rgba(255,0,0,0.5)"));
				colorRects.push(new Rectangle([carTwoLoc+0.06,cars_yloc], 0.06, 0.16, "rgba(255,144,2,0.5)"));
			}
			else if (CAROBSTACLES[i].location[1]>1){
				CAROBSTACLES=[]
				colorRects=[]
				return true;
			}
			else{
				CAROBSTACLES[i].location[1]+=gameObject.getGameSpeed();	
				colorRects[i].location[1]+=gameObject.getGameSpeed();
			}
		}
	return false;
	}
	levelTwoAnimation(){
		var car_locs_y=[-0.2,-0.4];
		// car_locs_x=[0.2,0.4,0.6];
		var car_locs_x=[0.2,0.3,0.4,0.5,0.6];
	
		carObstaclesObject.loadObstaclesImages(2);

	
		var index1=getRandomIntInclusive(0,car_locs_x.length-1)
		var carOneLoc_x=car_locs_x[index1];
		car_locs_x.splice(index1, 1);
	
		var index1=getRandomIntInclusive(0,car_locs_x.length-1)
		var carTwoLoc_x=car_locs_x[index1]
		car_locs_x.splice(index1, 1);
	
		var index1=getRandomIntInclusive(0,car_locs_y.length-1)
		var carOneLoc_y=car_locs_y[index1]
		car_locs_y.splice(index1, 1);
	
		var index1=getRandomIntInclusive(0,car_locs_y.length-1)
		var carTwoLoc_y=car_locs_y[index1]
		car_locs_y.splice(index1, 1);
	
	
	
		for (var i=0;i<carsarr.length;i++){
	
			if (CAROBSTACLES.length==0){
	
				CAROBSTACLES.push(new carObstacles(carsarr[0],[carOneLoc_x,carOneLoc_y],0.2,0.18))
				CAROBSTACLES.push(new carObstacles(carsarr[1],[carOneLoc_x,carTwoLoc_y],0.2,0.18))
				CAROBSTACLES.push(new carObstacles(carsarr[2],[carTwoLoc_x,carOneLoc_y],0.2,0.18))
				CAROBSTACLES.push(new carObstacles(carsarr[3],[carTwoLoc_x,carTwoLoc_y],0.2,0.18))
	
				colorRects.push(new Rectangle([carOneLoc_x+0.07,carOneLoc_y], 0.06, 0.16, "rgba(255,14,59,0.5)"));
				colorRects.push(new Rectangle([carOneLoc_x+0.06,carTwoLoc_y], 0.06, 0.16, "rgba(255,29,23,0.5)"));
				colorRects.push(new Rectangle([carTwoLoc_x+0.07,carOneLoc_y], 0.06, 0.16, "rgba(25,220,10,0.5)"));
				colorRects.push(new Rectangle([carTwoLoc_x+0.06,carTwoLoc_y], 0.06, 0.16, "rgba(2,0,200,0.5)"));
	
			}
			else if (CAROBSTACLES[i].location[1]>1.4){
				CAROBSTACLES=[];
				colorRects=[];
				return true;			
			}
			else{
				CAROBSTACLES[i].location[1]+=gameObject.getGameSpeed();;	
				colorRects[i].location[1]+=gameObject.getGameSpeed();;
			}
		}
	
		return false;
	}
	levelThreeAnimation(){
		var car_locs_y=[-0.2,-0.4,-0.7];
		// car_locs_x=[0.2,0.4,0.6];
		var car_locs_x=[0.2,0.3,0.4,0.5,0.6];

		carObstaclesObject.loadObstaclesImages(3);
		

		var index1=getRandomIntInclusive(0,car_locs_x.length-1)
		var carOneLoc_x=car_locs_x[index1]
		car_locs_x.splice(index1, 1);

		var index1=getRandomIntInclusive(0,car_locs_x.length-1)
		var carTwoLoc_x=car_locs_x[index1]
		car_locs_x.splice(index1, 1);


		var index1=getRandomIntInclusive(0,car_locs_x.length-1)
		var carThreeLoc_x=car_locs_x[index1]

		
		
	// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
		var index1=getRandomIntInclusive(0,car_locs_y.length-1)
		var carOneLoc_y=car_locs_y[index1]
		car_locs_y.splice(index1, 1);

		var index1=getRandomIntInclusive(0,car_locs_y.length-1)
		var carTwoLoc_y=car_locs_y[index1]
		car_locs_y.splice(index1, 1);


		var index1=getRandomIntInclusive(0,car_locs_y.length-1)
		var carThreeLoc_y=car_locs_y[index1]
		



		for (var i=0;i<carsarr.length;i++){

			if (CAROBSTACLES.length==0){

				CAROBSTACLES.push(new carObstacles(carsarr[0],[carOneLoc_x,carOneLoc_y],0.2,0.18))
				CAROBSTACLES.push(new carObstacles(carsarr[1],[carOneLoc_x,carTwoLoc_y],0.2,0.18))
				CAROBSTACLES.push(new carObstacles(carsarr[2],[carTwoLoc_x,carThreeLoc_y],0.2,0.18))
				CAROBSTACLES.push(new carObstacles(carsarr[3],[carTwoLoc_x,carOneLoc_y],0.2,0.18))
				CAROBSTACLES.push(new carObstacles(carsarr[4],[carThreeLoc_x,carTwoLoc_y],0.2,0.18))
				CAROBSTACLES.push(new carObstacles(carsarr[5],[carThreeLoc_x,carThreeLoc_y],0.2,0.18))

				colorRects.push(new Rectangle([carOneLoc_x+0.07,carOneLoc_y], 0.06, 0.16, "rgba(255,14,59,0.5)"));
				colorRects.push(new Rectangle([carOneLoc_x+0.06,carTwoLoc_y], 0.06, 0.16, "rgba(255,29,23,0.5)"));
				colorRects.push(new Rectangle([carTwoLoc_x+0.07,carThreeLoc_y], 0.06, 0.16, "rgba(25,220,10,0.5)"));
				colorRects.push(new Rectangle([carTwoLoc_x+0.06,carOneLoc_y], 0.06, 0.16, "rgba(22,20,200,0.5)"));
				colorRects.push(new Rectangle([carThreeLoc_x+0.07,carTwoLoc_y], 0.06, 0.16, "rgba(25,220,10,0.5)"));
				colorRects.push(new Rectangle([carThreeLoc_x+0.06,carThreeLoc_y], 0.06, 0.16, "rgba(2,200,200,0.5)"));

			}
			else if (CAROBSTACLES[i].location[1]>1.7){
				CAROBSTACLES=[];
				colorRects=[];
				return true;			
			}
			else{
				CAROBSTACLES[i].location[1]+=gameObject.getGameSpeed();
				colorRects[i].location[1]+=gameObject.getGameSpeed();

			}
		}
		return false;
	}

	levelFourAnimation(){
		
	}
	
	refreshAnimation(){
		basicCanvas = document.getElementById("basicRoadCanvas");
		let basicctx = basicCanvas.getContext("2d");
		basicctx.clearRect(0, 0, SIZE, SIZE);  // clear canvas
		loopcomplete=true;
		TAXI[0].location=[0.6,0.8];
		taxicolor.location=[0.66,0.82];
		CAROBSTACLES=[];
		colorRects=[];
	}
	changeLoopCompleteStatus(){
		// if (lvl==4){
		// 	loopcomplete=animateObject.levelFourAnimation();
		// }
		if (lvl==3){
			loopcomplete=animateObject.levelThreeAnimation();
		}
		if (lvl==2){
			loopcomplete=animateObject.levelTwoAnimation();
		}
		if(lvl==1){
			loopcomplete=animateObject.levelOneAnimation();
		}
	}
	animate(){
		basicCanvas = document.getElementById("basicRoadCanvas");
		let ctx = basicCanvas.getContext("2d");
		time_in_ms_main+=1;
		// Animate Functions runs 60 frames per second. So if function runs 60 times it will be equivalent to 1 sec. 
		if (time_in_ms_main%60==0){
			animate_runtime_in_secs+=1;
		}
		scoreBoardObject=new ScoreBoard();
		scoreBoardObject.updateBoard();
		gameObject.increaseGameSpeed(animate_runtime_in_secs);
		scoreBoardObject.updateBoard();

		if(firstfunc==true){
			loopcomplete=animateObject.levelOneAnimation();
			firstfunc=false;
		}
		gameObject.selectGameLevel();		
		animateObject.changeLoopCompleteStatus();
		taxiObject.steerTaxi(ctx, basicCanvas);
		drawScene();
		// Calculate distance aafterevery frame.
		gameObject.calculateDistance();
		PASSENGER[0].dropPassenger(); //UNCOMMNENT IT>> LATER

		if(continueAnimating){
			//Play car ACCELERATE sound
			playSound(2);//Index 2 for car accelerate sound
			myReq = window.requestAnimationFrame(animateObject.animate);
		}else{
		//Acceleration STOPS
		stopSound(2); //Stop playing acceleration sound
		}

	}
}
function resumeAnimation(){
	//Hide Resume Overlay
	hideSomeOverlay("next_passenger_picked_overlay");

	continueAnimating=true;
	COUNTDOWNPAUSED=false;
	let element=document.getElementById("pause")
	element.style.display='none';
	animateObject.animate();
}

//Hide Some Overlay
function hideSomeOverlay(overlay_id) {
	let element=document.getElementById(overlay_id);
	element.style.display='none';
}

//Show Some Overlay
function showSomeOverlay(overlay_id) {
	let element=document.getElementById(overlay_id);
	element.style.display='block';
}

//Show Some Overlay
function showResumeOverlay() {
	let element=document.getElementById("next_passenger_picked_overlay");
	document.getElementById("resume_text").innerHTML ="";
	document.getElementById("resume_text").innerHTML ="Drop passenger at "+getRandomDestinationNames()+"\nin "+getcurrent_destination_distance()+" km. Don't be late.<br><br><center>Click to resume...</center>";
	element.style.display='block';
}



class AnimatePassenger{
	
	animatePassenger(){
		passengerCanvas = document.getElementById("passengerCanvas");
		backgroundforpassenger = document.getElementById("backgroundforpassenger");
		var passctx=passengerCanvas.getContext('2d');
		// Using backgroundforpassenger canvas for background
		var bgin=backgroundforpassenger.getContext('2d');
		drawbackGround(bgin);
		drawRoad(bgin,ROADLINES[0].getRoadProps());
		ROADLINES[0].drawRoadLine(bgin)
		TAXI[0].draw(bgin);
		taxicolor.draw(bgin);

		// Draw Func called. 
		PASSENGER[0].draw(passctx);
		
		//Check if Passenger is Picked
		if (isPassengerPicked == false) {
		//Passenger stands waiting for Taxi
		PASSENGER[0].callTaxi(passctx); //Shout for Taxi and Display "Taxi" text
		}
		else if (isPassengerPicked) {
			// Passenger Walks to Taxi
			PASSENGER[0].location[0]-=0.002;///Making a major update///Remove this comment later

			//Will  Only run For the first time the passenger sits inside the Taxi. 
			if(firstimePassengerAnimationRan==true){
				// Passenger Reaches Taxi
				if (PASSENGER[0].location[0]<=0.8){
					continueAnimatingPass=false;

					//Flag Passenger as picked
					isPassengerPicked = true;

					PASSENGER[0].clearcanvas(passctx);
					//Play Door close Sound
					playSound(5); //Door closes

					delete PASSENGER[0];
					PASSENGER=[];	
					// New Passenger Object
					passengerObject = new Passenger("",[0.8,1],0.15,0.15)
					passengerObject.loadPassenger(getPassengerImage(1, randomPassengerInteger)); //direction:left or right(reverse), index: which passenger (Face away Taxi)
					// passengerObject.loadPassenger("https://imgur.com/9Tob07C.png");
					PASSENGER.push(passengerObject);

					//Passenger asks Taxi to start
					// playSound(4);//Delay for some secs
					setTimeout(() => { playSound(4); }, 2000); //Delay for some secs
					if (isNextPassengerPicked) {//Removing Picking New Passenger Overlay
						hideSomeOverlay("picking_new_passenger_overlay");
						// showSomeOverlay("next_passenger_picked_overlay");
						showResumeOverlay(); //Show Next Drop-off instructions
					}

					/*********************************************************************************/
					//GAME ANIMATION CONTINUES
					//Delaying Animation for 3 secs
					setTimeout(() => { 
						bgin.clearRect(0, 0, 1, 1);  // clear canvas
						// Start Running the countdown function. it will run till 20 secs (default time)
						var setInvObject=setInterval(gameObject.countDown,gameObject.getSetIntervalTime());
						gameObject.setSetIntervalObject(setInvObject);
						animateObject.animate(); 
					}, 3000);


					/*bgin.clearRect(0, 0, 1, 1);  // clear canvas
					// Start Running the countdown function. it will run till 20 secs (default time)
					var setInvObject=setInterval(gameObject.countDown,gameObject.getSetIntervalTime()) 
					gameObject.setSetIntervalObject(setInvObject);*/
					
					//GAME ANIMATION CONTINUES
					// animateObject.animate();
					// setTimeout(() => { animateObject.animate(); }, 1000); //Delay start for some secs

				}
			}
			else{
				// Checking if passenger has reached taxi
				if (PASSENGER[0].location[0]<=0.8){
					continueAnimatingPass=false;
					//Flag Passenger as picked
					isPassengerPicked = true;

					PASSENGER[0].clearcanvas(passctx);
					//Play Door close Sound
					playSound(5); //Door closes

					delete PASSENGER[0];
					PASSENGER=[];
					// New Passenger Object	
					passengerObject = new Passenger("",[0.8,1],0.15,0.15)
					passengerObject.loadPassenger(getPassengerImage(1, randomPassengerInteger2)); //direction:left or right(reverse), index: which passenger (Face away Taxi)
					// passengerObject.loadPassenger("https://imgur.com/9Tob07C.png");
					PASSENGER.push(passengerObject);

					//Passenger asks Taxi to start
					setTimeout(() => { playSound(4); }, 0); //Delay for some secs
					if (isNextPassengerPicked) {//Removing Picking New Passenger Overlay
						hideSomeOverlay("picking_new_passenger_overlay");
						// showSomeOverlay("next_passenger_picked_overlay");
						showResumeOverlay(); //Show Next Drop-off instructions
					}

					/*********************************************************************************/
					//GAME ANIMATION CONTINUES
					//Delaying Animation for 3 secs
					setTimeout(() => { 
						bgin.clearRect(0, 0, 1, 1);  // clear canvas
						animateObject.animate(); 
					}, 3000);

				}
			}
		}

		
		if(continueAnimatingPass){
			passReq = requestAnimationFramePass(animatePassengerObject.animatePassenger);
		}
		else{
			cancelAnimationFramePass(passReq);
	
		}

	}

	animatePassengerDropOff(){
		passengerCanvas = document.getElementById("passengerCanvas");
		backgroundforpassenger = document.getElementById("backgroundforpassenger");
		var passctx=passengerCanvas.getContext('2d');
		// Using backgroundforpassenger canvas for background
		var bgin=backgroundforpassenger.getContext('2d');
		drawbackGround(bgin);
		drawRoad(bgin,ROADLINES[0].getRoadProps());
		ROADLINES[0].drawRoadLine(bgin)
		TAXI[0].draw(bgin);
		taxicolor.draw(bgin);
		PASSENGER[0].location[0]+=0.002;
		// Draw Func called. 
		PASSENGER[0].draw(passctx);
		// Check if has safley reached the sideroad.
	if  (!lastPassengerDrop){
		if (PASSENGER[0].location[0]>=1){
			continueAnimatingPassDrop=false;
			PASSENGER[0].clearcanvas(passctx);
			delete PASSENGER[0];	
			PASSENGER=[];	
			passengerObject = new Passenger("",[1,1],0.15,0.15)
			randomPassengerInteger2 = getRandomPassengerImageInt();
			passengerObject.loadPassenger(getPassengerImage(0, randomPassengerInteger2)); //direction:left or right(reverse), index: which passenger (Face Taxi)
			// passengerObject.loadPassenger("https://imgur.com/9Tob07C.png");
			PASSENGER.push(passengerObject);
            firstimePassengerAnimationRan=false;
            // Stop all sounds
            stopAllSounds();
            //Show Picking Passenger Overlay
			hideSomeOverlay("pause");
			showSomeOverlay("picking_new_passenger_overlay");
			// showResumeOverlay(); //Show Next Drop-off instructions

			continueAnimatingPass = true;
			cancelAnimationFramePassDrop(passDropReq);
			//Flag Next Passenger Picked as True
			isNextPassengerPicked = true;

			animatePassengerObject.animatePassenger();


		}
	}
		
		if(continueAnimatingPassDrop){
			passDropReq = requestAnimationFramePassDrop(animatePassengerObject.animatePassengerDropOff);
		}
		else{
			cancelAnimationFramePassDrop(passDropReq);
		}

	}
}


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Event Listeners>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//Function to add event listeners
function addEventListeners(canvas){
	//Add event listeners to canvas
	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);
}

// A map that stores real-time "press state" for keys
function onKeyDown(event) {
  /* Update keys pressed state for event.key to true
  signifiying the key that caused the event is now pressed */
  currentKeysPressed[event.key] = true;
}

/* Defined new event listener to reset key state
on key release */
function onKeyUp(event) {

  currentKeysPressed[event.key] = false;
  NOSFLAG=false;
}
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// POPUPS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function removeOverlay(){
    let element = document.getElementById('removeoverlay');
	element.style.display='none'
	main();
}
// Time Over
function timeOver(){
	window.cancelAnimationFrame(myReq);
	COUNTDOWNPAUSED=true;

	//Stop All Sounds
	stopAllSounds();

	let element = document.getElementById('timeover');
	element.style.display='block';
	element.innerHTML="TIME EXHAUSTED! \nSCORE: "+SCORE +"\nClick To Play Again";

}

//Remove Pick Passenger Overlay
function removePickPassengerOverlay(){
    let element = document.getElementById('pick_passenger_overlay');
	element.style.display='none'
	// alert("Removed")
}

/* Show GAME OVER MESSAGE*/
function showOverlay(){
	// countScore(false);

	window.cancelAnimationFrame(myReq);
	COUNTDOWNPAUSED=true;

	playSound(0); //Play crash sound
	playPassengerSound(); //Play passenger scream sound

	let element = document.getElementById('showoverlay');
	element.style.display='block';
	element.innerHTML="GAME OVER \nSCORE: "+SCORE +"\nClick To Play Again";

}

//Show Pick FIrst Passenger Overlay
function showPickPassengerOverlay(){

	let element = document.getElementById('pick_passenger_overlay');
	document.getElementById('first_passenger_text_overlay').innerHTML = "Drop passenger at "+first_destination_name+" in "+getcurrent_destination_distance()+"km. <br><br>Click to pick your fare >>>";
	element.style.display='block'

}
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>SOUNDS>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

//Play Sound in Game
function playSound(index){//index starts from zero(0)
	SOUNDS[index].play();
}

//Play Passenger Sounds
function playPassengerSound(){
	getRandomPassengerScreamSound().play();
}

//Stop playing sound
function stopSound(index) {
    SOUNDS[index].pause();
    SOUNDS[index].currentTime = 0;
}

//Stop playing All sounds
function stopAllSounds() {
    for (i=0;i<SOUNDS.length;i++){
        SOUNDS[i].pause();
        SOUNDS[i].currentTime = 0;
    }
    for (i=0;i<PASSENGER_SCREAMS.length;i++){
        PASSENGER_SCREAMS[i].pause();
        PASSENGER_SCREAMS[i].currentTime = 0;
    }


    
}

function loadSounds(){
	var crash = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=773"); SOUNDS.push(crash); //index 0 //Source: https://bigsoundbank.com/search?q=crash
	var start_accelerate = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=775"); SOUNDS.push(start_accelerate); //index 1 //Source: https://bigsoundbank.com/detail-1286-car-on-a-road.html
	var accelerate = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=774"); SOUNDS.push(accelerate); //index 2 //Source: https://bigsoundbank.com/detail-1286-car-on-a-road.html
	var crash_loud = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=776"); SOUNDS.push(crash_loud); //index 3 //Source: https://bigsoundbank.com/detail-1286-car-on-a-road.html
	var passenger_asks_start = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=781"); SOUNDS.push(passenger_asks_start); //index 4 Self Recorded by david "Lets Go"
	var car_door_closes = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=782"); SOUNDS.push(car_door_closes); //index 5 //https://freesound.org/people/E-Audio/sounds/118247/
	var passenger_calls_taxi = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=783"); SOUNDS.push(passenger_calls_taxi); //index 6 //man_yelling_taxi //https://freesound.org/people/sraabe/sounds/480875/
	var passenger_calls_taxi2 = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=784"); SOUNDS.push(passenger_calls_taxi2); //index 7 //https://freesound.org/people/Mountain852/sounds/365825/
	var car_rev = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=788"); SOUNDS.push(car_rev); //index 8 //https://freesound.org/people/ReyDros/sounds/327049
	var car_horn = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=787"); SOUNDS.push(car_horn); //index 9 //https://bigsoundbank.com/detail-0260-car-horn-4.html
    var passenger_thanks = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=790"); SOUNDS.push(passenger_thanks); //index 10 Self Recorded
    var congratulations = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=791"); SOUNDS.push(congratulations); //index 11 https://freesound.org/people/dersuperanton/sounds/433702/
    var completed = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=793"); SOUNDS.push(completed); //index 12 //https://freesound.org/people/dersuperanton/sounds/433702/
    var crowd_cheer = new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=792"); SOUNDS.push(crowd_cheer); //index 13 // https://freesound.org/people/FoolBoyMedia/sounds/397435

    //Passenger Screams
	PASSENGER_SCREAMS.push(new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=777")); // Self Recorded by david
	PASSENGER_SCREAMS.push(new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=778")); // Self Recorded by david
	PASSENGER_SCREAMS.push(new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=779"));// Self Recorded by david
	PASSENGER_SCREAMS.push(new Audio("https://d3vstm4rzy4f6i.cloudfront.net/download?id=780"));// Self Recorded by david
}

//Generate Passenger Screams Randomly
function getRandomPassengerScreamSound(){
	let max = PASSENGER_SCREAMS.length-1; //Setting the range of possible values
	let min = 0;
	let sound = 0;

	sound = Math.floor(Math.random() * (max - min +1)) + min;
	return PASSENGER_SCREAMS[sound]; //Get random sound from our list
}

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

/*Getting Random Number Index from a list*/
function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}