var mapHeight = 500;
var mapWidth = 500;

var regionSizeX = 10;
var regionSizeY = 10;

var scalingX = 10;
var scalingY = 10;

var mobAmount = 100;
var mobs = [];

var buttons = {};

var keys = {};

var runModifier = 1;

var mapShowing = false;
var gameOverShowing = false;

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

var Player = function (x, y, width, height, step, color, health) {
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.step = step;

    this.color = color;

    this.health = health;
    this.maxHealth = health;

    this.direction = null;
    this.tileValue = null;

    this.score = 0;
}

Player.prototype.move = function (obj, axis, amount) {
    var ctx = char_ctx;

    var paddingX = obj.width + Math.abs(amount) * 2;
    var paddingY = obj.height + Math.abs(amount) * 2;

    ctx.clearRect(obj.x - Math.abs(amount), obj.y - Math.abs(amount), paddingX, paddingY);

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

    for (var mob = 0; mob < mobs.length; mob++) {
        if (obj.x === mobs[mob].x) {
            if (obj.y === mobs[mob].y) {
                obj.health -= 1;
                obj.drawHealth();

                var amount = 20 * ((Math.random() > 0.5) ? 1 : -1);

                if ((Math.random() > 0.5) ? true : false) {
                    obj.x += amount;
                    obj.move(player, "x", obj);
                }
                else {
                    obj.y += amount;
                    obj.move(obj, "y", amount);
                }
            }
        }
    }

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

    ctx.beginPath();

    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

    ctx.closePath();
}

Player.prototype.drawHealth = function () {
    var ctx = ui_ctx;

    if (this.health > 0) {
        var spacing = 70;

        ctx.clearRect(0, 0, 75 + spacing * this.maxHealth, 70);

        ctx.fillStyle = "red";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        for (var heart = 0; heart < this.health; heart++) {
            var space = spacing * heart;

            ctx.beginPath();

            ctx.moveTo(35 + space, 20);

            ctx.bezierCurveTo(35 + space,   20,     35 + space,     12,     25 + space,     12);
            ctx.bezierCurveTo(10 + space,   12,     10 + space,     30,     10 + space,     30);
            ctx.bezierCurveTo(10 + space,   40,     20 + space,     51,     37 + space,     60);
            ctx.bezierCurveTo(55 + space,   50,     65 + space,     40,     65 + space,     30);
            ctx.bezierCurveTo(65 + space,   30,     65 + space,     12,     50 + space,     12);
            ctx.bezierCurveTo(40 + space,   12,     35 + space,     18,     37 + space,     20);

            ctx.stroke();
            ctx.fill();

            ctx.closePath();
        }
    }

    else {
        this.gameOver();
    }
}

Player.prototype.gameOver = function () {
    var ctx = ui_ctx;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.beginPath(); //Background
        ctx.fillStyle = "red";

        ctx.canvas.style.opacity = "0.8";

        ctx.rect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fill();
    ctx.closePath();

    ctx.beginPath(); //Game over
        ctx.fillStyle = "white";
        ctx.font = "72px Arial";

        var horzOff = (window.innerWidth - ctx.measureText("GAME OVER").width) / 2;

        ctx.fillText("GAME OVER", horzOff, window.innerHeight / 2 - 250);

        ctx.fill();
    ctx.closePath();

    ctx.beginPath(); //Score
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";

        horzOff = (window.innerWidth - ctx.measureText("Score: " + this.score).width) / 2;

        ctx.fillText("Score: " + this.score, horzOff, window.innerHeight / 2 - 200);

        ctx.fill();
    ctx.closePath();

    var gameOver = new Button({
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2,
        width: 200,
        height: 50,
        text: "Restart game?",
        font: "Arial",
        fontSize: "24px",
        borderWidth: 3,
        borderColor: "black",
        fillColor: "grey",
        textColor: "white",
        ctx: ui_ctx
    });

    buttons["gameOver"] = gameOver;

    gameOverShowing = true;
}

Player.prototype.drawScore = function (obj) {
    var ctx = ui_ctx;

    ctx.clearRect(window.innerWidth * 0.8, 0, 200, 200);

    ctx.beginPath();

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.lineWidth = 1;

    ctx.fillText("Score: " + obj.score, window.innerWidth * 0.86, window.innerHeight * 0.05, 80);

    ctx.closePath();

    ctx.fill();
}

Player.prototype.castSpell = function (obj, isIterating, iter, x, y, VX, VY) {
    var ctx = entity_ctx;

    var projSizeX = 10;
    var projSizeY = 10;

    if (!isIterating) {
        switch (obj.direction) {
            case "left":
                var x = obj.x - obj.step;
                var y = obj.y;

                var VX = -10;
                var VY = 0;
                break;
            case "right":
                var x = obj.x + obj.width;
                var y = obj.y;

                var VX = 10;
                var VY = 0;
                break;
            case "up":
                var x = obj.x;
                var y = obj.y - obj.step;

                var VX = 0;
                var VY = -10;
                break;
            case "down":
                var x = obj.x;
                var y = obj.y + obj.height;

                var VX = 0;
                var VY = 10;
                break;
        }

        ctx.beginPath();

        ctx.fillStyle = "red";
        ctx.fillRect(x, y, projSizeX, projSizeY);

        ctx.closePath();

        setTimeout(function () {
            player.castSpell(player, true, 10, x += VX, y += VY, VX, VY);
        }, 200);
    }
    else {
        ctx.clearRect(x - VX, y - VY, projSizeX, projSizeY);

        if (iter > 0) {
            iter -= 1;

            ctx.beginPath();

            ctx.fillStyle = "red";
            ctx.fillRect(x, y, projSizeX, projSizeY);

            ctx.closePath();

            setTimeout(function () {
                player.castSpell(player, true, iter, x += VX, y += VY, VX, VY);
            }, 200);
        }
    }

    for (var mob = 0; mob < mobs.length; mob++) {
        if (x === mobs[mob].x) {
            if (y === mobs[mob].y) {
                mobs[mob].isDead = true;
                entity_ctx.clearRect(mobs[mob].x, mobs[mob].y, mobs[mob].width, mobs[mob].height);

                obj.score += 1;
                obj.drawScore(obj);
            }
        }
    }
}

var Mob = function (id, width, height, color) {
    var ctx = entity_ctx;

    this.id = id;

    this.x = Math.floor(window.innerWidth * scalingX * Math.random() / 10) * 10;
    this.y = Math.floor(window.innerHeight * scalingY * Math.random() / 10) * 10;

    this.width = width;
    this.height = height;

    this.color = color;

    this.isDead = false;

    mobs.push(this);

    ctx.beginPath();

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.closePath();
}

Mob.prototype.move = function () {
    var ctx = entity_ctx;

    ctx.clearRect(this.x, this.y, this.width, this.height);

    if ((Math.random() > 0.5) ? true : false) {
        this.x += 10 * ((Math.random() > 0.5) ? -1 : 1);
    }
    else {
        this.y += 10 * ((Math.random() > 0.5) ? -1 : 1);
    }

    if (this.x === player.x) {
        if (this.y === player.y) {
            player.health -= 1;
            player.drawHealth();

            var amount = 20 * ((Math.random() > 0.5) ? 1 : -1);

            if ((Math.random() > 0.5) ? true : false) {
                player.x += amount;
                player.move(player, "x", amount);
            }
            else {
                player.y += amount;
                player.move(player, "y", amount);
            }
        }
    }

    ctx.beginPath();

    ctx.fillStyle = "purple";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.closePath();
}

var Button = function (opt) {
    this.x = opt.x;
    this.y = opt.y;

    this.width = opt.width;
    this.height = opt.height;

    this.text = opt.text;
    this.font = opt.font;
    this.fontSize = opt.fontSize;

    this.borderWidth = opt.borderWidth;

    this.borderColor = opt.borderColor;
    this.fillColor = opt.fillColor;
    this.textColor = opt.textColor;

    this.ctx = opt.ctx;

    this.draw();
}

Button.prototype.draw = function () {
    var ctx = this.ctx;

    ctx.beginPath();
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = this.borderWidth;

        ctx.rect(this.x, this.y, this.width, this.height);

        ctx.fill();
        ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
        ctx.fillStyle = this.textColor;
        ctx.font = this.fontSize + " " + this.font;

        horzOff = (window.innerWidth - ctx.measureText("Restart game?").width) / 2;

        ctx.fillText(this.text, horzOff, this.y + 30);

        ctx.fill();
    ctx.closePath();
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
    var canvases = document.getElementsByTagName("canvas");

    for (var c = 0; c < canvases.length; c++) {
        window[canvases[c].id + "_ctx"].clearRect(0, 0, canvases[c].width, canvases[c].height);
    }

    if (typeof mobsLoop !== "undefined") {
        clearTimeout(mobsLoop);
    }

    map = [];
    regionMap = [];
    worldMap = [];
    worldIndex = {};

    worldIndex[1] = Math.random();
    currentWorld = 1;
    worldMap.push([1]);

    loadMap(worldIndex[1]);

    window.scroll(0, 0);

    eventListeners();

    window["player"] = new Player(500, 200, 10, 10, 10, "blue", 5);
    player.drawHealth(player);
    player.drawScore(player);
    player.move(player, "x", 0);

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
    mobs = [];

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

    window["mobsLoop"] = setTimeout(moveMobs, 1000);
}

var drawLargeMap = function () {
    var ctx = largeMap_ctx;
    mapShowing = true;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = "white";

    for (var row = 0; row < worldMap.length; row++) {
        var vertOffset = Math.floor(window.innerHeight / worldMap.length * row) + 50;

        for (var col = 0; col < worldMap[row].length; col++) {
            var horzOffset = Math.floor(window.innerWidth / worldMap[row].length * col) + 50;

            if (worldMap[row][col] !== 0) {
                ctx.rect(horzOffset, vertOffset, 50, 50);
                ctx.strokeText(worldMap[row][col], horzOffset + 20, vertOffset + 25, 30);
            }
        }
    }

    ctx.stroke();

    document.getElementById("largeMap").style.display = "block";
}

var attack = function () {
    var ctx = char_ctx;

    ctx.fillStyle = "silver";

    switch (player.direction) {
        case "left":
            ctx.fillRect(player.x - player.step, player.y + player.height / 4, player.step, player.height / 2);

            for (var mob = 0; mob < mobs.length; mob++) {
                if (player.x - mobs[mob].width === mobs[mob].x) {
                    if (player.y === mobs[mob].y) {
                        mobs[mob].isDead = true;
                        entity_ctx.clearRect(mobs[mob].x, mobs[mob].y, mobs[mob].width, mobs[mob].height);

                        player.score += 1;
                        player.drawScore(player);
                    }
                }
            }

            setTimeout(function () {
                ctx.clearRect(player.x - player.step, player.y, player.step, player.height);
            }, 300);
            break;
        case "right":
            ctx.fillRect(player.x + player.width, player.y + player.height / 4, player.step, player.height / 2);

            for (var mob = 0; mob < mobs.length; mob++) {
                if (player.x + player.width === mobs[mob].x) {
                    if (player.y === mobs[mob].y) {
                        mobs[mob].isDead = true;
                        entity_ctx.clearRect(mobs[mob].x, mobs[mob].y, mobs[mob].width, mobs[mob].height);

                        player.score += 1;
                        player.drawScore(player);
                    }
                }
            }
            setTimeout(function () {
                ctx.clearRect(player.x + player.width, player.y, player.step, player.height);
            }, 300);
            break;
        case "up":
            ctx.fillRect(player.x + player.width / 4, player.y - player.step, player.width / 2, player.step);

            for (var mob = 0; mob < mobs.length; mob++) {
                if (player.x === mobs[mob].x) {
                    if (player.y - mobs[mob].height === mobs[mob].y) {
                        mobs[mob].isDead = true;
                        entity_ctx.clearRect(mobs[mob].x, mobs[mob].y, mobs[mob].width, mobs[mob].height);

                        player.score += 1;
                        player.drawScore(player);
                    }
                }
            }
            setTimeout(function () {
                ctx.clearRect(player.x, player.y - player.step, player.width, player.step);
            }, 300);
            break;
        case "down":
            ctx.fillRect(player.x + player.width / 4, player.y + player.height, player.width / 2, player.height);

            for (var mob = 0; mob < mobs.length; mob++) {
                if (player.x === mobs[mob].x) {
                    if (player.y + player.height === mobs[mob].y) {
                        mobs[mob].isDead = true;
                        entity_ctx.clearRect(mobs[mob].x, mobs[mob].y, mobs[mob].width, mobs[mob].height);

                        player.score += 1;
                        player.drawScore(player);
                    }
                }
            }
            setTimeout(function () {
                ctx.clearRect(player.x, player.y + player.height, player.width, player.height);
            }, 300);
            break;
    }
}

var keyPresses = function (e) {
    keys[e.keyCode] = e.type === "keydown";

    e.preventDefault();

    if (keys[16]) { //Shift
        runModifier = 2;
    }
    else {
        runModifier = 1;
    }
    if (keys[37]) { //Left arrow
        if (player.x >= 0) {
            player.x -= player.step * runModifier;
            player.direction = "left";
            player.move(player, "x", -1 * player.step * runModifier);
        }
    }
    if (keys[38]) { //Up arrow
        if (player.y >= 0) {
            player.y -= player.step * runModifier;
            player.direction = "up";
            player.move(player, "y", -1 * player.step * runModifier);
        }
    }
    if (keys[39]) { //Right arrow
        if (player.x <= mapWidth * scalingX - player.step * runModifier) {
            player.x += player.step * runModifier;
            player.direction = "right";
            player.move(player, "x", player.step * runModifier);
        }
    }
    if (keys[40]) { //Down arrow
        if (player.y <= mapHeight * scalingY - player.step * runModifier) {
            player.y += player.step * runModifier;
            player.direction = "down";
            player.move(player, "y", player.step * runModifier);
        }
    }
    if (keys[27]) { //Escape
        if (mapShowing) {
            document.getElementById("largeMap").style.display = "none";
            largeMap_ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
    }
    if (keys[88]) { //X
        attack();
    }
    if (keys[67]) { //C
        player.castSpell(player, false);
    }
    if (keys[77]) { //M
        drawLargeMap();
    }
}

var clickHandler = function (e) {
    var mouseX = event.clientX;
    var mouseY = event.clientY;

    if (gameOverShowing) {
        var button = buttons["gameOver"];

        if (Math.abs(mouseX - button.x - button.width / 2) <= button.width / 2) {
            if (Math.abs(mouseY - button.y - button.height / 2) <= button.height / 2) {
                init();
            }
        }
    }
}

var eventListeners = function () {
    document.addEventListener("scroll", updateMap);

    document.addEventListener("keydown", keyPresses, event);
    document.addEventListener("keyup", keyPresses, event);

    document.addEventListener("click", clickHandler, event);

    document.addEventListener("mousewheel", function (event) { event.preventDefault() });
}

init();
