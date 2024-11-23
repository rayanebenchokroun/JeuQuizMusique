const nCards = 5;
let selectedCard = 0;


function cardToPos(card) {
    return 2 * Math.PI * (card - selectedCard)/nCards;
}

function posToCords(pos) {

    let a = pos + Math.PI/2;
    const X = 10, Y = 10;
    
    return [
        X * Math.cos(a),
        Y * Math.sin(a)
    ];

}

function posToScale(pos) {

    let a = pos + Math.PI/2;
    let s = (Math.sin(a) + 1) / 2;
    return 70 + 70 * s;

}

function updateCards() {

    if (selectedCard < 0) selectedCard = nCards - 1;
    selectedCard %= nCards;

    for(let i = 0; i < nCards; i++) {
        const c = document.getElementById("card" + i);
        let pos = cardToPos(i);
        let [x, y] = posToCords(pos);
        let scale = posToScale(pos);
        let a = pos + Math.PI/2;
        let s = -(Math.sin(a) - 1) / 2;
        c.style.transform = `scale(${scale}%) translateX(${x}vw) translateY(${y - 6}vh)`;
        let filter = `blur(${s*6 | 0}px)`;
        if (i != selectedCard) filter += " grayscale()";
        c.style.filter = filter;
        c.style.zIndex = scale | 0;
    }

}

function moveLeft() {
    selectedCard++;
    updateCards();
}
function moveRight() {
    selectedCard--;
    updateCards();
}

window.onload = () => {
    titleSetup();
    updateCards();
};