var mapHeight = 500;
var mapWidth = 500;

var regionSizeX = 10;
var regionSizeY = 10;

var scalingX = 10;
var scalingY = 10;

var charX = 500;
var charY = 200;

var charWidth = 10;
var charHeight = 10;
var charStep = 10;

var direction;
var mobLocations = [];

var canvasInit = function () {
    var canvasPrefix = ["map", "char", "entity", "ui"];

    for (var p = 0; p < canvasPrefix.length; p++) {
        window[canvasPrefix[p] + "_canvas"] = document.getElementById(canvasPrefix[p]);
        window[canvasPrefix[p] + "_ctx"] = window[canvasPrefix[p] + "_canvas"].getContext("2d");

        if (canvasPrefix[p] !== "ui") {
            window[canvasPrefix[p] + "_ctx"].canvas.width = mapWidth * scalingX;
            window[canvasPrefix[p] + "_ctx"].canvas.height = mapHeight * scalingY;
        }
        else {
            ui_ctx.canvas.width = window.innerWidth;
            ui_ctx.canvas.height = window.innerHeight;
        }
    }

    window["characterCanvas"] = document.createElement("canvas");
    window["characterCtx"] = characterCanvas.getContext("2d");

    characterCanvas.width = 50;
    characterCanvas.height = 100;

    characterCtx.fillStyle = "black";

    characterCtx.rect(20, 0, 10, 10); //Head
    characterCtx.rect(22.5, 10, 5, 5); //Neck
    characterCtx.rect(17.5, 15, 15, 25); //Chest
    characterCtx.rect(18, 40, 5, 20); //Left leg
    characterCtx.rect(27, 40, 5, 20); //Right leg

    characterCtx.rotate(70 * Math.PI / 180);

    characterCtx.rect(30, -25, 25, 5);

    characterCtx.rotate(-140 * Math.PI / 180);

    characterCtx.rect(-38, 22, 25, 5);

    characterCtx.rotate(70 * Math.PI / 180);

    characterCtx.fill();
}

canvasInit();

var map = [];
var regionMap = [];
var worldMap = [];

var worldIndex = {};
var currentWorld = 0;

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Object.prototype.getKeyByValue = function (value) {
    for (var prop in this) {
        if (this.hasOwnProperty(prop)) {
             if (this[prop] === value)
                 return prop;
        }
    }
}

var scrollOffsets = function () {
    var doc = document.documentElement;
    var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

    return [left, top];
}

var spliceMap = function (mapSplice) {
    var arr = [];

    for (var i = 0; i < mapSplice.length; i++) {
        if (mapSplice[i].length === 0) {
            mapSplice.splice(i, 1);
        }
    }

    for (var i = 0; i < mapSplice.length; i++) {
        arr.push(mapSplice[i].splice(0, regionSizeY));
    }

    return arr;
};

var sumOctave = function (iterations, x, y, persistance, scale) {
    var maxAmp = 0;
    var amp = 1;
    var freq = scale;
    var currentNoise = 0;

    for (var i = 0; i < iterations; i++) {
        currentNoise += noise.simplex2(x * freq, y * freq);
        maxAmp += amp;
        amp *= persistance;
        freq *= 2;
    }

    currentNoise /= maxAmp;

    return currentNoise;
}

var normalize = function (arr, dim, high) {
    if (dim === 2) {
        var tempArray = [];

        for (var x = 0; x < arr.length; x++) {
            tempArray.push(Math.max.apply(Math, arr[x]));
        }

        var ratio = Math.max.apply(Math, tempArray) / high;

        for (var x = 0; x < arr.length; x++) {
            for (var y = 0; y < arr[x].length; y++) {
                arr[x][y] = Math.abs(arr[x][y] / ratio);
            }
        }
    }
    else if (dim === 1) {
        var ratio = Math.max.apply(Math, arr) / high;

        for (var x = 0; x < arr.length; x++) {
            arr[x] = Math.abs(arr[x] / ratio);
        }
    }

    return arr;
}

var init = function () {
    worldIndex[1] = Math.random();
    currentWorld = 1;
    worldMap.push([1]);

    loadMap(worldIndex[1]);

    eventListeners();
    drawChar();
    drawMobs();
}

var loadWorld = function (dir) {
    var newSeed = Math.random();
    var newIndex = Object.size(worldIndex) + 1;

    for (var row = 0; row < worldMap.length; row++) {
        if (worldMap[row].indexOf(currentWorld) > -1) {
            var prevMapRow = row;
            var prevMapCol = worldMap[row].indexOf(currentWorld);
            break;
        }
    }

    if (dir === "left") {
        charX = mapWidth * scalingX - charStep * 2;

        if (worldMap[prevMapRow].indexOf(currentWorld) === 0) {
            worldMap[prevMapRow].unshift(newIndex);

            for (var row = 0; row < worldMap.length; row++) {
                if (worldMap[row].length < worldMap[prevMapRow].length) {
                    worldMap[row].unshift(0);
                }
            }

            worldIndex[newIndex] = newSeed;
            currentWorld = newIndex;
        }
        else if (worldMap[prevMapRow][prevMapCol - 1] === 0) {
            worldMap[prevMapRow][prevMapCol - 1] = newIndex;

            for (var row = 0; row < worldMap.length; row++) {
                if (worldMap[row].length < worldMap[prevMapRow].length) {
                    worldMap[row].unshift(0);
                }
            }

            worldIndex[newIndex] = newSeed;
            currentWorld = newIndex;
        }
        else {
            newSeed = worldIndex[worldMap[prevMapRow][prevMapCol - 1]];
            currentWorld = parseInt(worldIndex.getKeyByValue(newSeed));
        }

        loadMap(newSeed);
    }

    else if (dir === "right") {
        charX = charStep * 2;

        if (prevMapCol === worldMap[prevMapRow].length - 1) {
            worldMap[prevMapRow].push(newIndex);

            for (var row = 0; row < worldMap.length; row++) {
                if (worldMap[row].length < worldMap[prevMapRow].length) {
                    worldMap[row].push(0);
                }
            }

            currentWorld = newIndex;
            worldIndex[newIndex] = newSeed;
        }
        else if (worldMap[prevMapRow][prevMapCol + 1] === 0) {
            worldMap[prevMapRow][prevMapCol + 1] = newIndex;

            currentWorld = newIndex;
            worldIndex[newIndex] = newSeed;
        }
        else {
            newSeed = worldIndex[worldMap[prevMapRow][prevMapCol + 1]];
            currentWorld = parseInt(worldIndex.getKeyByValue(newSeed));
        }

        loadMap(newSeed);
    }

    else if (dir === "up") {
        charY = mapHeight * scalingY - charStep * 2;

        if (worldMap.indexOf(worldMap[prevMapRow]) === 0) {
            var lengthBefore = prevMapCol;
            var lengthAfter = worldMap[prevMapRow].length - (lengthBefore + 1);

            worldMap.unshift([newIndex]);

            for (var i = 0; i < lengthBefore; i++) {
                worldMap[0].unshift(0);
            }

            for (var i = 0; i < lengthAfter; i++) {
                worldMap[0].push(0);
            }

            currentWorld = newIndex;
            worldIndex[newIndex] = newSeed;
        }
        else if (worldMap[prevMapRow - 1][prevMapCol] === 0) {
            worldMap[prevMapRow - 1][prevMapCol] = newIndex;

            currentWorld = newIndex;
            worldIndex[newIndex] = newSeed;
        }
        else {
            newSeed = worldIndex[worldMap[prevMapRow - 1][prevMapCol]];
            currentWorld = parseInt(worldIndex.getKeyByValue(newSeed));
        }

        loadMap(newSeed);
    }

    else if (dir === "down") {
        charY = charStep * 2;

        if (worldMap.indexOf(worldMap[prevMapRow]) === worldMap.length - 1) {
            worldMap.push([newIndex]);

            currentWorld = newIndex;
            worldIndex[newIndex] = newSeed;
        }
        else if (worldMap[prevMapRow + 1][prevMapCol] === 0) {
            worldMap[prevMapRow + 1][prevMapCol] = newIndex;

            currentWorld = newIndex;
            worldIndex[newIndex] = newSeed;
        }
        else {
            newSeed = worldIndex[worldMap[prevMapRow + 1][prevMapCol]];
            currentWorld = parseInt(worldIndex.getKeyByValue(newSeed));
        }

        loadMap(newSeed);
    }
}

var loadMap = function (seedingValue) {
    map = [];
    regionMap = [];

    noise.seed(seedingValue);

    var regions = (mapWidth / regionSizeX) * (mapHeight / regionSizeY);

    for (var region = 0; region < regions; region++) {
        window["region_" + region] = [];
    }

    var regCount = 0;

    for (var regX = 0; regX < (mapWidth / regionSizeX); regX++) {
        regionMap.push([]);
        for (var regY = 0; regY < (mapHeight / regionSizeY); regY++) {
            regionMap[regX].push(regCount);
            regCount += 1;
        }
    }

    var mapIter = 0;
    var scale = 1;

    for (var x = 0; x < mapWidth; x++) {
        map.push([]);
        for (var y = 0; y < mapHeight; y++) {
            map[x].push(sumOctave(5, x, y, 0.8, 0.001));
        }
    }

    map = normalize(map, 2, 1);

    while (map.length >= regionSizeX) {
        var split1D = map.splice(0, regionSizeX);

        for (var y = 0; y < mapHeight / regionSizeY; y++) {
            window["region_" + regionMap[mapIter][y]] = spliceMap(split1D);
        }
        mapIter += 1;
    }

    //drawMinimap();
    drawMobs();
    updateMap();
};

var displayArray = function (arr) {
    for (var row = 0; row < arr.length; row++) {
        var arrRow = arr[row].join("\t");
        console.log(arrRow);
    }
};

var drawRegion = function (region, indexX, indexY) {
    var xOff = Math.ceil(mapWidth * scalingX / regionMap.length * indexX);
    var yOff = Math.ceil(mapHeight * scalingY / regionMap[indexX].length * indexY);

    for (var x = 0; x < region.length; x++) {
        for (var y = 0; y < region[x].length; y++) {
            var tileValue = Math.floor(region[x][y] * 100) / 100;

            if (tileValue < 0.11) {
                map_ctx.fillStyle = "#bb8e68";
            }
            else if (tileValue < 0.22) {
                map_ctx.fillStyle = "#aa7243";
            }
            else if (tileValue < 0.33) {
                map_ctx.fillStyle = "#885b35";
            }

            else if (tileValue < 0.44) {
                map_ctx.fillStyle = "#329932";
            }
            else if (tileValue < 0.55) {
                map_ctx.fillStyle = "#008000";
            }
            else if (tileValue < 0.66) {
                map_ctx.fillStyle = "#006600";
            }

            else if (tileValue < 0.77) {
                map_ctx.fillStyle = "#3232ff";
            }
            else if (tileValue < 0.88) {
                map_ctx.fillStyle = "#0000ff";
            }
            else if (tileValue < 1) {
                map_ctx.fillStyle = "#0000cc";
            }

            var cellWidth = Math.ceil(mapWidth * scalingX / regionMap.length / region.length);
            var cellHeight = Math.ceil(mapHeight * scalingY / regionMap[indexX].length / region[x].length);

            var xPos = Math.ceil(cellWidth * x);
            var yPos = Math.ceil(cellHeight * y);

            map_ctx.fillRect(xPos + xOff, yPos + yOff, cellWidth, cellHeight);
        }
    }
};

var updateMap = function () {
    map_ctx.clearRect(0, 0, mapWidth * scalingX, mapHeight * scalingY);

    var activeRegionsStartX = Math.floor(scrollOffsets()[0] / regionMap.length / 2);
    var activeRegionsEndX = Math.ceil(activeRegionsStartX + window.innerWidth / regionMap[0].length / 2);

    var activeRegionsStartY = Math.floor(scrollOffsets()[1] / regionMap[0].length / 2);
    var activeRegionsEndY = Math.ceil(activeRegionsStartY + window.innerHeight / regionMap.length / 2);

    if (window.innerWidth < mapWidth * scalingX) {
        for (var rX = activeRegionsStartX; rX < activeRegionsEndX; rX++) {
            for (var rY = activeRegionsStartY; rY < activeRegionsEndY; rY++) {
                drawRegion(window["region_" + regionMap[rX][rY]], rX, rY);
            }
        }
    }
    else {
        for (var rX = 0; rX < regionMap.length; rX++) {
            for (var rY = 0; rY < regionMap[0].length; rY++) {
                drawRegion(window["region_" + regionMap[rX][rY]], rX, rY);
            }
        }
    }
}

var drawChar = function (axis, amount) {
    if (charX < charStep + charWidth) {
        loadWorld("left");
    }
    else if (charY < charStep + charHeight) {
        loadWorld("up");
    }
    else if (charX > mapWidth * scalingX - (charStep + charWidth)) {
        loadWorld("right");
    }
    else if (charY > mapHeight * scalingY - (charStep + charHeight)) {
        loadWorld("down");
    }

    var paddingX = charWidth + charStep;
    var paddingY = charHeight + charStep;

    char_ctx.clearRect(charX - paddingX, charY - paddingY, charX + paddingX, charY + paddingY);

    var regionX = Math.floor(charX / charStep / regionSizeX);
    var regionY = Math.floor(charY / charStep / regionSizeY);

    var activeRegion = regionMap[regionX][regionY];
    var tileValue = window["region_" + activeRegion][charX / charStep - regionX * regionSizeX][charY / charStep - regionY * regionSizeY];

    tileValue = Math.floor(tileValue * 100) / 100;

    if (tileValue >= 0.66 && typeof axis !== "undefined") {
        window["char" + axis.toUpperCase()] -= amount;
    }

    else {
        while (charX - (window.innerWidth / 2 + scrollOffsets()[0]) >= charStep && scrollOffsets()[0] < (mapWidth * scalingX) - window.innerWidth) {
            window.scrollBy(charStep, 0);
        }
        while (charX - (window.innerWidth / 2 + scrollOffsets()[0]) <= -charStep && scrollOffsets()[0] !== 0) {
            window.scrollBy(-charStep, 0);
        }
        while (charY - (window.innerHeight / 2 + scrollOffsets()[1]) >= charStep && scrollOffsets()[1] < (mapHeight * scalingY) - window.innerHeight) {
            window.scrollBy(0, charStep);
        }
        while (charY - (window.innerHeight / 2 + scrollOffsets()[1]) <= -charStep && scrollOffsets()[1] !== 0) {
            window.scrollBy(0, -charStep);
        }
    }

    char_ctx.fillStyle = "black";
    char_ctx.fillRect(charX - charWidth, charY - charHeight, charWidth, charHeight);
    //char_ctx.drawImage(characterCanvas, charX + charWidth / 2, charY + charHeight / 3);
}

var drawMobs = function () {
    clearInterval(updateMonsters);

    mobLocations = [];

    for (var n = 0; n < 10; n++) {
        mobLocations.push([Math.floor(mapWidth * scalingX * Math.random() / 10) * 10, Math.floor(mapHeight * scalingY * Math.random() / 10) * 10]);
    }

    entity_ctx.fillStyle = "purple";

    for (var mob = 0; mob < mobLocations.length; mob++) {
        entity_ctx.fillRect(mobLocations[mob][0], mobLocations[mob][1], 10, 10);
    }

    var updateMonsters = setInterval(updateMobs, 5000);
}

var updateMobs = function () {
    entity_ctx.clearRect(0, 0, window.innerWidth * scalingX, window.innerHeight * scalingY);
    entity_ctx.fillStyle = "purple";

    for (var mob = 0; mob < mobLocations.length; mob++) {
        mobLocations[mob][Math.random() > 0.5 ? 0 : 1] +=  10 * (Math.random() > 0.5 ? -1 : 1);

        entity_ctx.fillRect(mobLocations[mob][0], mobLocations[mob][1], 10, 10);
    }
}

/*
var drawMinimap = function () {
    ui_ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    var lenX = worldMap.length;
    var lenY = worldMap[0].length;

    var horz_offset = window.innerWidth * 0.885;
    var vert_offset = window.innerHeight * 0.02;

    ui_ctx.strokeStyle = "white";

    ui_ctx.rect(horz_offset, vert_offset, window.innerWidth * 0.1, window.innerWidth * 0.1);

    ui_ctx.stroke();

    for (var x = 0; x < lenX; x++) {
        for (var y = 0; y < lenY; y++) {
            ui_ctx.rect(horz_offset, vert_offset, Math.floor(window.innerWidth * 0.1 / 4), Math.floor(window.innerWidth * 0.1 / 4));

            horz_offset += Math.floor(window.innerHeight * 0.1 / lenY);
        }
        vert_offset += Math.floor(window.innerWidth * 0.1 / lenX);

        horz_offset = window.innerWidth * 0.885;
    }

    ui_ctx.stroke();
}
*/

var attack = function () {
    console.log(direction);

    switch (direction) {
        case "left":
            var attackPosX = charX;
            var attackPosY = charY;

            for (var mob = 0; mob < mobLocations.length; mob++) {
                if (Math.abs(mobLocations[mob][0] - attackPosX) < 30 && Math.abs(attackPosY - mobLocations[mob][1]) < 30) {
                    console.log("killed");
                    mobLocations.splice(mob, 1);
                    entity_ctx.clearRect(attackPosX - 5, attackPosY - 5, 10, 10);
                    break;
                }
            }
            break;
    }
}

var keyPressed = function (e) {
    var key = e.keyCode;

    e.preventDefault();

    switch (key) {
        case 37:
            if (charX >= charStep * 2) {
                charX -= charStep;
                direction = "left";
                drawChar("x", -charStep);
            }
            break;
        case 38:
            if (charY >= charStep * 2) {
                charY -= charStep;
                direction = "up";
                drawChar("y", -charStep);
            }
            break;
        case 39:
            if (charX <= mapWidth * scalingX - charStep * 2) {
                charX += charStep;
                direction = "right";
                drawChar("x", charStep);
            }
            break;
        case 40:
            if (charY <= mapHeight * scalingY - charStep * 2) {
                charY += charStep;
                direction = "down";
                drawChar("y", charStep);
            }
            break;
        case 32:
            attack();
            break;
    }
}

var eventListeners = function () {
    document.addEventListener("scroll", updateMap);

    document.addEventListener("keydown", keyPressed, event);

    document.addEventListener("mousewheel", function (event) { event.preventDefault() });
}

init();
