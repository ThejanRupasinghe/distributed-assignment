let sha256 = require('sha256');

const fileNames = [
    "Adventures of Tintin",
    "Jack and Jill",
    "Glee",
    "The Vampire Diaries",
    "King Arthur",
    "Windows XP",
    "Harry Potter",
    "Kung Fu Panda",
    "Lady Gaga",
    "Twilight",
    "Windows 8",
    "Mission Impossible",
    "Turn Up The Music",
    "Super Mario",
    "American Pickers",
    "Microsoft Office 2010",
    "Happy Feet",
    "Modern Family",
    "American Idol",
    "Hacking for Dummies"
];

/**
 * Generate random data of specified size
 * @param size - needed size in megabytes
 * @returns {ArrayBuffer} of size 'size'
 */
let generateRandomData = (size) => {
    size = size * 1000000;  // convert megabytes to bytes
    // return new Blob([new ArrayBuffer(size)], {type: 'application/octet-stream'});
    return new ArrayBuffer(size);
};

/**
 * Calculate SHA256 of data
 * @param data
 */
let calcHash = (data) => {
    return sha256(data);
};


module.exports = {
    fileNames,
    generateRandomData,
    calcHash,
};


// Testing the functions in this file
// let randomData = generateRandomData(8);
// let hash = calcHash(randomData);
// console.log(hash);