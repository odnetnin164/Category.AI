// MongoDB initialization script for Category.AI
db = db.getSiblingDB('categoryai');

// Create collections
db.createCollection('decks');
db.createCollection('games');

// Insert initial deck data
db.decks.insertMany([
  {
    _id: "animals",
    emoji: "🐾",
    name: "Animals",
    description: "Guess the animal!",
    cards: [
      { id: 1, text: "Lion" },
      { id: 2, text: "Elephant" },
      { id: 3, text: "Giraffe" },
      { id: 4, text: "Zebra" },
      { id: 5, text: "Monkey" },
      { id: 6, text: "Tiger" },
      { id: 7, text: "Bear" },
      { id: 8, text: "Wolf" },
      { id: 9, text: "Fox" },
      { id: 10, text: "Rabbit" },
      { id: 11, text: "Deer" },
      { id: 12, text: "Penguin" },
      { id: 13, text: "Dolphin" },
      { id: 14, text: "Shark" },
      { id: 15, text: "Eagle" },
      { id: 16, text: "Owl" },
      { id: 17, text: "Parrot" },
      { id: 18, text: "Flamingo" },
      { id: 19, text: "Peacock" },
      { id: 20, text: "Swan" }
    ]
  },
  {
    _id: "movies",
    emoji: "🎬",
    name: "Movies",
    description: "Famous films and cinema!",
    cards: [
      { id: 1, text: "Titanic" },
      { id: 2, text: "Avatar" },
      { id: 3, text: "Star Wars" },
      { id: 4, text: "The Matrix" },
      { id: 5, text: "Jurassic Park" },
      { id: 6, text: "The Lion King" },
      { id: 7, text: "Frozen" },
      { id: 8, text: "Finding Nemo" },
      { id: 9, text: "Toy Story" },
      { id: 10, text: "Shrek" },
      { id: 11, text: "Harry Potter" },
      { id: 12, text: "Lord of the Rings" },
      { id: 13, text: "Pirates of the Caribbean" },
      { id: 14, text: "Indiana Jones" },
      { id: 15, text: "Back to the Future" },
      { id: 16, text: "The Godfather" },
      { id: 17, text: "Casablanca" },
      { id: 18, text: "Gone with the Wind" },
      { id: 19, text: "E.T." },
      { id: 20, text: "Jaws" }
    ]
  },
  {
    _id: "food",
    emoji: "🍕",
    name: "Food & Drinks",
    description: "Delicious foods from around the world!",
    cards: [
      { id: 1, text: "Pizza" },
      { id: 2, text: "Hamburger" },
      { id: 3, text: "Sushi" },
      { id: 4, text: "Tacos" },
      { id: 5, text: "Pasta" },
      { id: 6, text: "Ice Cream" },
      { id: 7, text: "Apple Pie" },
      { id: 8, text: "Chocolate Cake" },
      { id: 9, text: "French Fries" },
      { id: 10, text: "Hot Dog" },
      { id: 11, text: "Pancakes" },
      { id: 12, text: "Waffles" },
      { id: 13, text: "Donuts" },
      { id: 14, text: "Coffee" },
      { id: 15, text: "Tea" },
      { id: 16, text: "Orange Juice" },
      { id: 17, text: "Smoothie" },
      { id: 18, text: "Milkshake" },
      { id: 19, text: "Sandwich" },
      { id: 20, text: "Salad" }
    ]
  },
  {
    _id: "countries",
    emoji: "🌍",
    name: "Countries",
    description: "Nations and places around the world!",
    cards: [
      { id: 1, text: "United States" },
      { id: 2, text: "Canada" },
      { id: 3, text: "Mexico" },
      { id: 4, text: "Brazil" },
      { id: 5, text: "Argentina" },
      { id: 6, text: "United Kingdom" },
      { id: 7, text: "France" },
      { id: 8, text: "Germany" },
      { id: 9, text: "Italy" },
      { id: 10, text: "Spain" },
      { id: 11, text: "Russia" },
      { id: 12, text: "China" },
      { id: 13, text: "Japan" },
      { id: 14, text: "India" },
      { id: 15, text: "Australia" },
      { id: 16, text: "Egypt" },
      { id: 17, text: "South Africa" },
      { id: 18, text: "Nigeria" },
      { id: 19, text: "Kenya" },
      { id: 20, text: "Morocco" }
    ]
  },
  {
    _id: "fruits",
    emoji: "🍎",
    name: "Fruits",
    description: "Fresh and delicious fruits!",
    cards: [
      { id: 1, text: "Apple" },
      { id: 2, text: "Orange" },
      { id: 3, text: "Banana" },
      { id: 4, text: "Grape" },
      { id: 5, text: "Strawberry" },
      { id: 6, text: "Pineapple" },
      { id: 7, text: "Mango" },
      { id: 8, text: "Watermelon" },
      { id: 9, text: "Blueberry" },
      { id: 10, text: "Raspberry" },
      { id: 11, text: "Cherry" },
      { id: 12, text: "Peach" },
      { id: 13, text: "Pear" },
      { id: 14, text: "Kiwi" },
      { id: 15, text: "Papaya" },
      { id: 16, text: "Coconut" },
      { id: 17, text: "Lemon" },
      { id: 18, text: "Lime" },
      { id: 19, text: "Avocado" },
      { id: 20, text: "Pomegranate" }
    ]
  }
]);

print('Database initialized with sample deck data');