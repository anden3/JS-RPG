var mapHeight = 500;
var mapWidth = 500;

var regionSizeX = 10;
var regionSizeY = 10;

var scalingX = 10;
var scalingY = 10;

var map = [];
var regionMap = [];
var worldMap = [];

var worldIndex = {};
var currentWorld = 0;

function scrollOffsets() {
    var doc = document.documentElement;
    var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

    return [left, top];
}

function spliceMap(mapSplice) {
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

function sumOctave(iterations, x, y, persistance, scale) {
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

function normalize(arr, dim, high) {
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

function loadWorld(dir) {
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
        player.x = mapWidth * scalingX - player.width;

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
        player.x = 0;

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
        player.y = mapHeight * scalingY - player.height;

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
        player.y = 0;

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

function loadMap(seedingValue) {
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

    updateMap();
};

function updateMap() {
    map_ctx.clearRect(0, 0, mapWidth * scalingX, mapHeight * scalingY);

    var activeRegionsStartX = Math.floor(scrollOffsets()[0] / regionMap.length / 2);
    var activeRegionsEndX = Math.ceil(activeRegionsStartX + window.innerWidth / regionMap[0].length / 2);

    var activeRegionsStartY = Math.floor(scrollOffsets()[1] / regionMap[0].length / 2);
    var activeRegionsEndY = Math.ceil(activeRegionsStartY + window.innerHeight / regionMap.length / 2);

    for (var rX = activeRegionsStartX; rX < activeRegionsEndX + 1; rX++) {
        for (var rY = activeRegionsStartY; rY < activeRegionsEndY; rY++) {
            drawRegion(window["region_" + regionMap[rX][rY]], rX, rY);
        }
    }
}

function drawRegion(region, indexX, indexY) {
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
