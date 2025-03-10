'use strict';

////////////////////ELEMENTS///
const body = document.querySelector('body');
const checkBtn = document.querySelector('.check');
const againBtn = document.querySelector('.again');
const scoreEl = document.querySelector('.score');
const guessEl = document.querySelector('.guess');
const numberEl = document.querySelector('.number');
const messageEl = document.querySelector('.message');
const highScoreEl = document.querySelector('.highscore');

///////////////////VARIABLES///
let score = 20;
let secretNumber = Math.trunc(Math.random() * 20 + 1);
let highScore = 0;
function message(text) {
  messageEl.textContent = text;
}

///////////////////////GAME///
checkBtn.addEventListener('click', function () {
  const guess = Number(guessEl.value);

  if (!guess) message('type a number lil bro');
  else if (guess === secretNumber) {
    message('vc venceu!');
    numberEl.textContent = secretNumber;
    numberEl.style.width = '30rem';
    body.style.backgroundColor = '#60b347';

    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
    }
  } else if (guess !== secretNumber) {
    if (score > 1) {
      message(`Too ${guess > secretNumber ? 'high!' : 'low!'}`);
      score--;
      scoreEl.textContent = score;
    } else {
      scoreEl.textContent = score;
      message('you lost :c');
    }
  }
});

//////////////////////AGAIN///
againBtn.addEventListener('click', function () {
  //VALUES
  score = 20;
  secretNumber = Math.trunc(Math.random() * 20 + 1);

  ///STYLES
  body.style.backgroundColor = '#222';
  numberEl.style.width = '15rem';
  numberEl.textContent = '?';
  scoreEl.textContent = score;
  guessEl.value = '';
  message('Start guessing...');
});
