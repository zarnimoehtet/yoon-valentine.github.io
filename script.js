(function () {
  'use strict';

  // 1. CONFIGURATION: Set your correct answers here
  const CORRECT_ANSWERS = {
    0: 'blue',      // Question 1: Favorite color
    1: 'july',      // Question 2: Dating month
    2: '5feet'      // Question 3: Height
  };

  // 2. ELEMENT SELECTORS
  const quizPage = document.getElementById('quizPage');
  const resultPage = document.getElementById('resultPage');
  const questionCards = document.querySelectorAll('.question-card');
  const heartContainers = document.querySelectorAll('.heart-container');
  const options = document.querySelectorAll('.option');

  // 3. STATE TRACKING
  const answered = { 0: false, 1: false, 2: false };

  /**
   * Creates a heart element that flies from the button to the progress heart, then fills it
   */
  function flyHeartToSlot(questionIndex, fromButton) {
    const container = heartContainers[questionIndex];
    if (!container || container.classList.contains('filled')) return;

    var fromRect = fromButton.getBoundingClientRect();
    var toEl = container.querySelector('.heart-filled') || container;
    var toRect = container.getBoundingClientRect();
    var startX = fromRect.left + fromRect.width / 2;
    var startY = fromRect.top + fromRect.height / 2;
    var endX = toRect.left + toRect.width / 2;
    var endY = toRect.top + toRect.height / 2;

    var fly = document.createElement('div');
    fly.className = 'flying-heart-el';
    fly.style.left = startX + 'px';
    fly.style.top = startY + 'px';
    fly.innerHTML = '<img src="like-full.svg" alt="" class="heart-img" width="48" height="48">';
    document.body.appendChild(fly);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        fly.style.left = endX + 'px';
        fly.style.top = endY + 'px';
      });
    });

    fly.addEventListener('transitionend', function onEnd() {
      fly.removeEventListener('transitionend', onEnd);
      fly.classList.add('landed');
      container.classList.add('filled');
      setTimeout(function () {
        if (fly.parentNode) fly.parentNode.removeChild(fly);
      }, 220);
    });
  }

  /**
   * Fills the progress heart (used after fly animation completes via flyHeartToSlot)
   */
  function fillHeart(questionIndex) {
    var container = heartContainers[questionIndex];
    if (container && !container.classList.contains('filled')) {
      container.classList.add('filled');
    }
  }

  /**
   * Styles the button based on correctness
   */
  function markOption(button, correct) {
    button.classList.add(correct ? 'correct' : 'wrong');
    button.disabled = true;
    button.setAttribute('aria-pressed', correct ? 'true' : 'false');
  }

  /**
   * Switches to the final message page: huge congrats first, then after 5s shrink title and reveal image + paragraph
   */
  function showResultPage() {
    var resultContent = document.getElementById('resultContent');
    quizPage.classList.add('hidden');
    resultPage.classList.remove('hidden');
    resultPage.setAttribute('aria-hidden', 'false');
    quizPage.setAttribute('aria-hidden', 'true');

    // Remove reveal class so we start with phase 1 (huge title only)
    if (resultContent) resultContent.classList.remove('result-reveal');

    // Trigger Confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d44d6e', '#e87a94', '#f8e8ec', '#d4af37']
      });
    }

    // After 5s: add result-reveal to shrink title and animate in image + paragraph
    setTimeout(function () {
      if (resultContent) resultContent.classList.add('result-reveal');
    }, 5000);
  }

  /**
   * Checks if all hearts are filled
   */
  function checkAllCorrect() {
    const allDone = Object.values(answered).every(val => val === true);
    if (allDone) {
      setTimeout(showResultPage, 800);
    }
  }

  /**
   * Core logic for handling clicks
   */
  function handleAnswer(questionIndex, value) {
    // If this specific question is already solved, do nothing
    if (answered[questionIndex]) return;

    const questionCard = questionCards[questionIndex];
    const isCorrect = CORRECT_ANSWERS[questionIndex] === value;

    const chosenOption = Array.from(questionCard.querySelectorAll('.option'))
                              .find(btn => btn.getAttribute('data-value') === value);

    if (chosenOption) {
      markOption(chosenOption, isCorrect);
    }

    if (isCorrect) {
      answered[questionIndex] = true;
      questionCard.classList.add('answered-correct');

      // Disable all other options for this question once correct
      questionCard.querySelectorAll('.option').forEach(function (btn) {
        btn.disabled = true;
      });

      // Fly heart from button to progress slot, then fill
      flyHeartToSlot(questionIndex, chosenOption);

      // After fly animation finishes (~650ms), check if all done and show result
      setTimeout(function () {
        checkAllCorrect();
      }, 900);
    }
  }

  // 4. EVENT LISTENERS
  options.forEach(function (button) {
    button.addEventListener('click', function () {
      const questionCard = button.closest('.question-card');
      if (!questionCard) return;

      const questionIndex = parseInt(questionCard.getAttribute('data-id'), 10);
      const value = button.getAttribute('data-value');
      
      if (value !== null) {
        handleAnswer(questionIndex, value);
      }
    });
  });

})();