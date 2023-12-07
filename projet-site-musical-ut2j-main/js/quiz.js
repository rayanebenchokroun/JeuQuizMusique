const APIKEY = "$2a$10$NvxyHzwseaPX9KayU.zUsOwVToxkW8kIUI36Vc3LxxwwRY5lZ/KI6";

const welcomeTexts = [
"Welcome to TuneWave, you're about to play our musical quiz that consists of 15 questions! Click continue to continue reading, or start the quiz if you already know the rules!",

"You will be presented with a random lyric from the musical world, and 5 possible artists, the quicker you are to guess the right artist, the more points you win!",

"Each correct answer can get you up to 50 points! However if you do not answer, or get a wrong answer, you might lose up to 30 points, so be careful!",

"You cannot skip the question, you cannot stop the game, once you're in, you have to go for the win!",

"After each game, your score will be displayed, and you will be able to see how you stack up against other players. Aim for the highest score possible and challenge your friends to see who is the music champion!",

"We hope these rules help you have fun while testing your musical knowledge. Shall we start?"]



let GameSession = {
    lyrics: null,
    name: "",
    score: 0,
    timer: 0,
    round: 1,
    timerStopped: false,
    currentLyric: {},
    rightAnswer: 0,
    questionN: 0,
    starting: false,
    started: false,
    stopTimer: () => {},
}

let currentBlock = 0;
let blocks = [
    "welcome-message",
    "username-message"
];

let currentMessage = 0;

function updateMessage() {

    const e = document.getElementById("welcome-message-text");
    e.innerHTML = welcomeTexts[currentMessage];

    if (currentMessage === welcomeTexts.length - 1) {
        const nextButton = document.getElementById("welcome-message-skip");
        nextButton.disabled = true;
    }

}

function nextMessage() {
    currentMessage++;
    updateMessage();
}
function closeMessage(){
    currentBlock++;
    updateBlock();
}

function updateBlock() {
    for(const b of blocks) {
        document.getElementById(b).classList.remove("visible");
    }
    if (currentBlock<blocks.length) document.getElementById(blocks[currentBlock]).classList.add("visible");
    else document.getElementById("top-layer").classList.add("done")
    if (blocks[currentBlock] === "username-message") {
        if (localStorage.getItem("tunewaveUsername")) {
            document.getElementById("remember-me").checked = true;
            document.getElementById("username-input").value = localStorage.getItem("tunewaveUsername");
        }
    }
}

function saveUsername() {
    let username = document.getElementById("username-input").value;
    let rememberMe = document.getElementById("remember-me").checked;
    if (!username) {
        return alert("Veuillez entrer un nom correct.");
    }
    GameSession.name = username;
    if (rememberMe) localStorage.setItem("tunewaveUsername", username);
    else localStorage.removeItem("tunewaveUsername");
    currentBlock++;
    updateBlock();
    startCounter()
}

let counter = 3;
function startCounter() {
    GameSession.starting = true;
    updateCounter();
    setTimeout(updateCounter, 750);
    setTimeout(updateCounter, 1500);
    setTimeout(updateCounter, 2250);
    setTimeout(startGame, 3000);
}

function updateCounter() {
    document.getElementById("game-counter").innerHTML = counter >= 1 ? counter-- : "Let's go";
}

let confettiInterval;
function startConfetti() {
    confettiInterval = setInterval(() => createConfetti(), 100);
}
function stopConfetti() {
    clearInterval(confettiInterval);
}

function startGame() {
    stopConfetti();
    GameSession.started = true;
    GameSession.round = 1;
    GameSession.score = 0;
    document.getElementById("back").style.display = "none";
    startRound();
}

async function startRound() {

    if (GameSession.round === 16) {
        GameSession.timerStopped = true;
        document.getElementById("choices").classList.remove("visible");
        document.getElementById("score").classList.remove("visible");
        document.getElementById("rounds").classList.remove("visible");
        document.getElementById("timer").classList.remove("active")
        const lyricElement = document.getElementById("lyric");
        lyricElement.classList.remove("active");
        lyricElement.innerText = "";
        const loader = document.getElementById("loader");
        loader.classList.add("visible");
        try {
            const url = "https://api.jsonbin.io/v3/b/6570d98112a5d37659a4108c";
            let options = {
                method: "GET",
                headers: {
                    'Content-Type': "application/json",
                    'X-Access-Key': APIKEY,
                }
            }
            let response = await fetch(url, options);
            if (!response.ok) {
                throw new Error();
            }
            let data = await response.json();
            let users = data.record.users;
            let i = users.findIndex(e => e.name.toLowerCase() === GameSession.name.toLowerCase());
            if (i >= 0 && users[i].highscore < GameSession.score) {
                users[i].highscore = GameSession.score;
            } else if (i === -1) {
                users.push({
                    name: GameSession.name,
                    highscore: GameSession.score
                })
            }
            options = {
                method: "PUT",
                headers: {
                    'Content-Type': "application/json",
                    'X-Access-Key': APIKEY,
                },
                body: JSON.stringify({
                    users
                })
            }
            response = await fetch(url, options);
            if (!response.ok) {
                throw new Error();
            }
            startConfetti();
            loader.classList.remove("visible");
            lyricElement.classList.add("active");
            lyricElement.innerText = `Your final score, ${GameSession.name}, is: ${GameSession.score}`;
            document.getElementById("restart-button").classList.add("visible");
            document.getElementById("restart-button").onclick = () => {
                document.getElementById("restart-button").onclick = () => {};
                document.getElementById("restart-button").classList.remove("visible");
                document.getElementById("lyric").classList.remove("active");
                document.getElementById("lyric").innerText = "";
                GameSession.starting = false;
                GameSession.started = false;
                clearInterval(confettiInterval);
                startGame();
            }

        } catch(err) {
            alert(err);
        }
        return;
    }

    const loader = document.getElementById("loader");
    loader.classList.add("visible");
    try {

        await wait(300 + Math.random() * 1200 | 0);

        loader.classList.remove("visible");
        const lyrics = GLOBAL_LYRICS;

        Array(...document.getElementById("choices").children).forEach((e, i) => {
            e.classList.remove("right");
            e.classList.remove("wrong");
            e.classList.remove("wrong-selected");
            e.onclick = async () => {
                GameSession.timerStopped = true;
                const right = (i === GameSession.rightAnswer);
                document.getElementById("song-title-cont").classList.add("visible");
                document.getElementById("song-title").innerText = GameSession.currentLyric.title + " - " + GameSession.currentLyric.artist;
                document.getElementById("timer").classList.remove("active");
                Array(...document.getElementById("choices").children).forEach((_e, j) => {
                    _e.classList.add((j === GameSession.rightAnswer) ? "right" : (j === i) ? "wrong-selected" : "wrong");
                    _e.onclick = () => {};
                });
                let addedScore = right ? (GameSession.timer) * 5 : (GameSession.timer - 11) * 3;
                await addScore(addedScore);
                await wait(2000);
                document.getElementById("song-title-cont").classList.remove("visible");
                lyricElement.classList.remove("active");
                GameSession.round++;
                startRound();
            }
        });

        const randomLyric = lyrics[Math.floor(Math.random() * lyrics.length)];
        GameSession.currentLyric = randomLyric;
        let choices = [];
        for(let i = 0; i < 5; i++) {
            let choice;
            do {
                choice = formatArtistProperly(lyrics[Math.floor(Math.random() * lyrics.length)].artist);
            } while(choices.includes(choice) || compareArtists(choice, randomLyric.artist))
            choices.push(choice);
        }
        let r = Math.floor(Math.random() * 5);
        choices[r] = formatArtistProperly(randomLyric.artist);
        GameSession.rightAnswer = r;
        const lyricElement = document.getElementById("lyric");
        lyricElement.classList.add("active");
        lyricElement.innerText = randomLyric["lyric"];
        document.getElementById("choices").classList.add("visible");
        document.getElementById("score").classList.add("visible")
        document.getElementById("rounds").classList.add("visible")
        document.getElementById("rounds").innerText = "ROUND " + GameSession.round;
        Array(...document.getElementById("choices").children).forEach((e, i) => {
            e.innerText = choices[i];
        })
        startTimer();

    } catch(err) {
        alert(err);
    }
}

async function startTimer() {
    document.getElementById("timer").classList.add("active");
    const time = document.getElementById("time");
    GameSession.timer = 10;
    GameSession.timerStopped = false;
    for (let i = 10; i >= 0; i--) {
        if (GameSession.timerStopped) return;
        time.innerText = `${i}s`;
        GameSession.timer = i;
        await wait(1000);
    }
    if (GameSession.timerStopped) return;
    document.getElementById("timer").classList.remove("active");
    Array(...document.getElementById("choices").children).forEach((e, i) => {
        e.classList.add((i === GameSession.rightAnswer) ? "right" : "wrong");
    });
    document.getElementById("song-title-cont").classList.add("visible")
    document.getElementById("song-title").innerText = GameSession.currentLyric.title + " - " + GameSession.currentLyric.artist;
    await addScore(-50);
    await wait(2000);
    document.getElementById("lyric").classList.remove("active");
    document.getElementById("song-title-cont").classList.remove("visible")
    GameSession.round++;
    startRound();
}

async function addScore(add) {

    GameSession.score += add;
    const score = document.getElementById("score");
    const scoreAdder = document.getElementById("score-adder");
    scoreAdder.innerText = add + " PTS";
    scoreAdder.classList.remove("active");
    await wait(100);
    scoreAdder.classList.add("active");
    scoreAdder.classList.remove("positive");
    scoreAdder.classList.remove("negative");
    scoreAdder.classList.add(add > 0 ? "positive" : "negative");
    await wait(1500);
    score.innerText = `${GameSession.score} PTS`;

}

async function wait(ms) {
    return new Promise((res) => {
        setTimeout(res, ms);
    })
}


window.onload = () => {
    updateMessage();
    updateBlock();
}

function createConfetti() {
    function getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * window.innerWidth}px`;
    confetti.style.transform = `rotate(${Math.random() * 720 | 0}deg)`
    confetti.style.backgroundColor = getRandomColor();

    document.body.appendChild(confetti);

    confetti.addEventListener("animationend", () => {
        confetti.remove();
    });
}

function compareArtists(artist1, artist2) {
    return formatArtist(artist1) === formatArtist(artist2);
}

function formatArtist(artist) {
    return artist.split(" ").join("").split(",")[0].split("ft.")[0];
}

function formatArtistProperly(artist) {
    return artist.split(",")[0].split("ft.")[0];
}