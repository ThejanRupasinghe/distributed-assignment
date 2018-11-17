const fs = require('fs');

//search for available files - available files are in ./resources/files.txt
//todo: eliminate the redundancy of creating this map again and again

/**
 * Search for a query in given file names
 *
 * @param search_string search string to search
 * @param file_array array of file names
 * @returns {Array} includes result file names
 */
module.exports.search = (search_string, file_array) => {

    //to keep each word in search string
    let word_array = search_string.toLowerCase().split(" ");

    /* Commenting all file operations - file_array is passed to function
    //to keep the available files
    let file_array = [];
    //to identify available files in the node
    let txtFile = "./resources/files.txt";
    let file = fs.readFileSync(txtFile, 'utf8');
    file_array = file.split("\n");
    */

    //each word is mapped to a file (key = <individiual word>, value = <filename>)
    let word_file_map = {};

    //search results are stored in here
    let result_array = [];

    //each filename is mapped (key = individual term, value = filename) -- multivalue supported
    file_array.forEach(line => {
        let line_word_array = line.toLowerCase().split(" ");
        for (let i = 0; i < line_word_array.length; i++) {
            if (!word_file_map.hasOwnProperty(line_word_array[i])) {
                //if the individual term is not in map as a key -> add
                word_file_map[line_word_array[i]] = line;
            } else {
                //if the individual term is already in the map -> append to the existing value using comma
                word_file_map[line_word_array[i]] += "," + line;
            }
        }
    });

    //iterate through the word array
    for (let j = 0; j < word_array.length; j++) {

        //if the individual key is in the map search for it, otherwise return null
        if (word_file_map.hasOwnProperty(word_array[j])) {

            //temp_result provides all the records for each individual term (key)
            let temp_result = word_file_map[word_array[j]].split(",");

            //on the very first term, no results
            if (result_array.length === 0) {
                result_array = temp_result;

                //from second term onwards this continues
            } else {

                //if a term is in results array but not in temp result => remove them
                temp_result.forEach(element => {
                    for (let k = 0; k < result_array.length; k++) {
                        if (result_array[k] !== element) {
                            result_array.splice(k, 1);
                        }
                    }
                });
            }
        } else {
            return [];
        }
    }

    return result_array;
};

// const searchAlgo = require('./search_algo');
// console.log(searchAlgo.search("windows 81"));