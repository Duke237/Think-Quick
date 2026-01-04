import Question from '../models/Question.js';

export const getRandomQuestion = async (req, res) => {
  try {
    const questions = await Question.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 1 } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions available' });
    }

    res.json({
      success: true,
      question: questions[0]
    });
  } catch (error) {
    console.error('❌ Get random question error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { question, answers, category, difficulty } = req.body;

    const newQuestion = new Question({
      question,
      answers,
      category,
      difficulty
    });

    await newQuestion.save();

    console.log('✅ Question created:', question);

    res.status(201).json({
      success: true,
      question: newQuestion
    });
  } catch (error) {
    console.error('❌ Create question error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const seedQuestions = async (req, res) => {
  try {
    // Check if questions already exist
    const count = await Question.countDocuments();
    if (count > 0) {
      return res.json({ 
        success: true, 
        message: 'Questions already seeded',
        count 
      });
    }

    const techQuestions = [
      {
        question: "Name a popular programming language",
        category: "Programming",
        difficulty: "easy",
        answers: [
          { text: "Python", frequency: 32 },
          { text: "JavaScript", frequency: 28 },
          { text: "Java", frequency: 20 },
          { text: "C++", frequency: 12 },
          { text: "Ruby", frequency: 5 },
          { text: "PHP", frequency: 3 }
        ]
      },
      {
        question: "Name a version control system",
        category: "DevOps",
        difficulty: "medium",
        answers: [
          { text: "Git", frequency: 65 },
          { text: "SVN", frequency: 18 },
          { text: "Mercurial", frequency: 10 },
          { text: "Perforce", frequency: 5 },
          { text: "CVS", frequency: 2 }
        ]
      },
      {
        question: "Name a cloud computing platform",
        category: "Cloud",
        difficulty: "easy",
        answers: [
          { text: "AWS", frequency: 40 },
          { text: "Azure", frequency: 30 },
          { text: "Google Cloud", frequency: 20 },
          { text: "DigitalOcean", frequency: 6 },
          { text: "Heroku", frequency: 4 }
        ]
      },
      {
        question: "Name a JavaScript framework",
        category: "Frameworks",
        difficulty: "medium",
        answers: [
          { text: "React", frequency: 38 },
          { text: "Vue", frequency: 22 },
          { text: "Angular", frequency: 20 },
          { text: "Svelte", frequency: 12 },
          { text: "Next.js", frequency: 8 }
        ]
      },
      {
        question: "Name a NoSQL database",
        category: "Databases",
        difficulty: "medium",
        answers: [
          { text: "MongoDB", frequency: 45 },
          { text: "Redis", frequency: 25 },
          { text: "Cassandra", frequency: 15 },
          { text: "DynamoDB", frequency: 10 },
          { text: "CouchDB", frequency: 5 }
        ]
      }
    ];

    await Question.insertMany(techQuestions);

    console.log('✅ Questions seeded successfully');

    res.json({
      success: true,
      message: 'Questions seeded successfully',
      count: techQuestions.length
    });
  } catch (error) {
    console.error('❌ Seed questions error:', error);
    res.status(500).json({ error: error.message });
  }
};