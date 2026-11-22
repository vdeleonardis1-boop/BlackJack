let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0;

let hidden;
let deck;

let canHit = false; //allows the player (you) to draw while yourSum <= 21

//Vittorio start
const STARTING_BALANCE = 1000;
//Vittorio end

let currentBet = 0;

let playerBalance = localStorage.getItem("Balance"); //Bogdan (I handle the money part)
if (playerBalance == null) {
  //Vittorio start
  playerBalance = STARTING_BALANCE;
  //Vittorio end
} else {
  playerBalance = Number(playerBalance);
}
let isBettingPhase = true;

window.onload = function () {
  document.getElementById("hit").addEventListener("click", hit);
  document.getElementById("stay").addEventListener("click", stay);
  buildDeck();
  shuffleDeck();
  updateBalance(playerBalance);
  setName();
  setupBettingSystem();
};

//Bogdan start
function updateBalance(newAmount) {
  localStorage.setItem("Balance", newAmount);
  document.getElementById("bj-balance").innerText = "$" + newAmount;
}

function setupBettingSystem() {
  document.querySelectorAll(".bj-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (!isBettingPhase) return;
      var chipValue = Number(this.getAttribute("data-value"));
      if (currentBet + chipValue <= playerBalance) {
        document.getElementById("bj-bet-error").innerText = "";
        currentBet += chipValue;
        document.getElementById("bj-bet-display").innerText =
          "Bet: $" + currentBet;
      } else {
        document.getElementById("bj-bet-error").innerText =
          "Insufficient funds";
      }
    });
  });

  document.getElementById("bj-deal-btn").addEventListener("click", function () {
    if (!isBettingPhase || currentBet === 0) return;
    document.getElementById("bj-bet-error").innerText = "";
    playerBalance -= currentBet;
    updateBalance(playerBalance);
    isBettingPhase = false;
    startGame();
  });

  document
    .getElementById("bj-clear-btn")
    .addEventListener("click", function () {
      if (!isBettingPhase) return;
      document.getElementById("bj-bet-error").innerText = "";
      currentBet = 0;
      document.getElementById("bj-bet-display").innerText =
        "Bet: $" + currentBet;
    });
}

//Bogdan end

//start matteo

const NUM_DECKS = 3;
const CARD_VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const CARD_SUITS = ["C", "D", "H", "S"]; // Clubs, Diamonds, Hearts, Spades

// When fewer than this many cards are left, the shoe is rebuilt and reshuffled
// (roughly 25% of the shoe, like the "cut card" in a real casino).
const RESHUFFLE_THRESHOLD = Math.floor(NUM_DECKS * 52 * 0.25);

// Fills the global `deck` with NUM_DECKS full decks, in order (not shuffled).
function buildDeck() {
  deck = [];

  for (let d = 0; d < NUM_DECKS; d++) {
    for (let i = 0; i < CARD_SUITS.length; i++) {
      for (let j = 0; j < CARD_VALUES.length; j++) {
        deck.push(CARD_VALUES[j] + "-" + CARD_SUITS[i]); // A-C -> K-C, A-D -> K-D, ...
      }
    }
  }
}

// Shuffles the global `deck` in place using the Fisher-Yates algorithm,
// which gives every possible ordering the same probability.
function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index in [0, i]
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
}

//Vittorio start
function drawCard() {
  if (deck.length === 0) {
    buildDeck();
    shuffleDeck();
  }
  return deck.pop();
}
//Vittorio end

// end matteo

function startGame() {
  canHit = true;

  //Vittorio start
  if (deck.length <= RESHUFFLE_THRESHOLD) {
    buildDeck();
    shuffleDeck();
  }
  //Vittorio end

  //Bogdan intervetion to clear everything before a second round
  dealerSum = 0;
  yourSum = 0;
  dealerAceCount = 0;
  yourAceCount = 0;
  document.getElementById("your-cards").innerHTML = "";
  document.getElementById("dealer-cards").innerHTML =
    '<img id="hidden" src="./images/BACK.png">';
  document.getElementById("dealer-score").innerText = "0";
  document.getElementById("player-score").innerText = "0";
  document.getElementById("results").innerText = "";

  hidden = drawCard();
  dealerSum += getValue(hidden);
  dealerAceCount += checkAce(hidden);
  // console.log(hidden);
  // console.log(dealerSum);

  let cardImg = document.createElement("img");
  let card = drawCard();
  cardImg.src = "./images/" + card + ".svg";
  dealerSum += getValue(card);
  dealerAceCount += checkAce(card);
  document.getElementById("dealer-cards").append(cardImg);
  document.getElementById("dealer-score").innerText = getValue(card);
  //console.log(dealerSum);

  for (let i = 0; i < 2; i++) {
    let cardImg = document.createElement("img");
    let card = drawCard();
    cardImg.src = "./images/" + card + ".svg";
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);
  }
  document.getElementById("player-score").innerText = reduceAce(
    yourSum,
    yourAceCount,
  );
  //console.log(yourSum);

  //Vittorio start
  if (reduceAce(yourSum, yourAceCount) === 21) {
    canHit = false;
    stay();
  }
  //Vittorio end
}

function hit() {
  if (!canHit) {
    return;
  }

  let cardImg = document.createElement("img");
  let card = drawCard();
  cardImg.src = "./images/" + card + ".svg";
  yourSum += getValue(card);
  yourAceCount += checkAce(card);
  document.getElementById("your-cards").append(cardImg);

  document.getElementById("player-score").innerText = reduceAce(
    yourSum,
    yourAceCount,
  );

  //Vittorio start
  if (reduceAce(yourSum, yourAceCount) >= 21) {
    canHit = false;
    stay();
  }
  //Vittorio end
}

//Sabin start
function stay() {
  if (isBettingPhase) return;
  yourSum = reduceAce(yourSum, yourAceCount);

  canHit = false;
  document.getElementById("hidden").src = "./images/" + hidden + ".svg";
  //Vittorio start
  while (yourSum <= 21 && reduceAce(dealerSum, dealerAceCount) < 17) {
    //Vittorio end
    //<img src="./images/4-C.svg">
    let cardImg = document.createElement("img");
    let card = drawCard();
    cardImg.src = "./images/" + card + ".svg";
    dealerSum += getValue(card);
    dealerAceCount += checkAce(card);
    document.getElementById("dealer-cards").append(cardImg);
  }
  dealerSum = reduceAce(dealerSum, dealerAceCount);

  let message = "";
  if (yourSum > 21) {
    message = "You Lose!";
  } else if (dealerSum > 21) {
    message = "You win!";
    playerBalance += 2 * currentBet; //Bogdan
    updateBalance(playerBalance);
  }
  //both you and dealer <= 21
  else if (yourSum == dealerSum) {
    message = "Tie!";
    playerBalance += currentBet;
    updateBalance(playerBalance);
  } else if (yourSum > dealerSum) {
    message = "You Win!";
    playerBalance += 2 * currentBet;
    updateBalance(playerBalance);
  } else if (yourSum < dealerSum) {
    message = "You Lose!";
  }

  currentBet = 0;
  document.getElementById("bj-bet-display").innerText = "Bet: $0";
  isBettingPhase = true;

  //Vittorio start - balance reset when it reaches $0
  if (playerBalance === 0) {
    playerBalance = STARTING_BALANCE;
    updateBalance(playerBalance);
    message += " Balance reset to $" + STARTING_BALANCE;
  }
  //Vittorio end

  document.getElementById("dealer-score").innerText = dealerSum;
  document.getElementById("player-score").innerText = yourSum;
  document.getElementById("results").innerText = message;
}

function getValue(card) {
  let data = card.split("-"); // "4-C" -> ["4", "C"]
  let value = data[0];

  if (isNaN(value)) {
    //A J Q K
    if (value == "A") {
      return 11;
    }
    return 10;
  }
  return parseInt(value);
}

function checkAce(card) {
  if (card[0] == "A") {
    return 1;
  }
  return 0;
}

function reduceAce(playerSum, playerAceCount) {
  while (playerSum > 21 && playerAceCount > 0) {
    playerSum -= 10;
    playerAceCount -= 1;
  }
  return playerSum;
}
//Sabin end
//wojteks name grabber start
function setName() {
  let URLString = new URLSearchParams(window.location.search);
  let playerName = URLString.get("firstNameField");
  //Vittorio start - name saved and reused with localStorage
  if (playerName != null && playerName.trim() !== "") {
    playerName = playerName.trim();
    localStorage.setItem("PlayerName", playerName); // remember the name
  } else {
    playerName = localStorage.getItem("PlayerName"); // reuse the saved name
  }
  //Vittorio end
  if (playerName == null) {
    playerName = "guest";
  }
  document.getElementById("player-name").innerText = playerName;
}
