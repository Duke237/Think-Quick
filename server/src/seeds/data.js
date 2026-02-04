// Tech-focused survey questions for Think Quick
// Each answer's frequency represents how many people out of 100 gave that answer

const techQuestions = [
  {
    questionId: 'TECH_001',
    text: 'Name a programming language',
    category: 'Technology',
    difficulty: 'easy',
    sampleSize: 100,
    answers: [
      { text: 'JavaScript', frequency: 28 },
      { text: 'Python', frequency: 25 },
      { text: 'Java', frequency: 18 },
      { text: 'C++', frequency: 12 },
      { text: 'C#', frequency: 8 },
      { text: 'PHP', frequency: 5 },
      { text: 'Ruby', frequency: 4 }
    ]
  },
  {
    questionId: 'TECH_002',
    text: 'Name a social media platform',
    category: 'Technology',
    difficulty: 'easy',
    sampleSize: 100,
    answers: [
      { text: 'Facebook', frequency: 30 },
      { text: 'Instagram', frequency: 25 },
      { text: 'Twitter', frequency: 18 },
      { text: 'TikTok', frequency: 15 },
      { text: 'LinkedIn', frequency: 7 },
      { text: 'Snapchat', frequency: 5 }
    ]
  },
  {
    questionId: 'TECH_003',
    text: 'Name a web browser',
    category: 'Technology',
    difficulty: 'easy',
    sampleSize: 100,
    answers: [
      { text: 'Chrome', frequency: 45 },
      { text: 'Firefox', frequency: 20 },
      { text: 'Safari', frequency: 15 },
      { text: 'Edge', frequency: 12 },
      { text: 'Opera', frequency: 5 },
      { text: 'Brave', frequency: 3 }
    ]
  },
  {
    questionId: 'TECH_004',
    text: 'Name an operating system',
    category: 'Technology',
    difficulty: 'easy',
    sampleSize: 100,
    answers: [
      { text: 'Windows', frequency: 42 },
      { text: 'macOS', frequency: 25 },
      { text: 'Linux', frequency: 15 },
      { text: 'Android', frequency: 10 },
      { text: 'iOS', frequency: 8 }
    ]
  },
  {
    questionId: 'TECH_005',
    text: 'Name a cloud storage service',
    category: 'Technology',
    difficulty: 'medium',
    sampleSize: 100,
    answers: [
      { text: 'Google Drive', frequency: 35 },
      { text: 'Dropbox', frequency: 25 },
      { text: 'iCloud', frequency: 20 },
      { text: 'OneDrive', frequency: 15 },
      { text: 'Box', frequency: 5 }
    ]
  },
  {
    questionId: 'TECH_006',
    text: 'Name a streaming service',
    category: 'Entertainment',
    difficulty: 'easy',
    sampleSize: 100,
    answers: [
      { text: 'Netflix', frequency: 35 },
      { text: 'YouTube', frequency: 28 },
      { text: 'Disney+', frequency: 15 },
      { text: 'Hulu', frequency: 10 },
      { text: 'Amazon Prime', frequency: 8 },
      { text: 'HBO Max', frequency: 4 }
    ]
  },
  {
    questionId: 'TECH_007',
    text: 'Name a tech company',
    category: 'Technology',
    difficulty: 'easy',
    sampleSize: 100,
    answers: [
      { text: 'Apple', frequency: 28 },
      { text: 'Google', frequency: 25 },
      { text: 'Microsoft', frequency: 20 },
      { text: 'Amazon', frequency: 12 },
      { text: 'Meta', frequency: 8 },
      { text: 'Samsung', frequency: 7 }
    ]
  },
  {
    questionId: 'TECH_008',
    text: 'Name a video game console',
    category: 'Gaming',
    difficulty: 'easy',
    sampleSize: 100,
    answers: [
      { text: 'PlayStation', frequency: 38 },
      { text: 'Xbox', frequency: 30 },
      { text: 'Nintendo Switch', frequency: 25 },
      { text: 'PC', frequency: 7 }
    ]
  },
  {
    questionId: 'TECH_009',
    text: 'Name a database system',
    category: 'Technology',
    difficulty: 'medium',
    sampleSize: 100,
    answers: [
      { text: 'MySQL', frequency: 30 },
      { text: 'MongoDB', frequency: 22 },
      { text: 'PostgreSQL', frequency: 18 },
      { text: 'Oracle', frequency: 12 },
      { text: 'SQL Server', frequency: 10 },
      { text: 'Redis', frequency: 8 }
    ]
  },
  {
    questionId: 'TECH_010',
    text: 'Name a code editor or IDE',
    category: 'Technology',
    difficulty: 'medium',
    sampleSize: 100,
    answers: [
      { text: 'Visual Studio Code', frequency: 45 },
      { text: 'IntelliJ IDEA', frequency: 18 },
      { text: 'Sublime Text', frequency: 12 },
      { text: 'Vim', frequency: 10 },
      { text: 'Atom', frequency: 8 },
      { text: 'Notepad++', frequency: 7 }
    ]
  },
  {
    questionId: 'TECH_011',
    text: 'Name a JavaScript framework or library',
    category: 'Technology',
    difficulty: 'medium',
    sampleSize: 100,
    answers: [
      { text: 'React', frequency: 40 },
      { text: 'Vue', frequency: 22 },
      { text: 'Angular', frequency: 18 },
      { text: 'jQuery', frequency: 10 },
      { text: 'Svelte', frequency: 6 },
      { text: 'Next.js', frequency: 4 }
    ]
  },
  {
    questionId: 'TECH_012',
    text: 'Name a version control system',
    category: 'Technology',
    difficulty: 'hard',
    sampleSize: 100,
    answers: [
      { text: 'Git', frequency: 75 },
      { text: 'SVN', frequency: 12 },
      { text: 'Mercurial', frequency: 8 },
      { text: 'Perforce', frequency: 5 }
    ]
  },
  {
    questionId: 'TECH_013',
    text: 'Name a smartphone brand',
    category: 'Technology',
    difficulty: 'easy',
    sampleSize: 100,
    answers: [
      { text: 'Apple', frequency: 35 },
      { text: 'Samsung', frequency: 32 },
      { text: 'Huawei', frequency: 12 },
      { text: 'Xiaomi', frequency: 10 },
      { text: 'Google', frequency: 6 },
      { text: 'OnePlus', frequency: 5 }
    ]
  },
  {
    questionId: 'TECH_014',
    text: 'Name a cybersecurity threat',
    category: 'Technology',
    difficulty: 'medium',
    sampleSize: 100,
    answers: [
      { text: 'Virus', frequency: 28 },
      { text: 'Malware', frequency: 25 },
      { text: 'Phishing', frequency: 20 },
      { text: 'Ransomware', frequency: 15 },
      { text: 'Hacking', frequency: 12 }
    ]
  },
  {
    questionId: 'TECH_015',
    text: 'Name a project management tool',
    category: 'Technology',
    difficulty: 'medium',
    sampleSize: 100,
    answers: [
      { text: 'Jira', frequency: 30 },
      { text: 'Trello', frequency: 28 },
      { text: 'Asana', frequency: 20 },
      { text: 'Monday.com', frequency: 12 },
      { text: 'Notion', frequency: 10 }
    ]
  }
];

// Fast Money Questions - 5 quick questions for final round
const fastMoneyQuestions = [
  {
    questionId: 'FM_001',
    text: 'Name a file extension',
    category: 'Technology',
    difficulty: 'easy',
    sampleSize: 100,
    isFastMoney: true,
    answers: [
      { text: '.pdf', frequency: 30 },
      { text: '.jpg', frequency: 25 },
      { text: '.txt', frequency: 18 },
      { text: '.doc', frequency: 15 },
      { text: '.zip', frequency: 12 }
    ]
  },
  {
    questionId: 'FM_002',
    text: 'Name something you do on a computer',
    category: 'General',
    difficulty: 'easy',
    sampleSize: 100,
    isFastMoney: true,
    answers: [
      { text: 'Browse the internet', frequency: 35 },
      { text: 'Email', frequency: 25 },
      { text: 'Watch videos', frequency: 20 },
      { text: 'Play games', frequency: 12 },
      { text: 'Work', frequency: 8 }
    ]
  },
  {
    questionId: 'FM_003',
    text: 'Name a computer key',
    category: 'Technology',
    difficulty: 'easy',
    sampleSize: 100,
    isFastMoney: true,
    answers: [
      { text: 'Enter', frequency: 32 },
      { text: 'Space', frequency: 28 },
      { text: 'Shift', frequency: 18 },
      { text: 'Control', frequency: 12 },
      { text: 'Delete', frequency: 10 }
    ]
  },
  {
    questionId: 'FM_004',
    text: 'Name a tech acronym',
    category: 'Technology',
    difficulty: 'medium',
    sampleSize: 100,
    isFastMoney: true,
    answers: [
      { text: 'CPU', frequency: 25 },
      { text: 'GPU', frequency: 22 },
      { text: 'RAM', frequency: 20 },
      { text: 'USB', frequency: 18 },
      { text: 'WiFi', frequency: 15 }
    ]
  },
  {
    questionId: 'FM_005',
    text: 'Name a popular website',
    category: 'Technology',
    difficulty: 'easy',
    sampleSize: 100,
    isFastMoney: true,
    answers: [
      { text: 'Google', frequency: 40 },
      { text: 'YouTube', frequency: 25 },
      { text: 'Facebook', frequency: 18 },
      { text: 'Amazon', frequency: 10 },
      { text: 'Wikipedia', frequency: 7 }
    ]
  }
];

// Combine all questions
const allQuestions = [...techQuestions, ...fastMoneyQuestions];

module.exports = {
  techQuestions,
  fastMoneyQuestions,
  allQuestions
};