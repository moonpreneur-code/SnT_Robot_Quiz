const robot = document.getElementById("robot-car");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const questionText = document.getElementById("question-text");
const questionCode = document.getElementById("question-code");
const optionsContainer = document.getElementById("options");
const obstacleWall = document.getElementById("obstacle-wall");

let currentQuestionIndex = 0;

const questions = [
    {
    question: "In the given code, which of the following best describes the function of control_robot(0, 1, 1, 0, 32768)?",
    code: `
def control_robot(in1, in2, in3, in4, mspeed):
    EN1.duty_u16(mspeed)
    EN2.duty_u16(mspeed)
    IN1.value(in1)
    IN2.value(in2)
    IN3.value(in3)
    IN4.value(in4)
    `,
    options: [
        { text: "Move forward", value: "A" },
        { text: "Turn left", value: "B" },
        { text: "Turn right", value: "C", correct: true },
        { text: "Stop the robot", value: "D" }
    ],
    correctAnswer: "C",
    animation: {
        A: () => moveForward(),
        B: () => turnLeft(),
        C: () => turnRight(),
        D: () => stopRobot()
    },
    obstacles: { A: [], B: [], C: [], D: [] }
    },
    {
    question: "What will be the output of the given code?",
    code: `
from machine import Pin
from time import sleep

M1_IN1 = Pin(10, Pin.OUT)  
M1_IN2 = Pin(9, Pin.OUT)   
SM1 = Pin(21, Pin.OUT)   

M2_IN3 = Pin(8, Pin.OUT)  
M2_IN4 = Pin(7, Pin.OUT)  
SM2 = Pin(22, Pin.OUT)   

SM1.value(1)
SM2.value(1)

while True:
    M1_IN1.value(0)
    M1_IN2.value(1)
    M2_IN3.value(0)
    M2_IN4.value(1)
    sleep(0.02)
    `,
    options: [
        { text: "The robot moves forward", value: "A" },
        { text: "The robot moves backward", value: "B", correct: true },
        { text: "The robot turns left", value: "C" },
        { text: "The robot turns right", value: "D" }
    ],
    correctAnswer: "B",
    animation: {
        A: () => moveForward(),
        B: () => moveBackward(),
        C: () => turnLeft(),
        D: () => turnRight()
    },
    obstacles: { A: [], B: [], C: [], D: [] }
    },
    {
    question: "If only the left limit switch (LS1) detects an obstacle (LS1 = 0, LS2 = 1), what will the robot do?",
    code: `
from machine import Pin, I2C
from i2c_lcd import I2cLcd
from time import sleep

M1P = Pin(10, Pin.OUT)  
M1N = Pin(9, Pin.OUT)    
M1S = Pin(21, Pin.OUT)    

M2P = Pin(8, Pin.OUT)    
M2N = Pin(7, Pin.OUT)    
M2S = Pin(22, Pin.OUT)   

LS1 = Pin(6, Pin.IN, Pin.PULL_UP)
LS2 = Pin(3, Pin.IN, Pin.PULL_UP)

M1S.value(1)
M2S.value(1)

M1P.value(1)
M1N.value(0)
M2P.value(1)
M2N.value(0)

while True:
    s1 = LS1.value()
    s2 = LS2.value()
    if (LS1.value() == 0) or (LS2.value() == 0):
        M1P.value(0)
        M1N.value(0)
        M2P.value(0)
        M2N.value(0)
        sleep(0.2)

        M1P.value(0)
        M1N.value(1)
        M2P.value(0)
        M2N.value(1)
        sleep(2)

        M1P.value(0)
        M1N.value(0)
        M2P.value(0)
        M2N.value(0)
        break  
    sleep(0.01)
    `,
    options: [
        { text: "Stop and move backward", value: "A", correct: true },
        { text: "Keep moving forward", value: "B" },
        { text: "Turn right", value: "C" },
        { text: "Stop and wait", value: "D" }
    ],
    correctAnswer: "A",
    animation: {
        A: () => obstacleSequenceBackward(),
        B: () => obstacleSequenceForward(),
        C: () => obstacleSequenceTurnRight(),
        D: () => obstacleSequenceStop()
    },
    obstacles: { A: ['wall'], B: ['wall'], C: ['wall'], D: ['wall'] }
    },
    {
  question: `The robot detects an obstacle in front (distance 18 cm) and the following distances:
Left distance: 25 cm
Right distance: 30 cm.
What will the robot do based on the code logic?`,
  code: `
while True:
  my_servo.set_angle(90)  
  front = get_distance()
  if front < 20:  
    control_robot(0, 0, 0, 0, 0)  
    sleep(1)
    
    my_servo.set_angle(0)
    sleep(0.5)

    right = get_distance()
    my_servo.set_angle(180)
    sleep(0.5)

    left = get_distance()
    if left < right: 
        control_robot(0, 1, 1, 0, 32768)
        sleep(0.1)
    else:  
        control_robot(1, 0, 0, 1, 32768)  
        sleep(0.1)
    sleep(0.5)
  else:  
    control_robot(1, 0, 1, 0, 32768)  
    sleep(0.1)
  `,
    options: [
        { text: "The robot will turn left and move forward.", value: "A" },
        { text: "The robot will stop and move backward.", value: "B" },
        { text: "The robot will continue forward and ignore the side distances.", value: "C" },
        { text: "The robot will turn right and move forward.", value: "D", correct: true }
    ],
    correctAnswer: "D",
    animation: {
        A: () => simulateTurnLeftForward(),         // Turns left (away from left wall) and moves forward
        B: () => simulateStopMoveBack(),            // Stops, moves back from front wall
        C: () => simulateCrashForward(),            // Moves forward and crashes with front wall, add shake/crash effect
        D: () => simulateTurnRightForward()         // Turns right (toward right wall), moves forward, stops in front of right wall
    },
    obstacles: { A: ['front','left','right'], B: ['front','left','right'], C: ['front','left','right'], D: ['front','left','right'] }
    },
    {
    question: `The robot is powered on. Button A is pressed for 1 second, then Button C is pressed immediately after. According to the code, what will happen to the robot?`,
    code: `
while True:
A = rf_A.value() 
B = rf_B.value()  
C = rf_C.value()  
D = rf_D.value()  

if A == 1:  
    move_forward() 
elif B == 1: 
    turn_left()
elif C == 1:  
    turn_right()
elif D == 1: 
    move_backward()
else:
    stop_robot()

sleep(0.1)
    `,
    options: [
        { text: "The robot will move forward for 1 second, then turn right and stop.", value: "A", correct: true },
        { text: "The robot will move forward for 1 second, then turn left and stop.", value: "B" },
        { text: "The robot will move forward for 1 second, then move backward.", value: "C" },
        { text: "The robot will turn right and move forward.", value: "D" }
    ],
    correctAnswer: "A",
    animation: {
        A: () => animateForwardThenRightStop(),
        B: () => animateForwardThenLeftStop(),
        C: () => animateForwardThenBackward(),
        D: () => animateRightThenForward()
    },
    obstacles: { A: [], B: [], C: [], D: [] }
    }
];

function resetSimulation() {
    robot.style.transition = 'none';
    robot.style.transform = 'translate(0px, 0px) rotate(0deg)';
    obstacleWall.style.display = 'none';
    obstacleWall.style.opacity = '1';
}

function applyObstacles(option) {
  // Always hide all walls first
  if (document.getElementById('obstacle-wall')) {
    document.getElementById('obstacle-wall').style.display = 'none';
  }
  if (document.getElementById('wall-front')) {
    document.getElementById('wall-front').style.display = 'none';
  }
  if (document.getElementById('wall-left')) {
    document.getElementById('wall-left').style.display = 'none';
  }
  if (document.getElementById('wall-right')) {
    document.getElementById('wall-right').style.display = 'none';
  }

  // Then show only the appropriate wall(s) for the current question
  if (currentQuestionIndex === 2 && document.getElementById('obstacle-wall')) {
    document.getElementById('obstacle-wall').style.display = 'block';
  }
  if (currentQuestionIndex === 3) {
    if (document.getElementById('wall-front')) document.getElementById('wall-front').style.display = 'block';
    if (document.getElementById('wall-left'))  document.getElementById('wall-left').style.display = 'block';
    if (document.getElementById('wall-right')) document.getElementById('wall-right').style.display = 'block';
  }
}


// Simple robot moves
function moveForward() {
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(-120px)";
}

function moveBackward() {
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(120px)";
}

function turnLeft() {
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "rotate(-90deg)";
}

function turnRight() {
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "rotate(90deg)";
}

function stopRobot() {
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translate(0, 0) rotate(0deg)";
}

// Obstacle sequence animations for 3rd question

function obstacleSequenceBackward() {
    // 1. Move forward hitting obstacle
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(-50px)";
    setTimeout(() => {
    // simulate stop at obstacle
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translateY(-50px)";
    setTimeout(() => {
        // move backward
        robot.style.transition = 'transform 1.5s ease';
        robot.style.transform = "translateY(50px)";
    }, 500);
    }, 1000);
}

function obstacleSequenceForward() {
    // Move forward, hits obstacle, then moves forward again (simulate ignoring)
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(-50px)";
    setTimeout(() => {
    // slight pause at obstacle
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translateY(-50px)";
    setTimeout(() => {
        // move forward further
        robot.style.transition = 'transform 1.5s ease';
        robot.style.transform = "translateY(-220px)";
    }, 500);
    }, 1000);
}

function obstacleSequenceTurnRight() {
    // Move forward hitting obstacle, then stop, then turn right
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(-50px)";
    setTimeout(() => {
    // stop at obstacle
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translateY(-50px) rotate(0deg)";
    setTimeout(() => {
        // turn right
        robot.style.transition = 'transform 1s ease';
        robot.style.transform = "translateY(-50px) rotate(90deg)";
    }, 500);
    }, 1000);
}

function obstacleSequenceStop() {
    // Move forward hitting obstacle, then stop (no further movement)
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(-50px)";
    setTimeout(() => {
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translateY(-50px)";
    }, 1000);
}

function loadQuestion() {
  const question = questions[currentQuestionIndex];
  questionText.textContent = question.question;
  questionCode.textContent = question.code.trim();

  // Remove old option buttons
  optionsContainer.querySelectorAll("button.option").forEach(btn => btn.remove());

  // Add new option buttons
  question.options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option.text;
    button.classList.add("option");
    button.dataset.option = option.value;
    button.disabled = false;
    button.style.backgroundColor = '#4a90e2';
    button.addEventListener("click", () => handlePick(option));
    optionsContainer.insertBefore(button, optionsContainer.querySelector(".actions"));
  });

  feedback.textContent = "";
  feedback.style.color = "#2a9d8f";
  nextBtn.disabled = true;
  resetBtn.disabled = false;
  resetSimulation();
  // Hide remote by default
  document.getElementById('rf-remote-img').style.display = "none";

  // --- WALL CONTROL: Hide ALL walls first ---
  if (document.getElementById('obstacle-wall')) {
    document.getElementById('obstacle-wall').style.display = 'none';
  }
  if (document.getElementById('wall-front')) {
    document.getElementById('wall-front').style.display = 'none';
  }
  if (document.getElementById('wall-left')) {
    document.getElementById('wall-left').style.display = 'none';
  }
  if (document.getElementById('wall-right')) {
    document.getElementById('wall-right').style.display = 'none';
  }

  // --- WALL CONTROL: Show walls for current question ---
  if (currentQuestionIndex === 2 && document.getElementById('obstacle-wall')) { // Question 3
    document.getElementById('obstacle-wall').style.display = 'block';
  }
  if (currentQuestionIndex === 3) { // Question 4
    if (document.getElementById('wall-front')) document.getElementById('wall-front').style.display = 'block';
    if (document.getElementById('wall-left'))  document.getElementById('wall-left').style.display = 'block';
    if (document.getElementById('wall-right')) document.getElementById('wall-right').style.display = 'block';
  }
  if(currentQuestionIndex === 4) {
    document.getElementById('rf-remote-img').style.display = "block";
  }
}

function handlePick(selectedOption) {
    const question = questions[currentQuestionIndex];
    const selectedLetter = selectedOption.value;
    const correct = question.correctAnswer;
    const optionButtons = optionsContainer.querySelectorAll(".option");
    optionButtons.forEach(btn => btn.disabled = true);

    resetSimulation();
    applyObstacles(selectedLetter);

    setTimeout(() => {
    question.animation[selectedLetter]();

    setTimeout(() => {
        if (selectedLetter === correct) {
        feedback.style.color = "#2a9d8f";
        feedback.textContent = "🎉 Correct!";
        triggerConfetti();
        nextBtn.disabled = false;
        } else {
        feedback.style.color = "#e76f51";
        feedback.textContent = "❌ Incorrect!";
        nextBtn.disabled = true;
        }
    }, 2200); // Adjust delay to fit full obstacle sequences
    }, 50);
}

function nextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    loadQuestion();
}

function triggerConfetti() {
    confetti({
    particleCount: 150,
    spread: 150,
    origin: { y: 0.7 },
    colors: ['#e76f51', '#2a9d8f', '#264653', '#f4a261', '#e9c46a'],
    disableForReducedMotion: true
    });
}

function resetUI() {
  feedback.textContent = "";
  resetSimulation();
  const optionButtons = optionsContainer.querySelectorAll(".option");
  optionButtons.forEach(btn => {
    btn.disabled = false;
    btn.style.backgroundColor = '#4a90e2';
  });
  nextBtn.disabled = true;
  resetBtn.disabled = false;

  document.getElementById('rf-remote-img').style.display = "none";

  // --- WALL CONTROL: Hide ALL walls first ---
  if (document.getElementById('obstacle-wall')) {
    document.getElementById('obstacle-wall').style.display = 'none';
  }
  if (document.getElementById('wall-front')) {
    document.getElementById('wall-front').style.display = 'none';
  }
  if (document.getElementById('wall-left')) {
    document.getElementById('wall-left').style.display = 'none';
  }
  if (document.getElementById('wall-right')) {
    document.getElementById('wall-right').style.display = 'none';
  }

  // --- WALL CONTROL: Show walls for current question ---
  if (currentQuestionIndex === 2 && document.getElementById('obstacle-wall')) { // Question 3
    document.getElementById('obstacle-wall').style.display = 'block';
  }
  if (currentQuestionIndex === 3) { // Question 4
    if (document.getElementById('wall-front')) document.getElementById('wall-front').style.display = 'block';
    if (document.getElementById('wall-left'))  document.getElementById('wall-left').style.display = 'block';
    if (document.getElementById('wall-right')) document.getElementById('wall-right').style.display = 'block';
  }
  if(currentQuestionIndex === 4) {
    document.getElementById('rf-remote-img').style.display = "block";
  }
}

nextBtn.addEventListener("click", nextQuestion);
resetBtn.addEventListener("click", resetUI);

loadQuestion();

// for 4th question *********************************

function simulateTurnLeftForward() {
  // Robot turns left and moves forward avoiding left wall
  robot.style.transition = 'transform 1s ease';
  robot.style.transform = 'rotate(-90deg) translateY(-80px)';
  setTimeout(() => {
    robot.style.transition = 'transform 1s';
    robot.style.transform = 'rotate(-90deg) translateY(-100px)';
    showBlastEffect(95, 235);
  }, 1200);
}

function simulateStopMoveBack() {
  // Robot stops and moves back slightly
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'translateY(100px)';
}

function simulateCrashForward() {
  // Robot moves forward and then shake to simulate crash
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'translateY(-100px)';
  setTimeout(() => {
    robot.style.transition = 'transform 0.2s';
    robot.style.transform = 'translate(-5px, -100px)';
    showBlastEffect(265, 45);
    setTimeout(() => {
      robot.style.transform = 'translate(5px, -100px)';
      setTimeout(() => {
        robot.style.transform = 'translate(0px, -100px)';
      }, 100);
    }, 100);
  }, 1200);
}

function simulateTurnRightForward() {
  // Robot turns right and moves forward stopping next to right wall
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'rotate(90deg) translateY(-80px)';
  setTimeout(() => {
    robot.style.transition = 'transform 1s';
    robot.style.transform = 'rotate(90deg) translateY(-110px)';
  }, 1000);
}

function showBlastEffect(left, top) {
  const blast = document.getElementById('blast-effect');
  blast.style.left = left + "px";
  blast.style.top = top + "px";
  blast.style.display = "block";
  setTimeout(() => {
    blast.style.display = "none";
  }, 1300); // Hide after 1 second
}


// for 5th question *********************************
function animateForwardThenRightStop() {
  // Move forward for 1 second
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'translateY(-80px)';
  setTimeout(() => {
    // Turn right
    robot.style.transition = 'transform 0.8s';
    robot.style.transform = 'translateY(-80px) rotate(90deg)';
    setTimeout(() => {
      // Stop (reset transition, no movement)
      robot.style.transition = '';
    }, 800);
  }, 1000);
}

function animateForwardThenLeftStop() {
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'translateY(-80px)';
  setTimeout(() => {
    robot.style.transition = 'transform 0.8s';
    robot.style.transform = 'translateY(-80px) rotate(-90deg)';
    setTimeout(() => {
      robot.style.transition = '';
    }, 800);
  }, 1000);
}

function animateForwardThenBackward() {
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'translateY(-100px)';
  setTimeout(() => {
    robot.style.transition = 'transform 2s';
    robot.style.transform = 'translateY(100px)';
    setTimeout(() => {
      robot.style.transition = '';
    }, 1000);
  }, 1000);
}

function animateRightThenForward() {
  // Turn right
  robot.style.transition = 'transform 0.8s';
  robot.style.transform = 'rotate(90deg)';
  setTimeout(() => {
    // Move forward for 1s (from right-turned orientation)
    robot.style.transition = 'transform 1s';
    robot.style.transform = 'rotate(90deg) translateY(-80px)';
    setTimeout(() => {
      robot.style.transition = '';
    }, 1000);
  }, 800);
}
