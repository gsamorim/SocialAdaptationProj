var behaviorExamples = [
  { short: "L-Potato", desc: "Like Potato" },
  { short: "Sugar!", desc: "Use Sugar" },
  { short: "♥ Driving", desc: "Love Driving" },
  { short: "♥ Dynosaur", desc: "Like Dynosaurs" },
  { short: "PokeGo", desc: "Play Pokemon GO" },
  { short: "Vota", desc: "Vota" },
];

//function to select a random name inside the array of behaviors
export function chooseRandomBehavior(choosenBehaviors) {
  let tryCounter = 0;
  do {
    var newBeh =
      behaviorExamples[Math.floor(Math.random() * behaviorExamples.length)];

    if (tryCounter > 5) {
      var randomNum = Math.floor(Math.random() * 100);
      newBeh = {
        short: "Rand" + randomNum,
        desc: "Random Behavior " + randomNum,
      };
    } else tryCounter++;
  } while (choosenBehaviors.includes(newBeh.short));

  return newBeh;
}
