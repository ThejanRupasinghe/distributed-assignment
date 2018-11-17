module.exports.search = (search_string) => {

    var word_array = search_string.split(" ");
    var file_array = new Array();

    var word_file_map  = new Object();

    var txtFile = "resources/files.txt"
    var file = new File(txtFile);

    file.open("r"); // open file with read access
    var str = "";
    while (!file.eof) {
        var line = file.readln();
        file_array.push(line);
        var line_word_array = line.split(" ");
        for(i=0; i<line_word_array.length; i++){
            if(!word_file_map.hasOwnProperty(line_word_array[i])){
                word_file_map[line_word_array[i]] = line;
            }else{
                word_file_map[line_word_array[i]] += ","+line;
            }
        }
    }

    if(file_array.includes(search_string)){
        return search_string;
    }




};