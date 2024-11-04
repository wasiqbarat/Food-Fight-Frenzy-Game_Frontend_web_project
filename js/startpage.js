

const levelRadios = document.querySelectorAll('input[name="level"]');

levelRadios.forEach(radio => {
    radio.addEventListener('change', updateHighScore);
});


function updateHighScore() {
    const selectedLevel = document.querySelector('input[name="level"]:checked').value;  
    console.log(selectedLevel)
    let highScore = 0;
    
    if (selectedLevel === '1') {
        highScore = localStorage.getItem('level1score');
    } else if (selectedLevel === '2') {
        highScore = localStorage.getItem('level2score');
    }

    document.getElementById('highscore').innerHTML = `High Score:<br>${highScore}`;
}

window.onload = updateHighScore;

function startGame() {
    const selectedLevel = document.querySelector('input[name="level"]:checked').value;

    localStorage.setItem("level", selectedLevel)
    window.location.href = 'gamepage.html';
    console.log(document.querySelector('input[name="level"]:checked').value)
}
