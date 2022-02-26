const canvas=document.querySelector('canvas');
canvas.width=innerWidth;
canvas.height=innerHeight;

const ctx=canvas.getContext("2d");

const scoreEl=document.querySelector('#scoreEl')
const startgameBtn=document.querySelector('#startgameBtn')
const modalEl=document.querySelector('#modalEl')
const modalScoreEl=document.querySelector('#modalScoreEl')

//audio effects


let score=0
class Player{
    constructor(x,y,radius,color){
        this.x=x;
        this.y=y;
        this.color=color;
        this.radius=radius;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        ctx.fillStyle=this.color;
        ctx.fill();
    }
}
class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        ctx.fillStyle=this.color
        ctx.fill()
    }
    update(){
        this.draw()
        this.x=this.x+this.velocity.x
        this.y=this.y+this.velocity.y
    }
}
class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        ctx.fillStyle=this.color
        ctx.fill()
    }
    update(){
        this.draw()
        this.x=this.x+this.velocity.x
        this.y=this.y+this.velocity.y
    }
}
const friction=0.99

class Particle{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.alpha=1;
    }
    draw(){
        ctx.save()
        ctx.globalAlpha=this.alpha
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        ctx.fillStyle=this.color
        ctx.fill()
        ctx.restore()
    }
    update(){
        this.draw()
        this.velocity.x*=friction
        this.velocity.y*=friction
        this.x=this.x+this.velocity.x
        this.y=this.y+this.velocity.y
        this.alpha-=0.01
    }
}
const x=canvas.width/2;
const y=canvas.height/2;
let player=new Player(x,y,10,'white');
let Projectiles=[]
let Enemies=[]
let Particles=[]





player.draw();
//const projectile=new Projectile(x,y,5,'red',{x:2,y:2});
let animationId

function init(){
     player=new Player(x,y,10,'white');
     Projectiles=[]
     Enemies=[]
     Particles=[]
     score=0
     scoreEl.innerHTML=score
}
function animate(){
    setTimeout(()=>{
        
  
    animationId=requestAnimationFrame(animate)
    ctx.fillStyle='rgba(0,0,0,0.1)'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    player.draw();
    Particles.forEach((particle,parIndex)=>{
        if(particle.alpha<=0){
            Particles.splice(parIndex,1)
        }else{
            
            particle.update()

        }
    })
    Projectiles.forEach((projectile,pindex)=>{
        projectile.update()
        if(projectile.x+projectile.radius<0 ||
            projectile.x-projectile.radius>canvas.width||
            projectile.y+projectile.radius<0 ||
            projectile.y-projectile.radius>canvas.width){
                setTimeout(()=>{
                    Projectiles.splice(pindex,1) 
                },0)
        }
    })
    Enemies.forEach((enemy,eindex)=>{
        enemy.update()
        const dist=Math.hypot(player.x-enemy.x,player.y-enemy.y)
        //game over
        if(dist-enemy.radius-player.radius<1){
            let gameoversound=new sound("gameover.wav")
            gameoversound.play()
            cancelAnimationFrame(animationId)
            modalEl.style.display='flex'
            modalScoreEl.innerHTML=score
        }
        Projectiles.forEach((projectile,pindex)=>{
            const distance=Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y)
            if(distance-enemy.radius-projectile.radius<1){
                
                for(let i=0;i<enemy.radius*2;i++){
                    Particles.push(new Particle(projectile.x,projectile.y,Math.random()*2,enemy.color,
                    {
                        x:(Math.random()-0.5) * (Math.random()*6),
                        y:(Math.random()-0.5) * (Math.random()*6)
                    }))
                }

                if(enemy.radius-10>=10){
                    //increase score
                    score+=100
                    scoreEl.innerHTML=score
                    gsap.to(enemy,{
                        radius:enemy.radius-10
                    })
                   // setTimeout(()=>{
                        Projectiles.splice(pindex,1)
                   // },0)
                }else{
                    //increase score
                    score+=250
                    scoreEl.innerHTML=score
                    setTimeout(()=>{
                        Enemies.splice(eindex,1)
                        Projectiles.splice(pindex,1)
                        let exploadsound=new sound("expload.wav")
                        exploadsound.play()
                    },0)
                }
               
            }
        })
    })
},5)
}
function SpawnEnemies(){
    setInterval(()=>{
        const radius=Math.random()* (30-7)+7
        let x
        let y
        if(Math.random()<0.5){
            x=Math.random()<0.5?0-radius:canvas.width+radius
            y=Math.random()*canvas.height
        }
        else{
            x=Math.random()*canvas.width
            y=Math.random()<0.5?0-radius:canvas.height+radius
        }
       
        const color=`hsl(${Math.random()*360},50%,50%)`
        const angle=Math.atan2(canvas.height/2-y,canvas.width/2-x)
    const velocity={
        x:Math.cos(angle),
        y:Math.sin(angle)
    }
        Enemies.push(new Enemy(x,y,radius,color,velocity))
        
    },1200)
}
addEventListener('click',(event)=>{

    const angle=Math.atan2(event.clientY-y,event.clientX-x)
    const velocity={
        x:Math.cos(angle)*7,
        y:Math.sin(angle)*7
    }
   
   Projectiles.push(new Projectile(x,y,5,'white',velocity))
   setTimeout(()=>{
    let shoot=new sound("shooting1.wav")
    shoot.play()
   },0)
});
startgameBtn.addEventListener('click',()=>{
    init()
    animate()
    SpawnEnemies()
    
    modalEl.style.display='none'
})
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
      this.sound.play();
    }
    this.stop = function(){
      this.sound.pause();
    }
  }
