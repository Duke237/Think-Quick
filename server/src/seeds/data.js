const QUESTIONS = [
  {
    questionId: 'TECH_001',
    text: 'Name a popular web browser',
    category: 'Technology',
    answers: [
      { text: 'Chrome', frequency: 65, points: 65, revealed: false },
      { text: 'Safari', frequency: 15, points: 15, revealed: false },
      { text: 'Firefox', frequency: 10, points: 10, revealed: false },
      { text: 'Edge', frequency: 7, points: 7, revealed: false },
      { text: 'Opera', frequency: 3, points: 3, revealed: false }
    ]
  },
  {
    questionId: 'TECH_002',
    text: 'Name a social media platform',
    category: 'Technology',
    answers: [
      { text: 'Facebook', frequency: 35, points: 35, revealed: false },
      { text: 'Instagram', frequency: 30, points: 30, revealed: false },
      { text: 'TikTok', frequency: 20, points: 20, revealed: false },
      { text: 'Twitter', frequency: 10, points: 10, revealed: false },
      { text: 'Snapchat', frequency: 5, points: 5, revealed: false }
    ]
  },
  {
    questionId: 'TECH_003',
    text: 'Name an operating system',
    category: 'Technology',
    answers: [
      { text: 'Windows', frequency: 50, points: 50, revealed: false },
      { text: 'macOS', frequency: 25, points: 25, revealed: false },
      { text: 'Linux', frequency: 12, points: 12, revealed: false },
      { text: 'Android', frequency: 10, points: 10, revealed: false },
      { text: 'iOS', frequency: 3, points: 3, revealed: false }
    ]
  },
  {
    questionId: 'TECH_004',
    text: 'Name a programming language',
    category: 'Technology',
    answers: [
      { text: 'Python', frequency: 40, points: 40, revealed: false },
      { text: 'JavaScript', frequency: 30, points: 30, revealed: false },
      { text: 'Java', frequency: 15, points: 15, revealed: false },
      { text: 'C++', frequency: 8, points: 8, revealed: false },
      { text: 'PHP', frequency: 7, points: 7, revealed: false }
    ]
  },
  {
    questionId: 'TECH_005',
    text: 'Name a video streaming service',
    category: 'Entertainment',
    answers: [
      { text: 'Netflix', frequency: 45, points: 45, revealed: false },
      { text: 'YouTube', frequency: 30, points: 30, revealed: false },
      { text: 'Disney Plus', frequency: 12, points: 12, revealed: false },
      { text: 'Hulu', frequency: 8, points: 8, revealed: false },
      { text: 'Amazon Prime', frequency: 5, points: 5, revealed: false }
    ]
  },
  {
    questionId: 'TECH_006',
    text: 'Name a smartphone brand',
    category: 'Technology',
    answers: [
      { text: 'Apple', frequency: 45, points: 45, revealed: false },
      { text: 'Samsung', frequency: 35, points: 35, revealed: false },
      { text: 'Huawei', frequency: 10, points: 10, revealed: false },
      { text: 'Xiaomi', frequency: 6, points: 6, revealed: false },
      { text: 'Google', frequency: 4, points: 4, revealed: false }
    ]
  },
  {
    questionId: 'TECH_007',
    text: 'Name a search engine',
    category: 'Technology',
    answers: [
      { text: 'Google', frequency: 75, points: 75, revealed: false },
      { text: 'Bing', frequency: 12, points: 12, revealed: false },
      { text: 'Yahoo', frequency: 8, points: 8, revealed: false },
      { text: 'DuckDuckGo', frequency: 3, points: 3, revealed: false },
      { text: 'Yandex', frequency: 2, points: 2, revealed: false }
    ]
  },
  {
    questionId: 'TECH_008',
    text: 'Name an email service',
    category: 'Technology',
    answers: [
      { text: 'Gmail', frequency: 60, points: 60, revealed: false },
      { text: 'Outlook', frequency: 20, points: 20, revealed: false },
      { text: 'Yahoo Mail', frequency: 12, points: 12, revealed: false },
      { text: 'ProtonMail', frequency: 5, points: 5, revealed: false },
      { text: 'iCloud Mail', frequency: 3, points: 3, revealed: false }
    ]
  },
  {
    questionId: 'TECH_009',
    text: 'Name a cloud storage service',
    category: 'Technology',
    answers: [
      { text: 'Google Drive', frequency: 40, points: 40, revealed: false },
      { text: 'Dropbox', frequency: 25, points: 25, revealed: false },
      { text: 'iCloud', frequency: 20, points: 20, revealed: false },
      { text: 'OneDrive', frequency: 12, points: 12, revealed: false },
      { text: 'Box', frequency: 3, points: 3, revealed: false }
    ]
  },
  {
    questionId: 'TECH_010',
    text: 'Name a messaging app',
    category: 'Technology',
    answers: [
      { text: 'WhatsApp', frequency: 45, points: 45, revealed: false },
      { text: 'Messenger', frequency: 25, points: 25, revealed: false },
      { text: 'Telegram', frequency: 15, points: 15, revealed: false },
      { text: 'Signal', frequency: 10, points: 10, revealed: false },
      { text: 'Discord', frequency: 5, points: 5, revealed: false }
    ]
  },
  {
    questionId: 'TECH_011',
    text: 'Name a video game console',
    category: 'Gaming',
    answers: [
      { text: 'PlayStation', frequency: 40, points: 40, revealed: false },
      { text: 'Xbox', frequency: 30, points: 30, revealed: false },
      { text: 'Nintendo Switch', frequency: 25, points: 25, revealed: false },
      { text: 'PC', frequency: 4, points: 4, revealed: false },
      { text: 'Steam Deck', frequency: 1, points: 1, revealed: false }
    ]
  },
  {
    questionId: 'TECH_012',
    text: 'Name a music streaming service',
    category: 'Entertainment',
    answers: [
      { text: 'Spotify', frequency: 50, points: 50, revealed: false },
      { text: 'Apple Music', frequency: 30, points: 30, revealed: false },
      { text: 'YouTube Music', frequency: 12, points: 12, revealed: false },
      { text: 'Amazon Music', frequency: 6, points: 6, revealed: false },
      { text: 'Tidal', frequency: 2, points: 2, revealed: false }
    ]
  },
  {
    questionId: 'TECH_013',
    text: 'Name a coding editor or IDE',
    category: 'Technology',
    answers: [
      { text: 'Visual Studio Code', frequency: 55, points: 55, revealed: false },
      { text: 'IntelliJ IDEA', frequency: 20, points: 20, revealed: false },
      { text: 'Sublime Text', frequency: 12, points: 12, revealed: false },
      { text: 'Atom', frequency: 8, points: 8, revealed: false },
      { text: 'Vim', frequency: 5, points: 5, revealed: false }
    ]
  },
  {
    questionId: 'TECH_014',
    text: 'Name a payment app',
    category: 'Technology',
    answers: [
      { text: 'PayPal', frequency: 40, points: 40, revealed: false },
      { text: 'Venmo', frequency: 25, points: 25, revealed: false },
      { text: 'Cash App', frequency: 20, points: 20, revealed: false },
      { text: 'Zelle', frequency: 10, points: 10, revealed: false },
      { text: 'Apple Pay', frequency: 5, points: 5, revealed: false }
    ]
  },
  {
    questionId: 'TECH_015',
    text: 'Name an online shopping website',
    category: 'Technology',
    answers: [
      { text: 'Amazon', frequency: 60, points: 60, revealed: false },
      { text: 'eBay', frequency: 20, points: 20, revealed: false },
      { text: 'Walmart', frequency: 10, points: 10, revealed: false },
      { text: 'Etsy', frequency: 7, points: 7, revealed: false },
      { text: 'AliExpress', frequency: 3, points: 3, revealed: false }
    ]
  },
  {
    questionId: 'GENERAL_001',
    text: 'Name a popular soft drink',
    category: 'General',
    answers: [
      { text: 'Coca Cola', frequency: 45, points: 45, revealed: false },
      { text: 'Pepsi', frequency: 30, points: 30, revealed: false },
      { text: 'Sprite', frequency: 12, points: 12, revealed: false },
      { text: 'Fanta', frequency: 8, points: 8, revealed: false },
      { text: '7UP', frequency: 5, points: 5, revealed: false }
    ]
  },
  {
    questionId: 'GENERAL_002',
    text: 'Name a fast food restaurant',
    category: 'General',
    answers: [
      { text: 'McDonalds', frequency: 50, points: 50, revealed: false },
      { text: 'KFC', frequency: 20, points: 20, revealed: false },
      { text: 'Burger King', frequency: 15, points: 15, revealed: false },
      { text: 'Subway', frequency: 10, points: 10, revealed: false },
      { text: 'Pizza Hut', frequency: 5, points: 5, revealed: false }
    ]
  },
  {
    questionId: 'GENERAL_003',
    text: 'Name a popular car brand',
    category: 'General',
    answers: [
      { text: 'Toyota', frequency: 35, points: 35, revealed: false },
      { text: 'Honda', frequency: 25, points: 25, revealed: false },
      { text: 'Ford', frequency: 20, points: 20, revealed: false },
      { text: 'BMW', frequency: 12, points: 12, revealed: false },
      { text: 'Tesla', frequency: 8, points: 8, revealed: false }
    ]
  },
  {
    questionId: 'GENERAL_004',
    text: 'Name a popular sport',
    category: 'General',
    answers: [
      { text: 'Football', frequency: 40, points: 40, revealed: false },
      { text: 'Basketball', frequency: 30, points: 30, revealed: false },
      { text: 'Soccer', frequency: 20, points: 20, revealed: false },
      { text: 'Tennis', frequency: 7, points: 7, revealed: false },
      { text: 'Baseball', frequency: 3, points: 3, revealed: false }
    ]
  },
  {
    questionId: 'GENERAL_005',
    text: 'Name a coffee chain',
    category: 'General',
    answers: [
      { text: 'Starbucks', frequency: 70, points: 70, revealed: false },
      { text: 'Dunkin', frequency: 15, points: 15, revealed: false },
      { text: 'Costa Coffee', frequency: 8, points: 8, revealed: false },
      { text: 'Tim Hortons', frequency: 5, points: 5, revealed: false },
      { text: 'Peets Coffee', frequency: 2, points: 2, revealed: false }
    ]
  }
];

module.exports = { QUESTIONS };