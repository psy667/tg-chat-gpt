// Function to reverse word and insert space between characters

const {argv} = require("process");

function reverseWord(word: string) {
    return word.split("").reverse().join(" ");
}
console.log(
reverseWord(argv[2])
)
