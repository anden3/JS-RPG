var mapHeight = 500;
var mapWidth = 500;

var regionSizeX = 10;
var regionSizeY = 10;

var scalingX = 10;
var scalingY = 10;

var mobAmount = 100;
var mobs = [];

var canvasInit = function () {
    var overFlowCanvases = ["map", "char", "entity", "ui", "largeMap"];
    var fixedCanvases = ["ui", "largeMap"];

    for (var c = 0; c < overFlowCanvases.length; c++) {
        window[overFlowCanvases[c] + "_canvas"] = document.getElementById(overFlowCanvases[c]);
        window[overFlowCanvases[c] + "_ctx"] = window[overFlowCanvases[c] + "_canvas"].getContext("2d");

        window[overFlowCanvases[c] + "_ctx"].canvas.width = mapWidth * scalingX;
        window[overFlowCanvases[c] + "_ctx"].canvas.height = mapHeight * scalingY;
    }

    for (var c = 0; c < fixedCanvases.length; c++) {
        window[fixedCanvases[c] + "_canvas"] = document.getElementById(fixedCanvases[c]);
        window[fixedCanvases[c] + "_ctx"] = window[fixedCanvases[c] + "_canvas"].getContext("2d");

        window[fixedCanvases[c] + "_ctx"].canvas.width = window.innerWidth;
        window[fixedCanvases[c] + "_ctx"].canvas.height = window.innerHeight;
    }

    /*
    window["characterCanvas"] = document.createElement("canvas");
    window["characterCtx"] = characterCanvas.getContext("2d");

    characterCanvas.width = 50;
    characterCanvas.height = 100;

    charWidth = 50;
    charHeight = 100;

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
    */
}

canvasInit();

var map = [];
var regionMap = [];
var worldMap = [];

var worldIndex = {};
var currentWorld = 0;

var Player = function (x, y, width, height, color, step) {
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.color = color;
    this.step = step;

    this.direction = null;
    this.tileValue = null;
}

Player.prototype.move = function (obj, axis, amount) {
    var paddingX = obj.width + obj.step * 2;
    var paddingY = obj.height + obj.step * 2;

    char_ctx.clearRect(obj.x - obj.step, obj.y - obj.step, paddingX, paddingY);

    if (obj.x < 0) {
        loadWorld("left");
    }
    else if (obj.y < 0) {
        loadWorld("up");
    }
    else if (obj.x > mapWidth * scalingX - obj.width) {
        loadWorld("right");
    }
    else if (obj.y > mapHeight * scalingY - obj.height) {
        loadWorld("down");
    }

    var regionX = Math.floor(obj.x / obj.step / regionSizeX);
    var regionY = Math.floor(obj.y / obj.step / regionSizeY);

    obj.region = regionMap[regionX][regionY];
    obj.tileValue = window["region_" + obj.region][obj.x / obj.step - regionX * regionSizeX][obj.y / obj.step - regionY * regionSizeY];

    obj.tileValue = Math.floor(obj.tileValue * 100) / 100;

    if (obj.tileValue >= 0.66 && typeof axis !== "undefined") {
        player[axis] -= amount;
    }

    else {
        while (obj.x - (window.innerWidth / 2 + scrollOffsets()[0]) >= obj.step && scrollOffsets()[0] < (mapWidth * scalingX) - window.innerWidth) {
            window.scrollBy(obj.step, 0);
        }
        while (obj.x - (window.innerWidth / 2 + scrollOffsets()[0]) <= -1 * obj.step && scrollOffsets()[0] !== 0) {
            window.scrollBy(-1 * obj.step, 0);
        }
        while (obj.y - (window.innerHeight / 2 + scrollOffsets()[1]) >= obj.step && scrollOffsets()[1] < (mapHeight * scalingY) - window.innerHeight) {
            window.scrollBy(0, obj.step);
        }
        while (obj.y - (window.innerHeight / 2 + scrollOffsets()[1]) <= -1 * obj.step && scrollOffsets()[1] !== 0) {
            window.scrollBy(0, -1 * obj.step);
        }
    }

    char_ctx.fillStyle = obj.color;
    char_ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

var Mob = function (id, width, height, color) {
    this.id = id;

    this.x = Math.floor(window.innerWidth * scalingX * Math.random() / 10) * 10;
    this.y = Math.floor(window.innerHeight * scalingY * Math.random() / 10) * 10;

    this.width = width;
    this.height = height;

    this.color = color;

    this.isDead = false;

    mobs.push(this);

    entity_ctx.fillStyle = this.color;
    entity_ctx.fillRect(this.x, this.y, this.width, this.height);
}

Mob.prototype.move = function () {
    entity_ctx.clearRect(this.x, this.y, this.width, this.height);

    if ((Math.random() > 0.5) ? true : false) {
        this.x += 10 * ((Math.random() > 0.5) ? -1 : 1);
    }
    else {
        this.y += 10 * ((Math.random() > 0.5) ? -1 : 1);
    }

    entity_ctx.fillRect(this.x, this.y, this.width, this.height);
}

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

    window.scroll(0, 0);

    eventListeners();
    window["player"] = new Player(500, 200, 10, 10, "blue", 10);
    player.move(player, "x", 0);
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

var drawMobs = function () {
    for (var n = 0; n < mobAmount; n++) {
        window["mob_" + n] = new Mob(n, 10, 10, "purple");
    }

    moveMobs();
}

var moveMobs = function () {
    for (var mob = 0; mob < mobs.length; mob++) {
        if (!mobs[mob].isDead) {
            mobs[mob].move();
        }
    }

    setTimeout(moveMobs, 1000);
}

var drawMap = function () {
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

var attack = function () {
    char_ctx.fillStyle = "silver";

    switch (player.direction) {
        case "left":
            char_ctx.fillRect(player.x - player.step, player.y + player.height / 4, player.step, player.height / 2);

            for (var mob = 0; mob < mobs.length; mob++) {
                if (player.x - mobs[mob].width === mobs[mob].x) {
                    if (player.y === mobs[mob].y) {
                        mobs[mob].isDead = true;

                        entity_ctx.clearRect(mobs[mob].x, mobs[mob].y, mobs[mob].width, mobs[mob].height);
                    }
                }
            }

            setTimeout(function () {
                char_ctx.clearRect(player.x - player.step, player.y, player.step, player.height);
            }, 1000);
            break;
        case "right":
            char_ctx.fillRect(player.x + player.width, player.y + player.height / 4, player.step, player.height / 2);

            for (var mob = 0; mob < mobs.length; mob++) {
                if (player.x + player.width === mobs[mob].x) {
                    if (player.y === mobs[mob].y) {
                        mobs[mob].isDead = true;

                        entity_ctx.clearRect(mobs[mob].x, mobs[mob].y, mobs[mob].width, mobs[mob].height);
                    }
                }
            }
            setTimeout(function () {
                char_ctx.clearRect(player.x + player.width, player.y, player.step, player.height);
            }, 1000);
            break;
        case "up":
            char_ctx.fillRect(player.x + player.width / 4, player.y - player.step, player.width / 2, player.step);

            for (var mob = 0; mob < mobs.length; mob++) {
                if (player.x === mobs[mob].x) {
                    if (player.y - mobs[mob].height === mobs[mob].y) {
                        mobs[mob].isDead = true;

                        entity_ctx.clearRect(mobs[mob].x, mobs[mob].y, mobs[mob].width, mobs[mob].height);
                    }
                }
            }
            setTimeout(function () {
                char_ctx.clearRect(player.x, player.y - player.step, player.width, player.step);
            }, 1000);
            break;
        case "down":
            char_ctx.fillRect(player.x + player.width / 4, player.y + player.height, player.width / 2, player.height);

            for (var mob = 0; mob < mobs.length; mob++) {
                if (player.x === mobs[mob].x) {
                    if (player.y + player.height === mobs[mob].y) {
                        mobs[mob].isDead = true;

                        entity_ctx.clearRect(mobs[mob].x, mobs[mob].y, mobs[mob].width, mobs[mob].height);
                    }
                }
            }
            setTimeout(function () {
                char_ctx.clearRect(player.x, player.y + player.height, player.width, player.height);
            }, 1000);
            break;
    }
}

var keyPressed = function (e) {
    var key = e.keyCode;

    e.preventDefault();

    switch (key) {
        case 37:
            if (player.x >= 0) {
                player.x -= player.step;
                player.direction = "left";
                player.move(player, "x", -1 * player.step);
            }
            break;
        case 38:
            if (player.y >= 0) {
                player.y -= player.step;
                player.direction = "up";
                player.move(player, "y", -1 * player.step);
            }
            break;
        case 39:
            if (player.x <= mapWidth * scalingX - player.step) {
                player.x += player.step;
                player.direction = "right";
                player.move(player, "x", player.step);
            }
            break;
        case 40:
            if (player.y <= mapHeight * scalingY - player.step) {
                player.y += player.step;
                player.direction = "down";
                player.move(player, "y", player.step);
            }
            break;
        case 32:
            attack();
            break;
        case 77:
            drawMap();
            break;
    }
}

var eventListeners = function () {
    document.addEventListener("scroll", updateMap);

    document.addEventListener("keydown", keyPressed, event);

    document.addEventListener("mousewheel", function (event) { event.preventDefault() });
}

init();
