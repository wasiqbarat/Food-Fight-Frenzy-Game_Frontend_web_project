const canvas = document.getElementById('wormCanvas');
const ctx = canvas.getContext('2d');

const worms = [];
const foods = [];
const obsticles = []

let score = 0

let level = 1;
let timer = 0;
const levelDuration = 60;
let gameStartTime = Date.now();

let speed = 90 / 60;


let isPaused = false;

function togglePause() {
    isPaused = !isPaused;

    document.getElementById('pause-play').innerText = isPaused ? '►' : 'II';

    if (!isPaused) {
        animate();
    }
}

document.getElementById('pause-play').addEventListener('click', togglePause);

function createWorm() {
    const worm = {
    type: 1,

    segments: [],
    segmentCount: 9,
    segmentSize: 5,
    dx: speed,   
    dy: speed,      
    
    // x and y coordinates
    x: Math.random() * canvas.width,
    y: 0,
    active:true,
    };

    for (let i = 0; i < worm.segmentCount; i++) {
        worm.segments.push({ x: worm.x, y: worm.y - i * worm.segmentSize });
    }

    worms.push(worm);
}

function drawWorm(worm) {
    if (worm.active) {
        worm.segments.forEach((segment) => {
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, worm.segmentSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = "#333";
            ctx.fill();
            ctx.closePath();
        });
    }
}


function find_nearest_food(worm) {
    let nearestDistance = 1000;
    let nearestFood = 0;
    for(let i = 0; i < foods.length;i++){
        if (foods[i][3]){
            const distance = Math.sqrt((worm.x - foods[i][0]) ** 2 + (worm.y - foods[i][1]) ** 2);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestFood = i;
            }
        }
    } 

    return [nearestFood, nearestDistance];
} 


function check_endgame_possibility() {
    updateTimerAndLevel()
    if (timer >= levelDuration) {
        if (level == 1) {
            highest_score_till_now = localStorage.getItem('level1score');
            if(highest_score_till_now != null && highest_score_till_now < score) {
                localStorage.setItem('level1score', score);
            }
            
        }else{
            highest_score_till_now = localStorage.getItem('level2score');
            if(highest_score_till_now != null && highest_score_till_now < score) {
                localStorage.setItem('level2score', score);
            }
        }

        alert("End Game")
        window.location.href = 'startpage.html';
    }
    
    let foodCounter = 0;

    for(let i = 0; i < foods.length; i++) {
        if(foods[i][3]) {
            foodCounter++;
        }
    }

    if(foodCounter <= 0) {
        alert("End Game")

        if (level == 1) {
            highest_score_till_now = localStorage.getItem('level1score');
            if(highest_score_till_now != null && highest_score_till_now < score) {
                localStorage.setItem('level1score', score);
            }

        }else{
            highest_score_till_now = localStorage.getItem('level2score');
            if(highest_score_till_now != null && highest_score_till_now < score) {
                localStorage.setItem('level2score', score);
            }
        }
        
        window.location.href = 'startpage.html';
    }

}

function updateWorm(worm) {
    let [food, distance] = find_nearest_food(worm);

    if (worm.active && foods[food]) {
        if (worm.x > foods[food][0]) {
            worm.x -= worm.dx;
        } else {
            worm.x += worm.dx;
        }

        if (worm.y > foods[food][1]) {
            worm.y -= worm.dy;
        } else {
            worm.y += worm.dy;
        }
    }

    if(distance <= 3) {
        foods[food][3] = false;
        document.getElementById(`${foods[food][2]}`).style.display = 'none';
        
        switch (foods[food][4]) {
            case "food1":
                score -= 2;
                document.getElementById("score").innerText = `Score: ${score}`;
                check_endgame_possibility()
                break;
            case "food2":
                score -= 4;
                document.getElementById("score").innerText = `Score: ${score}`;
                
                check_endgame_possibility()
                break;
        }

    }

    worm.segments.unshift({ x: worm.x, y: worm.y });
    worm.segments.pop();

    if (worm.x > canvas.width || worm.x < 0) worm.dx *= -1;
    if (worm.y > canvas.height || worm.y < 0) worm.dy *= -1;
}


function isPointInWorm(x, y, worm) {
    return worm.segments.some(segment => {
        const dx = x - segment.x;
        const dy = y - segment.y;
        return Math.sqrt(dx * dx + dy * dy) < worm.segmentSize / 2;
    });
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    worms.forEach(worm => {
        if (isPointInWorm(x, y, worm)) {
            worm.active = false;
            console.log(worm.active)
            score += 8
            console.log(score)
            document.getElementById("score").innerHTML = `Score: ${score}`
        }
    });
});


function animate() {
    if (isPaused) return; 

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    worms.forEach((worm) => {
        updateWorm(worm);
        drawWorm(worm);
    });

    updateTimerAndLevel();

    requestAnimationFrame(animate);
}


setInterval(() => {
    if (!isPaused) createWorm();
}, 3000);



function updateTimerAndLevel() {
    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    timer = elapsedTime % levelDuration;
    document.getElementById("time").innerText = `Time: ${timer} sec`;

    if (elapsedTime >= level * levelDuration) {
        level++;
        document.getElementById("level").innerText = `Level: ${level}`;
        gameStartTime = Date.now();
        speed = 100 / 60; 
    }
    
}


animate();


function collision(x, y, type) {
    if (type === "obstacle") {
        for (let obs of obsticles) {
            if (x <= obs[0] && obs[0] <= x + 20 && y <= obs[1] && obs[1] <= y + 15) {
                return false; 
            }
        }
        return true;
    } else if (type === "food1" || type === "food2") {
        for (let food of foods) {
            if (x <= food[0] && food[0] <= x + 15 && y <= food[1] && food[1] <= y + 15) {
                return false
            }
        }
        return true;
    }
}

counter = 0;

function generate_items(type) {
    let x = Math.floor(Math.random() * 385)
    let y = Math.floor(Math.random() * 550)

    if (type == "obstacle") {

        if(!collision(x, y, "obstacle")) {
            generate_items(type);
        }else {
            obsticles.push([x, y, counter, true, "obs"]);
            let lm = `<div id="${counter}" class="obstacle" style="top: ${y}px; left: ${x}px;"></div>`;
            counter++;
            document.getElementById("last").outerHTML += lm;
        }

    }else if(type == "food1") {
        if(!collision(x, y, "food1")) {
            generate_items(type);
        } {
            foods.push([x, y, counter, true, "food1"]);

            let lm = `<div id="${counter}" class="food1" style="top: ${y}px; left: ${x}px;"></div>`;
            counter++;
            document.getElementById("last").outerHTML += lm;
        }

    }else if (type == "food2") {
        if(!collision(x, y, "food2")) {
            generate_items(type)
        }else {
            foods.push([x, y, counter, true, "food2"]);

            let lm = `<div id="${counter}" class="food2" style="top: ${y}px; left: ${x}px;"></div>`;
            counter++;
            document.getElementById("last").outerHTML += lm;
        }

    }
}


function run() {
    if(localStorage.getItem("level") == 1) {
        speed = 80 / 60;
    }else{
        level = 2;
        localStorage.setItem("level", 2)
        document.getElementById("level").innerText = `Level: 2`;
        speed = 100 / 60;
    }
    
    let num = Math.floor(Math.random() * 4) + 1;
    for(let i = 0; i < num; i++) {
        while(true) {
            generate_items("obstacle")
            break;
        }
    }

    num = Math.floor(Math.random() * 6) + 1;
    for(let i = 0; i < num; i++) {
        while(true) {
            generate_items("food1")
            break;
        }
    }

    num = Math.floor(Math.random() * 4) + 1;
    for(let i = 0; i < num; i++) {
        while(true) {
            generate_items("food2")
            break;
        }
    }

}


run()