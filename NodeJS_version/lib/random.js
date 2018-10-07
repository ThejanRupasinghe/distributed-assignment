let genRanSet = (count, max) => {
    let arr = [];
    if(count >= max) {
        for (let i = 0; i < count; i++) {
            arr.push(i);
        }
    } else {
        while(arr.length < count + 1){
            let rand = Math.floor(Math.random()*max);
            if(arr.indexOf(rand) > -1) continue;
            arr[arr.length] = rand;
        }
    }
    return arr;
};

module.exports.getRandomSet = genRanSet;

module.exports.selectRandom = (count, obj) => {
    let keys = Object.keys(obj);
    let max = keys.length;
    let newObj = {};
    genRanSet(count, max).forEach(i => {
        newObj[keys[i]] = obj[keys[i]];
    });
    return newObj;
};

module.exports.pickOne = (obj) => {
    let keys = Object.keys(obj);
    let max = keys.length;
    let rand = Math.floor(Math.random()*max);
    return obj[keys[rand]];
};
