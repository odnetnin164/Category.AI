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
      { id: 1, text: "Lion", info: "King of the jungle with a magnificent mane!" },
      { id: 2, text: "Elephant", info: "Largest land mammal with incredible memory" },
      { id: 3, text: "Giraffe", info: "Tallest animal in the world with a 6-foot tongue" },
      { id: 4, text: "Zebra", info: "Each zebra has a unique stripe pattern like fingerprints" },
      { id: 5, text: "Monkey", info: "Intelligent primates that use tools and live in social groups" },
      { id: 6, text: "Tiger", info: "Solitary big cat with night vision 6x better than humans" },
      { id: 7, text: "Bear", info: "Powerful omnivores that can run up to 35 mph" },
      { id: 8, text: "Wolf", info: "Pack hunters with incredible stamina and loyalty" },
      { id: 9, text: "Fox", info: "Clever canines known for their cunning and adaptability" },
      { id: 10, text: "Rabbit", info: "Fast hoppers with 360-degree vision to spot predators" },
      { id: 11, text: "Deer", info: "Graceful herbivores that can leap 10 feet high" },
      { id: 12, text: "Penguin", info: "Flightless birds that are expert swimmers in icy waters" },
      { id: 13, text: "Dolphin", info: "Highly intelligent marine mammals that use echolocation" },
      { id: 14, text: "Shark", info: "Ancient predators with multiple rows of replaceable teeth" },
      { id: 15, text: "Eagle", info: "Majestic birds of prey with eyesight 8x sharper than humans" },
      { id: 16, text: "Owl", info: "Silent nocturnal hunters with asymmetrical ears" },
      { id: 17, text: "Parrot", info: "Colorful birds that can mimic human speech and live 100+ years" },
      { id: 18, text: "Flamingo", info: "Pink birds that get their color from eating shrimp and algae" },
      { id: 19, text: "Peacock", info: "Male birds with spectacular tail feathers to attract mates" },
      { id: 20, text: "Swan", info: "Elegant water birds that mate for life" }
    ]
  },
  {
    _id: "movies",
    emoji: "🎬",
    name: "Movies",
    description: "Famous films and cinema!",
    cards: [
      { id: 1, text: "Titanic", info: "Epic romance disaster film that won 11 Academy Awards" },
      { id: 2, text: "Avatar", info: "Groundbreaking sci-fi film with revolutionary 3D technology" },
      { id: 3, text: "Star Wars", info: "Space opera that launched a cultural phenomenon" },
      { id: 4, text: "The Matrix", info: "Mind-bending cyberpunk film that redefined action cinema" },
      { id: 5, text: "Jurassic Park", info: "Dinosaur thriller that pioneered CGI effects" },
      { id: 6, text: "The Lion King", info: "Disney's animated masterpiece about a young lion's journey" },
      { id: 7, text: "Frozen", info: "Musical about sisterly love that became a global phenomenon" },
      { id: 8, text: "Finding Nemo", info: "Pixar's underwater adventure about a lost clownfish" },
      { id: 9, text: "Toy Story", info: "First fully computer-animated feature film" },
      { id: 10, text: "Shrek", info: "Animated comedy that parodied classic fairy tales" },
      { id: 11, text: "Harry Potter", info: "Magical film series about a young wizard's adventures" },
      { id: 12, text: "Lord of the Rings", info: "Epic fantasy trilogy filmed in New Zealand" },
      { id: 13, text: "Pirates of the Caribbean", info: "Swashbuckling adventure based on a Disney theme park ride" },
      { id: 14, text: "Indiana Jones", info: "Action-adventure series about a daring archaeologist" },
      { id: 15, text: "Back to the Future", info: "Time-travel comedy that predicted many future technologies" },
      { id: 16, text: "The Godfather", info: "Crime drama considered one of the greatest films ever made" },
      { id: 17, text: "Casablanca", info: "Classic romance set during World War II" },
      { id: 18, text: "Gone with the Wind", info: "Civil War epic that was the highest-grossing film for decades" },
      { id: 19, text: "E.T.", info: "Heartwarming story about a boy befriending an alien" },
      { id: 20, text: "Jaws", info: "Thriller that made people afraid to go in the water" }, 
      { id: 21, text: "John Wick" }
    ]
  },
  {
    _id: "food",
    emoji: "🍕",
    name: "Food & Drinks",
    description: "Delicious foods from around the world!",
    cards: [
      { id: 1, text: "Pizza", info: "Italian dish that's become the world's favorite comfort food" },
      { id: 2, text: "Hamburger", info: "America's iconic sandwich served billions of times daily" },
      { id: 3, text: "Sushi", info: "Japanese art of fresh fish and rice perfected over centuries" },
      { id: 4, text: "Tacos", info: "Mexican street food with endless filling possibilities" },
      { id: 5, text: "Pasta", info: "Italian staple food made from wheat and water" },
      { id: 6, text: "Ice Cream", info: "Frozen dessert that brings joy to people of all ages" },
      { id: 7, text: "Apple Pie", info: "Classic American dessert often served with vanilla ice cream" },
      { id: 8, text: "Chocolate Cake", info: "Rich dessert that's perfect for celebrations and special occasions" },
      { id: 9, text: "French Fries", info: "Crispy potato sticks that pair perfectly with almost anything" },
      { id: 10, text: "Hot Dog", info: "Stadium favorite and backyard BBQ staple" },
      { id: 11, text: "Pancakes", info: "Fluffy breakfast treat often topped with syrup and butter" },
      { id: 12, text: "Waffles", info: "Grid-patterned breakfast food perfect for holding syrup" },
      { id: 13, text: "Donuts", info: "Sweet fried dough rings that pair perfectly with coffee" },
      { id: 14, text: "Coffee", info: "Caffeinated beverage that fuels billions of people daily" },
      { id: 15, text: "Tea", info: "Ancient beverage with thousands of varieties and health benefits" },
      { id: 16, text: "Orange Juice", info: "Vitamin C-rich breakfast drink squeezed from fresh oranges" },
      { id: 17, text: "Smoothie", info: "Blended fruit drink that's both nutritious and delicious" },
      { id: 18, text: "Milkshake", info: "Creamy blended treat often made with ice cream and milk" }
    ]
  },
  {
    _id: "countries",
    emoji: "🌍",
    name: "Countries",
    description: "Nations and places around the world!",
    cards: [
      { id: 1, text: "United States", info: "Land of the free with 50 states and diverse landscapes" },
      { id: 2, text: "Canada", info: "Known for maple syrup, hockey, and saying 'eh' a lot" },
      { id: 3, text: "Mexico", info: "Home to ancient Mayan ruins and delicious spicy cuisine" },
      { id: 4, text: "Brazil", info: "Largest country in South America famous for carnival and soccer" },
      { id: 5, text: "Argentina", info: "Land of tango, beef, and the stunning Patagonia region" },
      { id: 6, text: "United Kingdom", info: "Island nation famous for tea, royal family, and Big Ben" },
      { id: 7, text: "France", info: "Country of romance, wine, and the iconic Eiffel Tower" },
      { id: 8, text: "Germany", info: "European powerhouse known for beer, cars, and castles" },
      { id: 9, text: "Italy", info: "Boot-shaped country famous for pasta, pizza, and art" },
      { id: 10, text: "Spain", info: "Home to flamenco dancing, bullfighting, and beautiful beaches" },
      { id: 11, text: "Russia", info: "World's largest country spanning 11 time zones" },
      { id: 12, text: "China", info: "Most populous country with the Great Wall and pandas" },
      { id: 13, text: "Japan", info: "Island nation blending ancient traditions with modern technology" }
    ]
  },
  {
    _id: "fruits",
    emoji: "🍎",
    name: "Fruits",
    description: "Fresh and delicious fruits!",
    cards: [
      { id: 1, text: "Apple", info: "An apple a day keeps the doctor away!" },
      { id: 2, text: "Orange", info: "Packed with vitamin C and perfect for fresh juice" },
      { id: 3, text: "Banana", info: "Yellow curved fruit rich in potassium and energy" },
      { id: 4, text: "Grape", info: "Small round fruits that grow in clusters on vines" },
      { id: 5, text: "Strawberry", info: "Heart-shaped berry with seeds on the outside" },
      { id: 6, text: "Pineapple", info: "Tropical fruit with a spiky exterior and sweet interior" },
      { id: 7, text: "Mango", info: "King of fruits with creamy texture and tropical flavor" },
      { id: 8, text: "Watermelon", info: "Summer favorite that's 92% water and super refreshing" },
      { id: 9, text: "Blueberry", info: "Tiny superfood packed with antioxidants and flavor" },
      { id: 10, text: "Raspberry", info: "Delicate red berry perfect for desserts and jams" },
      { id: 11, text: "Cherry", info: "Sweet or tart fruit that grows on beautiful flowering trees" },
      { id: 12, text: "Peach", info: "Fuzzy skin fruit with a large pit and sweet flesh" },
      { id: 13, text: "Pear", info: "Bell-shaped fruit that ripens from the inside out" },
      { id: 14, text: "Kiwi", info: "Brown fuzzy fruit with bright green flesh and tiny black seeds" },
      { id: 15, text: "Papaya", info: "Tropical orange fruit rich in enzymes and vitamins" },
      { id: 16, text: "Coconut", info: "Versatile tropical fruit that provides water, milk, and meat" },
      { id: 17, text: "Lemon", info: "Sour yellow citrus perfect for adding zest to dishes" },
      { id: 18, text: "Lime", info: "Small green citrus essential for many cocktails and dishes" },
      { id: 19, text: "Avocado", info: "Creamy green fruit technically a berry, perfect for toast" },
      { id: 20, text: "Pomegranate", info: "Ancient fruit filled with ruby-red seeds called arils" }
    ]
  },
  {
    _id: "oscar2024",
    emoji: "🏆",
    name: "2024 Oscar Winners",
    description: "Academy Award winners from the 96th ceremony!",
    cards: [
      { id: 1, text: "Oppenheimer", info: "Best Picture - Christopher Nolan's biographical thriller about the atomic bomb creator" },
      { id: 2, text: "Cillian Murphy", info: "Best Actor - Portrayed J. Robert Oppenheimer in the title role" },
      { id: 3, text: "Emma Stone", info: "Best Actress - Won for 'Poor Things' as Bella Baxter" },
      { id: 4, text: "Robert Downey Jr.", info: "Best Supporting Actor - Won for 'Oppenheimer' as Lewis Strauss" },
      { id: 5, text: "Da'Vine Joy Randolph", info: "Best Supporting Actress - Won for 'The Holdovers' as Mary Lamb" },
      { id: 6, text: "Christopher Nolan", info: "Best Director - Finally won his first Oscar for 'Oppenheimer'" },
      { id: 7, text: "Poor Things", info: "Best Production Design - Surreal Victorian-era fantasy world" },
      { id: 8, text: "The Zone of Interest", info: "Best International Feature - Haunting Holocaust drama from the UK" },
      { id: 9, text: "American Fiction", info: "Best Adapted Screenplay - Satirical comedy-drama about identity" },
      { id: 10, text: "Anatomy of a Fall", info: "Best Original Screenplay - French courtroom drama thriller" },
      { id: 11, text: "The Boy and the Heron", info: "Best Animated Feature - Hayao Miyazaki's return to directing" },
      { id: 12, text: "20 Days in Mariupol", info: "Best Documentary Feature - Ukrainian war documentary" },
      { id: 13, text: "War Is Over!", info: "Best Animated Short - Anti-war message through child's perspective" },
      { id: 14, text: "The Wonderful Story of Henry Sugar", info: "Best Live Action Short - Wes Anderson's Roald Dahl adaptation" },
      { id: 15, text: "What Was I Made For?", info: "Best Original Song - Billie Eilish's ballad from 'Barbie'" }
    ]
  }
]);

print('Database initialized with sample deck data');