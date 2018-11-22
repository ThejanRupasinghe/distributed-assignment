const crypto = require('crypto');
const sha256 = require('sha256');
const fs = require('fs');
const logger = require('./logger');

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
    let buffer = crypto.randomBytes(size);
    return buffer;
};

/**
 * Calculate SHA256 of data
 * @param data
 */
let calcHash = (data) => {
    return sha256(data);
};

let verifyHash = (data, givenHash) => {
    console.log(data);
    console.log(givenHash);
    console.log(calcHash(data));
    let verified = (givenHash === calcHash(data));
    if(verified){
        logger.ok("FileController: Hash verified.")
    } else {
        logger.error("FileController: Hash verification failed. Un-matching hashes.")
    }
    return verified;
};

let writeToFile = (data, fileName) => {
    let filePath = "../downloaded_files/"+fileName+".txt";
    fs.writeFile(filePath, data, function (err) {
        if (err){
            logger.error("FileController: Error occurred in writing file.")
        } else {
            logger.ok("FileController: " + fileName + " wrote to file.")
        }
    });
};

module.exports = {
    fileNames,
    generateRandomData,
    calcHash,
    verifyHash,
    writeToFile,
};


// Testing the functions in this file
// let randomData = generateRandomData(8);
// let hash = calcHash(randomData);
// console.log(hash);