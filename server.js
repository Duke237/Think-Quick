const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Game state
let gameState = {
    currentRound: 0,
    questions: [
        {
            type: "Survey",
            question: "Best late-night snack",
            answers: [
                { text: "Pizza", points: 34 },
                { text: "Chips", points: 28 },
                { text: "Ice Cream", points: 22 }
            ]
        },
        {
            type: "Trivia",
            question: "Morning ritual",
            answers: [
                { text: "Coffee", points: 45 },
                { text: "Shower", points: 30 },
                { text: "Exercise", points: 25 }
            ]
        }
    ]
};

app.get('/api/game/state', (req, res) => {
    res.json({
        currentRound: gameState.currentRound,
        question: gameState.questions[gameState.currentRound]
    });
});

app.post('/api/game/answer', express.json(), (req, res) => {
    const { answerIndex } = req.body;
    const currentQuestion = gameState.questions[gameState.currentRound];
    const answer = currentQuestion.answers[answerIndex];
    
    res.json({
        points: answer.points,
        correct: true,
        totalPoints: answer.points
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});