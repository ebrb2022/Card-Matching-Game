let cardBack = "🂠";
// let cardBack = "&#127137";
// let cardDeck = ['&#127137;','&#127138;','&#127139;','&#127140;','&#127141;','&#127142;','&#127143;','&#127144;','&#127145;','&#127146;','&#127147;','&#127148;','&#127149;','&#127153;','&#127154;','&#127155;','&#127156;','&#127157;','&#127158;','&#127159;','&#127160;','&#127161;','&#127162;','&#127163;','&#127164;','&#127165;','&#127169;','&#127170;','&#127171;','&#127172;','&#127173;','&#127174;','&#127175;','&#127176;','&#127177;','&#127178;','&#127179;','&#127180;','&#127181;','&#127185;','&#127186;','&#127187;','&#127188;','&#127189;','&#127190;','&#127191;','&#127192;','&#127193;','&#127194;','&#127195;','&#127196;','&#127197;','&#127199;'];

// I had to turn card deck into list of decoded cards because DOM's dataset property decodes unicode which means it's not possible to compare strings :(
let cardDeck = ['🂡','🂢','🂣','🂤','🂥','🂦','🂧','🂨','🂩','🂪','🂫','🂬','🂭','🂱','🂲','🂳','🂴','🂵','🂶','🂷','🂸','🂹','🂺','🂻','🂼','🂽','🃁','🃂','🃃','🃄','🃅','🃆','🃇','🃈','🃉','🃊','🃋','🃌','🃍','🃑','🃒','🃓','🃔','🃕','🃖','🃗','🃘','🃙','🃚','🃛','🃜','🃝','🃟'];
let cards = document.querySelectorAll('.col');
let rows = document.querySelector('.deck').children;
let deck = document.querySelector('.deck');
let pairCount;


if (cards.length % 2 == 0) {
    pairCount = cards.length / 2;
} else {
    console.error("The number of cards must be even, no exceptions!");
};

let i;
let pairDeck;

// this randomizer works by checking for unique cards from deck and adding to pair deck with count 0 
// (length of pairDeck has to match the amount of pairs needed)
function randomizeDeck() {
    i = 0;
    pairDeck = [];
    while (i < pairCount) {
        let deckItem = cardDeck[Math.floor(Math.random() * cardDeck.length)];
        if (!pairDeck.some(obj => obj.card == deckItem)) { // unique card check
            pairDeck.push({card: deckItem, count: 0}); // added as object
            i++;
        } else {
            continue;
        }
    }
};

// using filter method to find objects that don't have card pairs assigned already
// originally did this with while loop...works but filter seems better
function getAvailablePair() {
    let available = pairDeck.filter(item => item.count < 2); // finds available cards
    let index = Math.floor(Math.random() * available.length); 
    return available[index];
};

// assigning an available card to each card in the deck, making sure to increment count to get pairs
function assignCardPairs() {
    for (row of rows) {
        for (col of row.children) {
            let deckItem = getAvailablePair();
            col.dataset.card = deckItem.card; // setting dataset property for each card as unique identifier 
            deckItem.count += 1;
        }
    }    
};

// flips all cards to back side
function fliptoBack() {
    for (row of rows) {
        for (col of row.children) {
            col.dataset.card = cardBack;
            col.innerHTML = cardBack; 
            col.classList.remove("matched"); // gotta remove matched for full opacity
        }
    }
};

randomizeDeck();
assignCardPairs();

let firstCard;
let secondCard;
let isLocked = false;
let moves = 0;
let movesDisplay = document.querySelector('#moves');
let timerDisplay = document.querySelector('#timer');
let startTime;
let intervalId;

// saw these time functs on the generative results of Google, pretty neat how they work
// this starts the timer and updates every second
function startTimer() {
    startTime = new Date();
    intervalId = setInterval(updateDisplay, 1000);
};
// does two main things: calculates elapsed time and updates the display
function updateDisplay() {
    const currentTime = new Date();
    const elapsedTime = currentTime - startTime;
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const minutes = Math.floor(elapsedTime / (1000 * 60));
    timerDisplay.innerHTML = "<strong>Time:</strong> " + minutes + " min, " + seconds + " sec";
};

function stopTimer() {
    clearInterval(intervalId);
};

function resetTimer(){
    stopTimer();
    startTime = undefined;
};

// resetting game state
function resetGame() {
    fliptoBack();
    randomizeDeck();
    assignCardPairs();
    moves = 0;
    movesDisplay.innerHTML = "<strong>Moves:</strong> " + moves;
    resetTimer();
    startTimer();
    updateDisplay();
    firstCard = null;
    secondCard = null;
    isLocked = false;  
};

// also saw these alert display functions on generative Google results (I didn't want to use alert())
function displayAlert() {
    const content = document.getElementById("alert-box");
    content.style.display = 'flex';
};

function closeAlert() {
    document.getElementById('alert-box').style.display = 'none';
    resetGame();
};


// checks if all pairs have been found 
function winGame() {
    let pairedCards = pairDeck.filter(item => item.count == 0);
    if (pairCount == pairedCards.length) {
        displayAlert();
        stopTimer();
    }
};

startTimer();
updateDisplay();
document.getElementById('close-button').addEventListener('click', closeAlert);

let reset = document.querySelector('#reset');

reset.addEventListener("click", e => {
    resetGame();
});



deck.addEventListener("click", e => {
    if (isLocked) return; // prevents clicking when cards are being compared
    if (e.target.tagName != "SPAN") return;

    const card = e.target;

    if (card.innerHTML == cardBack) {
        card.innerHTML = card.dataset.card; // flipping card from back to front
    } else {
        // card.innerHTML = cardBack;
        return;
    }
    if (!firstCard) { 
        moves++; 
        movesDisplay.innerHTML = "<strong>Moves:</strong> " + moves;
        firstCard = card; // first card selected
        return;
    }
    if (!secondCard) {
        // second card selected
        moves++;
        movesDisplay.innerHTML = "<strong>Moves:</strong> " + moves;
        secondCard = card;
        if (firstCard.dataset.card == secondCard.dataset.card) {
            isLocked = true; // keep user from clicking other cards 
            // cards match, keeping them face up...timeout so user can see the match
            setTimeout(() => {
                firstCard.classList.add("matched");
                secondCard.classList.add("matched");
                pairDeck.find(item => item.card == firstCard.dataset.card).count = 0; // gotta let winGame know this pair is found
                winGame(); // check for win after each match
                firstCard = null;
                secondCard = null;
                isLocked = false;
            }, 800);
        } else {
            // cards don't match, flipping back over after timeout
            isLocked = true; // cant let user click other cards while waiting, otherwise it'll keep the cards face up even if they dont match
            setTimeout(() => {
                firstCard.innerHTML = cardBack;
                secondCard.innerHTML = cardBack;
                firstCard = null;
                secondCard = null;
                isLocked = false;
            }, 800);
        }
    }


});
