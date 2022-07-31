/**
 * https://stackoverflow.com/questions/7063255/how-can-i-convert-a-string-into-a-unicode-character
 */

var unicodeSymbols = [
  { code: "2654", name: "White King" },
  { code: "2655", name: "White Queen" },
  { code: "2656", name: "White Rook" },
  { code: "2657", name: "White Bishop" },
  { code: "2658", name: "White Knight" },
  { code: "2659", name: "White Pawn" },
  { code: "265A", name: "Black King" },
  { code: "265B", name: "Black Queen" },
  { code: "265C", name: "Black Rook" },
  { code: "265D", name: "Black Bishop" },
  { code: "265E", name: "Black Knight" },
  { code: "265F", name: "Black Pawn" },
  { code: "2600", name: "Clear Wheater" },
  { code: "2601", name: "Cloud" },
  { code: "2602", name: "Umbrela" },
  { code: "2603", name: "Snowman" },
  { code: "2604", name: "Comet" },
  { code: "2605", name: "Black Star" },
  { code: "2606", name: "White Star" },
  { code: "2615", name: "Coffe" },
  { code: "2620", name: "Poison" },
  { code: "2622", name: "Toxic" },
  { code: "2623", name: "Disease" },
  { code: "263C", name: "Sun" },
  { code: "263D", name: "Moon" },
  { code: "2698", name: "Flower" },
  { code: "2699", name: "Gear" },
  { code: "269B", name: "Atom" },
  { code: "26A1", name: "High Voltage" },
  { code: "26C4", name: "Snowman Without Snow" },
  { code: "26C7", name: "Black Snowman" },
  { code: "26C8", name: "Thunderstorm" },
  { code: "2698", name: "Flower" },
];

var animalNames = [
  "Ant",
  "Bee",
  "Cat",
  "Dog",
  "Eagle",
  "Fox",
  "Goat",
  "Hare",
  "Iguana",
  "Kangaroo",
  "Llama",
  "Monkey",
  "Owl",
  "Parrot",
  "Rat",
  "Sheep",
  "Turtle",
  "Zebra",
];

//function to select a random name inside the array of animals
export function chooseRandom(choosenNames) {
  do {
    var animal = animalNames[Math.floor(Math.random() * animalNames.length)];
    // console.log(animal + "-" + choosenNames.includes(animal));
  } while (choosenNames.includes(animal));

  return animal;
}

//function to select a random name inside the array of unicodeSymbols
export function chooseRandomUnicode(choosenNames) {
  do {
    var unicodeElement =
      unicodeSymbols[Math.floor(Math.random() * unicodeSymbols.length)].code;
    var symbol = String.fromCharCode(parseInt(unicodeElement, 16));
    // console.log(
    //   unicodeElement + "-" + symbol + "-" + choosenNames.includes(symbol)
    // );
  } while (choosenNames.includes(symbol));

  return symbol;
}
