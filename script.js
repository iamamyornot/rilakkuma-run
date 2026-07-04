const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");

const menu=document.getElementById("menu");
const gameover=document.getElementById("gameover");
const retryBtn=document.getElementById("retryBtn");

let gameState="menu";
let mode="easy";
let bestScore=localStorage.getItem("bestScore")||0;
let bgOffset=0;

const game={
 score:0,
 speed:7,
 gravity:0.8,
 hp:3
};

const player={
 x:120,
 y:330,
 width:90,
 height:90,
 velocityY:0,
 jumping:false,
 runTick:0
};

let obstacles=[];
let coins=[];
let obstacleTimer=0;
let coinTimer=0;

function jump(){
 if(!player.jumping&&gameState==="playing"){
  player.velocityY=-18;
  player.jumping=true;
 }
}

function resetGame(){
 game.score=0;
 game.speed=7;
 game.hp=3;
 obstacles=[];
 coins=[];
 obstacleTimer=0;
 coinTimer=0;
 player.y=330;
 player.velocityY=0;
 player.jumping=false;
 gameover.classList.add("hidden");
}

function updatePlayer(){
 if(player.jumping){
  player.velocityY+=game.gravity;
  player.y+=player.velocityY;

  if(player.y>=330){
   player.y=330;
   player.velocityY=0;
   player.jumping=false;
  }
 }
 player.runTick+=0.15;
}

function spawnObstacle(){
 let y=385;
 let h=45;

 if(mode!=="easy"&&Math.random()<0.4){
  y=280;
  h=35;
 }

 obstacles.push({x:canvas.width,y,width:40,height:h});
}

function spawnCoin(){
 coins.push({
  x:canvas.width,
  y:280+Math.random()*80,
  radius:15
 });
}

function autoModeAI(){
 if(mode!=="auto") return;

 for(let obs of obstacles){
  if(obs.x-player.x<180 && obs.x-player.x>50 && !player.jumping){
   jump();
  }
 }
}

function updateObstacles(){
 obstacleTimer++;
 coinTimer++;

 let spawnRate=120;
 if(mode==="normal") spawnRate=90;
 if(mode==="hard") spawnRate=65;
 if(mode==="auto") spawnRate=75;

 if(obstacleTimer>spawnRate){
  spawnObstacle();
  obstacleTimer=0;
 }

 if(coinTimer>180){
  spawnCoin();
  coinTimer=0;
 }

 obstacles.forEach(o=>o.x-=game.speed);
 coins.forEach(c=>c.x-=game.speed);

 obstacles=obstacles.filter(o=>o.x>-50);
 coins=coins.filter(c=>c.x>-20);
}

function checkCollision(){
 for(let obs of obstacles){
  if(
   player.x<obs.x+obs.width &&
   player.x+player.width>obs.x &&
   player.y<obs.y+obs.height &&
   player.y+player.height>obs.y
  ){
   obstacles=obstacles.filter(o=>o!==obs);
   game.hp--;

   if(game.hp<=0){
    gameState="gameover";

    if(game.score>bestScore){
     bestScore=Math.floor(game.score);
     localStorage.setItem("bestScore",bestScore);
    }

    gameover.classList.remove("hidden");
   }
   break;
  }
 }

 for(let coin of coins){
  let dx=(player.x+40)-coin.x;
  let dy=(player.y+40)-coin.y;
  let dist=Math.sqrt(dx*dx+dy*dy);

  if(dist<40){
   game.score+=25;
   coins=coins.filter(c=>c!==coin);
   break;
  }
 }
}

function drawBackground(){
 bgOffset-=game.speed*0.3;
 if(bgOffset<-canvas.width) bgOffset=0;

 ctx.fillStyle="#87CEEB";
 ctx.fillRect(0,0,canvas.width,canvas.height);

 ctx.fillStyle="white";

 for(let i=0;i<5;i++){
  let x=i*250+(bgOffset%250);
  ctx.beginPath();
  ctx.arc(x,80,25,0,Math.PI*2);
  ctx.arc(x+30,75,22,0,Math.PI*2);
  ctx.fill();
 }

 ctx.fillStyle="#79c267";
 ctx.fillRect(0,430,canvas.width,110);
}

function drawBear(x,y,color,bounce=0){
 ctx.save();
 ctx.translate(x,y+bounce);

 ctx.fillStyle=color;

 ctx.beginPath();
 ctx.ellipse(40,55,30,25,0,0,Math.PI*2);
 ctx.fill();

 ctx.beginPath();
 ctx.arc(40,25,22,0,Math.PI*2);
 ctx.fill();

 ctx.beginPath();
 ctx.arc(25,10,8,0,Math.PI*2);
 ctx.arc(55,10,8,0,Math.PI*2);
 ctx.fill();

 ctx.fillStyle="black";
 ctx.beginPath();
 ctx.arc(35,25,2,0,Math.PI*2);
 ctx.arc(45,25,2,0,Math.PI*2);
 ctx.fill();

 ctx.restore();
}

function drawPlayer(){
 let bounce=0;
 if(gameState==="playing"&&!player.jumping){
  bounce=Math.sin(player.runTick)*4;
 }

 drawBear(player.x,player.y,"#b07a3c",bounce);
 drawBear(player.x+45,player.y+15,"#f5f0dd",bounce);
}

function drawObstacles(){
 ctx.fillStyle="#ffb74d";
 obstacles.forEach(obs=>{
  ctx.fillRect(obs.x,obs.y,obs.width,obs.height);
 });
}

function drawCoins(){
 ctx.fillStyle="#ffd700";
 coins.forEach(c=>{
  ctx.beginPath();
  ctx.arc(c.x,c.y,c.radius,0,Math.PI*2);
  ctx.fill();
 });
}

function drawUI(){
 ctx.fillStyle="black";
 ctx.font="24px Arial";
 ctx.fillText("Score: "+Math.floor(game.score),20,40);
 ctx.fillText("Best: "+bestScore,20,75);
 ctx.fillText("HP: "+"❤️".repeat(game.hp),20,110);
}

function update(){
 if(gameState==="playing"){
  autoModeAI();
  updatePlayer();
  updateObstacles();
  checkCollision();

  game.score+=0.05;
  game.speed+=0.0005;
 }
}

function render(){
 drawBackground();
 drawPlayer();
 drawObstacles();
 drawCoins();
 drawUI();
}

function loop(){
 update();
 render();
 requestAnimationFrame(loop);
}

document.querySelectorAll(".mode-btn").forEach(btn=>{
 btn.addEventListener("click",()=>{
  mode=btn.dataset.mode;
  gameState="playing";
  menu.style.display="none";
  resetGame();
 });
});

retryBtn.addEventListener("click",()=>{
 gameState="playing";
 resetGame();
});

document.addEventListener("keydown",e=>{
 if(e.code==="Space") jump();
});

canvas.addEventListener("touchstart",jump);

loop();
