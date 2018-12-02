let getRandomSet = (count, max) => {
    let arr = [];
    if (count >= max) {
        for (let i = 0; i < max; i++) {
            arr.push(i);
        }
    } else {
        while (arr.length < count + 1) {
            let rand = Math.floor(Math.random() * max);
            if (arr.indexOf(rand) > -1) continue;
            arr[arr.length] = rand;
        }
    }
    return arr;
};

let getRandomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};


let selectRandom = (count, obj) => {
    let keys = Object.keys(obj);
    let max = keys.length;
    let newObj = {};
    getRandomSet(count, max).forEach(i => {
        newObj[keys[i]] = obj[keys[i]];
    });
    return newObj;
};


let pickOne = (obj) => {
    let keys = Object.keys(obj);
    let max = keys.length;

    let rand = Math.floor(Math.random() * max);
    return {...obj[keys[rand]], name: keys[rand]};
};

module.exports = {
    pickOne,
    selectRandom,
    getRandomSet,
    getRandomIntFromInterval
};

