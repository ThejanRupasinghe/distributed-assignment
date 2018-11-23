const crypto = require('crypto');
const sha256 = require('sha256');
const fs = require('fs');
const path = require('path');
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
    size = size * 1048576 / 3.5625;  // convert megabytes to bytes
    // return new Blob([new ArrayBuffer(size)], {type: 'application/octet-stream'});
    //TODO: not the exact MB size, small amount larger
    let buffer = crypto.randomBytes(Math.round(size));
    return buffer;
};

/**
 * Calculates SHA256 of data
 * @param data
 */
let calcHash = (data) => {
    let hash = sha256(data);
    logger.debug("FileController: Calculated Hash - " + hash);
    return hash;
};

/**
 * Verifies the hash with given data.
 * @param data data to calculate hash
 * @param givenHash provided hash value with data
 * @returns {boolean} true if both hashes match, false otherwise
 */
let verifyHash = (data, givenHash) => {
    logger.debug("FileController: Given Hash - " + givenHash);
    let verified = (givenHash === calcHash(data));
    if (verified) {
        logger.ok("FileController: Hash verified.")
    } else {
        logger.error("FileController: Hash verification failed. Un-matching hashes.")
    }
    return verified;
};

/**
 * Writes given data to a file with the given file name
 * @param data data tobe written
 * @param fileName file name
 */
let writeToFile = (data, fileName) => {
    let filePath = path.join(__dirname, '..', 'downloaded_files', fileName + ".txt");
    fs.writeFile(filePath, data, function (err) {
        if (err) {
            logger.error("FileController: Error occurred in writing file.");
            logger.error(err);
        } else {
            logger.ok("FileController: " + fileName + " wrote to the file.")
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