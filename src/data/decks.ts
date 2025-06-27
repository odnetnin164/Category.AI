import { Deck } from '../types';

export const decks: Deck[] = [
  {
    id: 'animals',
    name: 'Animals',
    description: 'All kinds of animals from around the world',
    emoji: '🐾',
    cards: [
      { id: '1', text: 'Elephant', info: 'Largest land mammal with incredible memory' },
      { id: '2', text: 'Giraffe', info: 'Tallest animal in the world with a 6-foot tongue' },
      { id: '3', text: 'Penguin', info: 'Flightless birds that are expert swimmers in icy waters' },
      { id: '4', text: 'Tiger', info: 'Solitary big cat with night vision 6x better than humans' },
      { id: '5', text: 'Dolphin', info: 'Highly intelligent marine mammals that use echolocation' },
      { id: '6', text: 'Kangaroo', info: 'Marsupials that carry babies in pouches and hop on powerful legs' },
      { id: '7', text: 'Lion', info: 'King of the jungle with a magnificent mane!' },
      { id: '8', text: 'Monkey', info: 'Intelligent primates that use tools and live in social groups' },
      { id: '9', text: 'Zebra', info: 'Each zebra has a unique stripe pattern like fingerprints' },
      { id: '10', text: 'Bear', info: 'Powerful omnivores that can run up to 35 mph' },
      { id: '11', text: 'Whale', info: 'Largest animals on Earth that communicate through songs' },
      { id: '12', text: 'Rabbit', info: 'Fast hoppers with 360-degree vision to spot predators' },
      { id: '13', text: 'Fox', info: 'Clever canines known for their cunning and adaptability' },
      { id: '14', text: 'Owl', info: 'Silent nocturnal hunters with asymmetrical ears' },
      { id: '15', text: 'Shark', info: 'Ancient predators with multiple rows of replaceable teeth' }
    ]
  },
  {
    id: 'movies',
    name: 'Movies',
    description: 'Popular movies and films',
    emoji: '🎬',
    cards: [
      { id: '1', text: 'The Lion King', info: "Disney's animated masterpiece about a young lion's journey" },
      { id: '2', text: 'Star Wars', info: 'Space opera that launched a cultural phenomenon' },
      { id: '3', text: 'Harry Potter', info: 'Magical film series about a young wizard\'s adventures' },
      { id: '4', text: 'Avatar', info: 'Groundbreaking sci-fi film with revolutionary 3D technology' },
      { id: '5', text: 'Titanic', info: 'Epic romance disaster film that won 11 Academy Awards' },
      { id: '6', text: 'Frozen', info: 'Musical about sisterly love that became a global phenomenon' },
      { id: '7', text: 'Spider-Man', info: 'Web-slinging superhero who fights crime in New York City' },
      { id: '8', text: 'Batman', info: 'Dark Knight who protects Gotham City from villains' },
      { id: '9', text: 'Jurassic Park', info: 'Dinosaur thriller that pioneered CGI effects' },
      { id: '10', text: 'The Avengers', info: 'Superhero team-up film that broke box office records' },
      { id: '11', text: 'Finding Nemo', info: "Pixar's underwater adventure about a lost clownfish" },
      { id: '12', text: 'Shrek', info: 'Animated comedy that parodied classic fairy tales' },
      { id: '13', text: 'Toy Story', info: 'First fully computer-animated feature film' },
      { id: '14', text: 'Pirates of the Caribbean', info: 'Swashbuckling adventure based on a Disney theme park ride' },
      { id: '15', text: 'The Matrix', info: 'Mind-bending cyberpunk film that redefined action cinema' }
    ]
  },
  {
    id: 'celebrities',
    name: 'Celebrities',
    description: 'Famous people and celebrities',
    emoji: '⭐',
    cards: [
      { id: '1', text: 'Taylor Swift', info: 'Pop superstar known for catchy songs and storytelling lyrics' },
      { id: '2', text: 'Leonardo DiCaprio', info: 'Academy Award-winning actor and environmental activist' },
      { id: '3', text: 'Oprah Winfrey', info: 'Media mogul and talk show queen who inspires millions' },
      { id: '4', text: 'Will Smith', info: 'Charismatic actor who went from rapper to Hollywood A-lister' },
      { id: '5', text: 'Jennifer Lawrence', info: 'Oscar-winning actress known for relatable personality' },
      { id: '6', text: 'Dwayne Johnson', info: 'Former wrestler turned action movie star known as The Rock' },
      { id: '7', text: 'Emma Stone', info: 'Talented actress with distinctive voice and comedic timing' },
      { id: '8', text: 'Chris Hemsworth', info: 'Australian actor famous for playing Thor in Marvel movies' },
      { id: '9', text: 'Scarlett Johansson', info: 'Versatile actress known for both indie films and blockbusters' },
      { id: '10', text: 'Ryan Reynolds', info: 'Canadian actor known for wit and playing Deadpool' },
      { id: '11', text: 'Beyoncé', info: 'Queen B - one of the most influential singers of all time' },
      { id: '12', text: 'Tom Hanks', info: 'Beloved actor known as America\'s dad for his wholesome roles' },
      { id: '13', text: 'Angelina Jolie', info: 'Oscar-winning actress and humanitarian advocate' },
      { id: '14', text: 'Brad Pitt', info: 'Hollywood heartthrob and talented actor/producer' },
      { id: '15', text: 'Meryl Streep', info: 'Most nominated actress in Oscar history with incredible range' }
    ]
  },
  {
    id: 'food',
    name: 'Food & Drinks',
    description: 'Delicious foods and beverages',
    emoji: '🍕',
    cards: [
      { id: '1', text: 'Pizza', info: "Italian dish that's become the world's favorite comfort food" },
      { id: '2', text: 'Hamburger', info: "America's iconic sandwich served billions of times daily" },
      { id: '3', text: 'Sushi', info: 'Japanese art of fresh fish and rice perfected over centuries' },
      { id: '4', text: 'Tacos', info: 'Mexican street food with endless filling possibilities' },
      { id: '5', text: 'Ice Cream', info: 'Frozen dessert that brings joy to people of all ages' },
      { id: '6', text: 'Pasta', info: 'Italian staple food made from wheat and water' },
      { id: '7', text: 'Chocolate', info: 'Sweet treat made from cacao beans that boosts mood' },
      { id: '8', text: 'Coffee', info: 'Caffeinated beverage that fuels billions of people daily' },
      { id: '9', text: 'Sandwich', info: 'Convenient meal between two slices of bread' },
      { id: '10', text: 'Cookies', info: 'Sweet baked treats perfect with milk or coffee' },
      { id: '11', text: 'Cake', info: 'Sweet dessert that makes every celebration special' },
      { id: '12', text: 'Salad', info: 'Healthy mix of vegetables, greens, and other fresh ingredients' },
      { id: '13', text: 'Soup', info: 'Warm liquid comfort food perfect for cold days' },
      { id: '14', text: 'Smoothie', info: 'Blended fruit drink that\'s both nutritious and delicious' },
      { id: '15', text: 'Donuts', info: 'Sweet fried dough rings that pair perfectly with coffee' }
    ]
  }
];