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
    }
];

function resetSimulation() {
    robot.style.transition = 'none';
    robot.style.transform = 'translate(0px, 0px) rotate(0deg)';
    obstacleWall.style.display = 'none';
    obstacleWall.style.opacity = '1';
}

function applyObstacles(option) {
    const obsList = questions[currentQuestionIndex].obstacles[option];
    if (obsList && obsList.length > 0) {
    obstacleWall.style.display = 'block';
    obstacleWall.style.opacity = '1';
    } else {
    obstacleWall.style.display = 'none';
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
    robot.style.transform = "translateY(-110px)";
    setTimeout(() => {
    // simulate stop at obstacle
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translateY(-110px)";
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
    robot.style.transform = "translateY(-110px)";
    setTimeout(() => {
    // slight pause at obstacle
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translateY(-110px)";
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
    robot.style.transform = "translateY(-110px)";
    setTimeout(() => {
    // stop at obstacle
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translateY(-110px) rotate(0deg)";
    setTimeout(() => {
        // turn right
        robot.style.transition = 'transform 1s ease';
        robot.style.transform = "translateY(-110px) rotate(90deg)";
    }, 500);
    }, 1000);
}

function obstacleSequenceStop() {
    // Move forward hitting obstacle, then stop (no further movement)
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(-110px)";
    setTimeout(() => {
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translateY(-110px)";
    }, 1000);
}

function loadQuestion() {
    const question = questions[currentQuestionIndex];
    questionText.textContent = question.question;
    questionCode.textContent = question.code.trim();

    optionsContainer.querySelectorAll("button.option").forEach(btn => btn.remove());

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
}

nextBtn.addEventListener("click", nextQuestion);
resetBtn.addEventListener("click", resetUI);

loadQuestion();
