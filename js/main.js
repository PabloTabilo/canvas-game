const canvas = document.querySelector('canvas');
const score = document.querySelector("#score");
const c = canvas.getContext('2d');
const startGameBtn = document.querySelector("#startGameBtn");
const modalEl = document.querySelector("#modalEl");
const bigScoreEl = document.querySelector("#bigScoreEl");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player{
    constructor(x, y, radius, color){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.draw();
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y,
            this.radius, 0, Math.PI * 2,
            false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Proyectile{
    constructor(x, y, radius, color, velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
        this.draw();
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y,
            this.radius, 0, Math.PI * 2,
            false);
        c.fillStyle = this.color;
        c.fill();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy{
    constructor(x, y, radius, color, velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
        this.draw();
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y,
            this.radius, 0, Math.PI * 2,
            false);
        c.fillStyle = this.color;
        c.fill();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;
class Particle{
    constructor(x, y, radius, color, velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
        this.draw();
        this.alpha=1;
    }
    draw(){
        c.save();
        c.globalAlpha=this.alpha;
        c.beginPath();
        c.arc(this.x, this.y,
            this.radius, 0, Math.PI * 2,
            false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }
    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha-=0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 17, "white");
let proyectiles = [];
let enemies = [];
let particles = [];
let scoreNum=0;

function init(){
    player = new Player(x, y, 17, "white");
    proyectiles = [];
    enemies = [];
    particles = [];
    scoreNum=0;
    score.innerHTML=0;
    bigScoreEl.innerText=0;
}

function spawnEnemies(){
    setInterval(()=>{
        const radius = Math.random() * 30 + 14;
        let x;
        let y;
        if(Math.random()<.5){
            x = (Math.random()<.5?0-radius: canvas.width+radius);
            y = Math.random() * canvas.height;
        }else{
            y = (Math.random()<.5?0-radius: canvas.height+radius);
            x = Math.random() * canvas.width;
        }
        const color = `hsl(${Math.random()*360},50%,50%)`;
        const difX = canvas.width/2 - x;
        const difY = canvas.height/2 - y;
        const angle = Math.atan2(difY, difX);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 500);
}

let animationId;
function animate(){
    animationId = requestAnimationFrame(animate);
    c.fillStyle= "rgba(0,0,0,.2)";
    c.fillRect(0,0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, paridx) =>{
        if(particle.alpha <= 0){
            particles.slice(paridx, 1);
        }else{
            particle.update();
        }
    });
    proyectiles.forEach((proyectile, pidx) => {
        proyectile.update();
        if((proyectile.x + proyectile.radius < 0) ||
            (proyectile.x - proyectile.radius > canvas.width) ||
            (proyectile.y + proyectile.radius < 0) ||
            (proyectile.y - proyectile.radius > canvas.height)){
            setTimeout(() => {
                proyectiles.splice(pidx,1);
            }, 0);
        }
    })
    enemies.forEach((enemy, idx) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        // End Game
        if(dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId);
            modalEl.style.display="flex";
            bigScoreEl.innerText = scoreNum;
        }
        proyectiles.forEach((proyectile, pidx)=>{
            const dist = Math.hypot(proyectile.x - enemy.x, proyectile.y - enemy.y);
            // When projectiles touch enemies
            if(dist - enemy.radius - proyectile.radius < 1){
                // Increase our score
                scoreNum+=100;
                score.innerHTML=scoreNum;
                // Create explosions
                for(let i=0; i<enemy.radius*2;i++){
                    particles.push(new Particle(proyectile.x, proyectile.y,
                        Math.random()*2,
                        enemy.color,
                        {
                            x: Math.random() - .5 * (Math.random() * 6),
                            y : Math.random() - .5 * (Math.random() * 6)
                        }))
                }
                if(enemy.radius - 17 > 5){
                    // Increase our score
                    scoreNum+=100;
                    score.innerHTML=scoreNum;
                    gsap.to(enemy, {
                        radius: enemy.radius-17
                    });
                    setTimeout(() => {
                        proyectiles.splice(pidx,1);
                    }, 0);
                }else{
                    // Increase our score
                    scoreNum+=25;
                    score.innerHTML=scoreNum;
                    setTimeout(() => {
                        enemies.splice(idx,1);
                        proyectiles.splice(pidx,1);
                    }, 0);
                }
            }
        });
    })
}

addEventListener("click", (e) => {
    const difX = e.clientX - canvas.width/2;
    const difY = e.clientY - canvas.height/2;
    // const h = Math.sqrt(Math.pow((difX),2) + Math.pow((difY),2));
    // const velX = difX/h;
    // const velY = difY/h;
    // const velocity = {
    //     x : velX,
    //     y : velY
    // }
    const angle = Math.atan2(difY, difX);
    const velocity = {
        x: Math.cos(angle)*6,
        y: Math.sin(angle)*6
    }
    const proyectile = new Proyectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        "white",
        velocity
    )
    proyectiles.push(proyectile);
});

startGameBtn.addEventListener("click", ()=>{
    init();
    animate();
    spawnEnemies();
    modalEl.style.display="none";
})
