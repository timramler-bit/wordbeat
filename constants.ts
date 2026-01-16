import { WordItem } from './types';

// Helper to create simple word items
const w = (text: string, emoji: string): WordItem => ({
  id: text.toLowerCase(),
  text,
  emoji
});

export const VOCAB_SETS: Record<string, WordItem[]> = {
  animals: [
    w("Monkey", "🐵"), w("Tiger", "🐯"), w("Giraffe", "🦒"), w("Zebra", "🦓"), 
    w("Snake", "🐍"), w("Bear", "🐻"), w("Penguin", "🐧"), w("Lion", "🦁"), 
    w("Frog", "🐸"), w("Turtle", "🐢"), w("Cat", "🐱"), w("Dog", "🐶"), 
    w("Fish", "🐟"), w("Bird", "🐦"), w("Elephant", "🐘"), w("Fox", "🦊"), w("Rabbit", "🐰")
  ],
  nature: [
    w("Hill", "⛰️"), w("Rock", "🪨"), w("Flower", "🌸"), w("Tree", "🌳"), 
    w("Lake", "🏞️"), w("River", "🌊"), w("Sun", "☀️"), w("Moon", "🌙"), 
    w("Star", "⭐"), w("Cloud", "☁️"), w("Forest", "🌲"), w("Mountain", "🏔️"), 
    w("Beach", "🏖️"), w("Ocean", "🌊")
  ],
  food: [
    w("Pizza", "🍕"), w("Burger", "🍔"), w("Apple", "🍎"), w("Banana", "🍌"), 
    w("Sushi", "🍣"), w("Rice", "🍚"), w("Bread", "🍞"), w("Cake", "🎂"), 
    w("IceCream", "🍦"), w("Milk", "🥛"), w("Egg", "🥚"), w("Cheese", "🧀"), 
    w("Cookie", "🍪"), w("Donut", "🍩")
  ],
  objects: [
    w("Book", "📖"), w("Pen", "🖊️"), w("Computer", "💻"), w("Phone", "📱"), 
    w("Car", "🚗"), w("Bus", "🚌"), w("Bike", "🚲"), w("Ball", "⚽"), 
    w("Guitar", "🎸"), w("Piano", "🎹"), w("Clock", "⏰"), w("Key", "🔑"), 
    w("Shoe", "👟"), w("Hat", "🧢")
  ],
  places: [
    w("School", "🏫"), w("Park", "🛝"), w("Home", "🏠"), w("Shop", "🏪"), 
    w("Zoo", "🦁"), w("City", "🏙️"), w("Beach", "🏖️"), w("Kitchen", "🍳"), 
    w("Room", "🛏️"), w("Garden", "🌻")
  ],
  colors: [
    w("Red", "🔴"), w("Blue", "🔵"), w("Green", "🟢"), w("Yellow", "🟡"), 
    w("Orange", "🟠"), w("Purple", "🟣"), w("Pink", "🩷"), w("Black", "⚫"), 
    w("White", "⚪"), w("Brown", "🟤")
  ],
  numbers: [
    w("One", "1️⃣"), w("Two", "2️⃣"), w("Three", "3️⃣"), w("Four", "4️⃣"), 
    w("Five", "5️⃣"), w("Six", "6️⃣"), w("Seven", "7️⃣"), w("Eight", "8️⃣"), 
    w("Nine", "9️⃣"), w("Ten", "🔟")
  ],
  alphabet: [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ].map(l => w(l, `🔤`)),
  feelings: [
    w("Happy", "😄"), w("Sad", "😢"), w("Angry", "😠"), w("Sleepy", "😴"), 
    w("Hungry", "😋"), w("Thirsty", "🥤"), w("Hot", "🥵"), w("Cold", "🥶"), 
    w("Tired", "😫"), w("Sick", "🤢"), w("Scared", "😱"), w("Excited", "🤩")
  ]
};

export const COLOR_MAP: Record<string, string> = {
  red: 'text-red-500', blue: 'text-blue-500', green: 'text-green-500',
  yellow: 'text-yellow-400', orange: 'text-orange-500', purple: 'text-purple-500',
  pink: 'text-pink-500', brown: 'text-amber-600', white: 'text-white',
  cyan: 'text-cyan-400', magenta: 'text-fuchsia-500', lime: 'text-lime-400',
  indigo: 'text-indigo-400', violet: 'text-violet-400', teal: 'text-teal-400',
  gold: 'text-yellow-300', silver: 'text-gray-300', black: 'text-slate-400'
};

// Flattened lookup for emoji autosuggest
const ALL_WORDS_MAP = new Map<string, string>();
Object.values(VOCAB_SETS).flat().forEach(item => {
    if (item.emoji) ALL_WORDS_MAP.set(item.text.toLowerCase(), item.emoji);
});

export const getEmojiForWord = (text: string): string | undefined => {
    return ALL_WORDS_MAP.get(text.toLowerCase());
};