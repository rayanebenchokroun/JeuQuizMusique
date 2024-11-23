const APIKEY = "$2a$10$NvxyHzwseaPX9KayU.zUsOwVToxkW8kIUI36Vc3LxxwwRY5lZ/KI6";

const welcomeTexts = [
"Welcome to TuneWave, you're about to play our musical quiz that consists of 15 questions! Click continue to continue reading, or start the quiz if you already know the rules!",

"You will be presented with a random lyric from the musical world, and 5 possible artists, the quicker you are to guess the right artist, the more points you win!",

"Each correct answer can get you up to 50 points! However if you do not answer, or get a wrong answer, you might lose up to 30 points, so be careful!",

"You cannot skip the question, you cannot stop the game, once you're in, you have to go for the win!",

"After each game, your score will be displayed, and you will be able to see how you stack up against other players. Aim for the highest score possible and challenge your friends to see who is the music champion!",

"We hope these rules help you have fun while testing your musical knowledge. Shall we start?"]

//sounds
const countdown = new Audio("sound/countdown.wav");
const crowd = new Audio("sound/crowd.mp3");
const wrongAnswer = new Audio("sound/wrong_answer.mp3");
const timer = new Audio("sound/timer.mp3");

const rightAnswers = [0, 1, 2, 3, 4].map(e => new Audio(`sound/right_answer_${e}.mp3`));

[...rightAnswers, countdown, wrongAnswer, timer].forEach(sound => sound.volume = 0.2);
crowd.volume = 0.1;


let GameSession = {
    lyrics: null,
    name: "",
    score: 0,
    timer: 0,
    round: 1,
    streak: 0,
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
    let savingUsername = username.split(" ").filter(a => a).sort().join("").toLowerCase();
    let rememberMe = document.getElementById("remember-me").checked;
    if (!username) {
        return alert("Veuillez entrer un nom correct.");
    }
    GameSession.name = savingUsername;
    if (rememberMe) localStorage.setItem("tunewaveUsername", username);
    else localStorage.removeItem("tunewaveUsername");
    currentBlock++;
    updateBlock();
    startCounter()
}

let counter = 3;
async function startCounter() {
    GameSession.starting = true;
    countdown.currentTime = 0;
    await countdown.play();
    updateCounter();
    await wait(1000);
    updateCounter();
    await wait(1000);
    updateCounter();
    await wait(1000);
    updateCounter();
    await wait(700);
    countdown.pause();
    startGame();
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
    GameSession.streak = 0;
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
            await crowd.play();
            loader.classList.remove("visible");
            lyricElement.classList.add("active");
            lyricElement.innerText = `Your final score, ${GameSession.name}, is: ${GameSession.score}`;
            document.getElementById("restart-part").classList.add("visible");
            document.getElementById("restart-button").onclick = () => {
                document.getElementById("restart-button").onclick = () => {};
                document.getElementById("restart-part").classList.remove("visible");
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
    document.getElementById("score").innerText = `${GameSession.score} PTS`;
    try {

        await wait(100 + Math.random() * 200 | 0);

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
                let addedScore = right ?
                    ((GameSession.timer) * 5 + GameSession.streak * (GameSession.timer) * Math.floor(2 + Math.random() * 3) + (GameSession.streak === 4 ? Math.floor(5 + Math.random() * 10) : 0)) :
                    (GameSession.timer - 11) * Math.floor(4 + Math.random() * 8);
                if (!right) GameSession.streak = 0;
                timer.pause();
                await (right ? rightAnswers[GameSession.streak] : wrongAnswer).play();
                await addScore(addedScore);
                if (right) {
                    GameSession.streak++;
                    GameSession.streak = Math.min(GameSession.streak, 4);
                } else GameSession.streak = 0;
                await wait(2000);
                document.getElementById("song-title-cont").classList.remove("visible");
                lyricElement.classList.remove("active");
                GameSession.round++;
                startRound();
            }
        });

        const randomLyric = lyrics[Math.floor(Math.random() * lyrics.length)];
        GameSession.currentLyric = randomLyric;
        const formattedArtist = formatArtist(randomLyric.artist);
        let choices = [], formattedChoices = [];
        for(let i = 0; i < 5; i++) {
            let choice, formattedChoice;
            do {
                let a = formatArtist(lyrics[Math.floor(Math.random() * lyrics.length)].artist)
                choice = a[0];
                formattedChoice = a[1];
            } while(choices.includes(choice) || randomLyric.artist.toLowerCase().includes(choice))
            choices.push(choice);
            formattedChoices.push(formattedChoice);
        }
        let r = Math.floor(Math.random() * 5);
        choices[r] = formattedArtist[0];
        formattedChoices[r] = formattedArtist[1];
        GameSession.rightAnswer = r;
        const lyricElement = document.getElementById("lyric");
        lyricElement.classList.add("active");
        lyricElement.innerText = randomLyric["lyric"];
        document.getElementById("choices").classList.add("visible");
        document.getElementById("score").classList.add("visible")
        document.getElementById("rounds").classList.add("visible")
        document.getElementById("rounds").innerText = "QUESTION " + GameSession.round;
        Array(...document.getElementById("choices").children).forEach((e, i) => {
            e.innerText = formattedChoices[i];
        })
        startTimer();

    } catch(err) {
        alert(err);
    }
}

async function startTimer() {
    timer.currentTime = 0;
    await timer.play();
    document.getElementById("timer").classList.add("active");
    const time = document.getElementById("time");
    GameSession.timer = 10;
    GameSession.timerStopped = false;
    for (let i = 10; i >= 0; i--) {
        if (GameSession.timerStopped) {
            timer.pause();
            return;
        }
        time.innerText = `${i}s`;
        GameSession.timer = i;
        await wait(1000);
    }
    if (GameSession.timerStopped) {
        timer.pause();
        return;
    }
    timer.pause();
    await wrongAnswer.play();
    document.getElementById("timer").classList.remove("active");
    Array(...document.getElementById("choices").children).forEach((e, i) => {
        e.classList.add((i === GameSession.rightAnswer) ? "right" : "wrong");
    });
    document.getElementById("song-title-cont").classList.add("visible")
    document.getElementById("song-title").innerText = GameSession.currentLyric.title + " - " + GameSession.currentLyric.artist;
    await addScore(-Math.floor(50 + Math.random() * 50));
    await wait(2000);
    document.getElementById("lyric").classList.remove("active");
    document.getElementById("song-title-cont").classList.remove("visible")
    GameSession.round++;
    GameSession.streak = 0;
    startRound();
}

async function addScore(add) {

    GameSession.score += add;
    GameSession.score = Math.max(GameSession.score, 0);
    const score = document.getElementById("score");
    const scoreAdder = document.getElementById("score-adder");
    const scoreStreak = document.getElementById("score-streak");
    scoreAdder.innerText = add + " PTS";
    scoreAdder.classList.remove("active");
    scoreStreak.classList.remove("active");
    await wait(50);
    scoreAdder.classList.add("active");
    scoreAdder.classList.remove("positive");
    scoreAdder.classList.remove("negative");
    scoreAdder.classList.add(add > 0 ? "positive" : "negative");
    if (GameSession.streak > 0) {
        scoreStreak.classList.add("active");
        scoreStreak.innerText = `${GameSession.streak+1}x`;
    }
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

Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
}

function compareArtists(artist1, artist2) {
    return formatArtist(artist1) === formatArtist(artist2);
}

function formatArtist(artist) {
    const a = artist.split(",").random().split("ft.").random().split("&").random().split(" ").filter(a => a).join(" ");
    return [a.toLowerCase(), a];
}