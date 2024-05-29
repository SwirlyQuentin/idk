import seedrandom from "seedrandom";

export const secondsPerTurn = 60; // should be 10 minute turns
export const turnsPerSettlment = 6 * 4; // 6 turns per hour, 4 hours per tile settlement phase.


export const smoothScrollToAnchor = function (anchorId) {
    const element = document.querySelector(anchorId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        console.warn(`Element with ID ${anchorId} not found.`);
    }
}


export const calculateCurrentTurn = function (gameStart, currentTime) {

    let returnObj = {
        "elapsedSeconds": 0,
        "timeRemaining": "0m 0s",
        "currentTurn": 0,
        "turnSecondsRemaining": 0,
        "turnsRemaining": 0,
        "settledTileCount": 0,
    };

    const secondsPerTile = secondsPerTurn * turnsPerSettlment;

    // the amount of time since GAME start.
    returnObj["elapsedSeconds"] = (currentTime - gameStart) / 1000;

    returnObj["settledTileCount"] = Math.floor(returnObj["elapsedSeconds"] / secondsPerTile);
    const currentTileStartSeconds = secondsPerTile * returnObj["settledTileCount"]
    const currentTileSecondsElapsed = returnObj["elapsedSeconds"] - currentTileStartSeconds;

    returnObj["currentTurn"] = Math.floor(currentTileSecondsElapsed / secondsPerTurn) + 1;

    returnObj["turnSecondsRemaining"] = secondsPerTurn - currentTileSecondsElapsed % secondsPerTurn;
    returnObj["turnsRemaining"] = turnsPerSettlment - returnObj["currentTurn"];

    returnObj["timeRemaining"] = formatTimeRemaining(returnObj["turnSecondsRemaining"]);

    return returnObj
}

export const roll = (baseValue, rng = null) => {
    // base +/- 25%
    return (baseValue * .75) + (baseValue * .5 * rng());
}

export const getBotPlayerData = (tileIndex, rng = null) => {
    if (!rng) rng = seedrandom();
    const figmentsPerBot = tileIndex * turnsPerSettlment * 3 + Math.floor(rng() * tileIndex * turnsPerSettlment * 2);
    const bots = tileIndex * Math.floor(rng() * 15) + 10;
    const diamonds = Math.floor(rng() * bots * tileIndex + bots * tileIndex / 3);
    return { bots: bots, figments: figmentsPerBot * bots, diamonds: diamonds };
}


export const formatTimeRemaining = function (timeRemaining) {
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = Math.floor(timeRemaining % 60);
    return minutes + "m " + seconds + "s";
}

export const parseFirestoreTimestampObject = function (timeObj) {
    // NOTE: returns miliseconds.
    const returnStamp = parseInt((timeObj.seconds + "." + (timeObj.nanoseconds)) * 1000);
    // // logger.log("timestamp:", returnStamp);
    return returnStamp;
}

export const determineAttribute = function (attributesObject, ability) {
    for (const [key, array] of Object.entries(attributesObject)) {
        if (array.includes(ability)) {
            return key;
        }
    }
    return null;
}

export const dedupe = function (arr) {
    return Array.from(new Set(arr));
}

export const pullFromBag = function (bag, rng = null) {
    // rng is a seedrandom object.
    // for example:
    //      let phobiaSeed = splooter.name + utils.getAttribute(splooter, "Personality") + "phobia";
    //      let phobiaRng = seedrandom(phobiaSeed);
    //      let rando = pullFromBag(phobiasArray, phobiaRng);
    if (!rng) rng = seedrandom();
    return bag[Math.floor(rng() * bag.length)];
}

export const pullFromWeightedBag = function (bag, curveWeight, rng) {
    // for more context, look at sploot code.
    // bigger the curveWeight, the more extras added.
    // const curveWeight = .3;
    const uniqueCount = bag.length;
    let newBag = JSON.parse(JSON.stringify(bag));

    for (let i = 0; i < uniqueCount; i++) {
        let extras = Math.round((uniqueCount - i) * curveWeight);
        for (let e = 0; e < extras; e++) {
            newBag.push(bag[i])
        }
    }

    return pullFromBag(newBag, rng);
}

export function sortByKey(arr, key) {
    return arr.sort((a, b) => a[key] - b[key]);
}

export function shuffleArray(array, rng = null) {
    if (!rng) rng = seedrandom();
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(rng() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

export function pullObjectFromBag(key, value, bag) {
    const singleItemBag = bag.filter(item => item[key] == value);
    return singleItemBag[0];
}

export function getRandomObjectsFromBag(num, key, valueArray, sourceArray, rng = null) {
    if (!rng) rng = seedrandom();

    // Filter the array based on the key and values
    const filteredArray = sourceArray.filter(item => valueArray.includes(item[key]));

    // Shuffle the filtered array
    shuffleArray(filteredArray, rng);

    // Return the first `num` elements from the shuffled array
    return filteredArray.slice(0, num);
}

export const getCookie = function (cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export const slugify = function (text) {
    return text
        .toString()                   // Cast to string (optional)
        .normalize('NFKD')            // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .toLowerCase()                // Convert the string to lowercase letters
        .trim()                       // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, '-')         // Replace spaces with -
        .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
        .replace(/\-\-+/g, '-');      // Replace multiple - with single -
};

// this is mostly for testing things -- please don't put it into production.
export const sleep = function (milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
