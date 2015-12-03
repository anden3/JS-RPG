var keys = {};

var mapShowing = false;
var menuShowing = false;
var gameOverShowing = false;

function canvasInit() {
    var overFlowCanvases = ["map", "char", "entity", "ui", "largeMap"];
    var fixedCanvases = ["ui", "largeMap", "menu"];

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
}

canvasInit();

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

function init() {
    var canvases = document.getElementsByTagName("canvas");

    for (var c = 0; c < canvases.length; c++) {
        window[canvases[c].id + "_ctx"].clearRect(0, 0, canvases[c].width, canvases[c].height);
    }

    if (typeof mobsLoop !== "undefined") {
        clearTimeout(mobsLoop);
    }
    
    mapShowing = false;
    menuShowing = false;
    gameOverShowing = false;
    
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

function displayArray(arr) {
    for (var row = 0; row < arr.length; row++) {
        var arrRow = arr[row].join("\t");
        console.log(arrRow);
    }
};

function drawLargeMap() {
    var ctx = largeMap_ctx;
    mapShowing = true;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = "white";

    for (var row = 0; row < worldMap.length; row++) {
        var vertOffset = Math.floor(window.innerHeight / worldMap.length * row) + 50;

        for (var col = 0; col < worldMap[row].length; col++) {
            var horzOffset = Math.floor(window.innerWidth / worldMap[row].length * col) + 50;

            if (worldMap[row][col] !== 0) {
                ctx.beginPath();
                
                ctx.rect(horzOffset, vertOffset, 50, 50);
                ctx.strokeText(worldMap[row][col], horzOffset + 20, vertOffset + 25, 30);
                
                ctx.stroke();
                
                ctx.closePath();
            }
        }
    }

    document.getElementById("largeMap").style.display = "block";
}

function drawMenu() {
    menuShowing = true;
    
    var ctx = menu_ctx;
    
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    var xOff = (window.innerWidth - window.innerWidth * 0.4) / 2;
    
    ctx.beginPath();
    
    ctx.rect(xOff, window.innerHeight * 0.1, window.innerWidth * 0.4, window.innerHeight * 0.8);
    
    ctx.fillStyle = "brown";
    ctx.fill();
    
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.closePath();
    
    buttons["resume"] = new Button({
        x: window.innerWidth / 2 - window.innerWidth * 0.06,
        y: window.innerHeight * 0.15,
        width: 180,
        height: 50,
        text: "Resume game",
        textX: window.innerWidth / 2 - window.innerWidth * 0.05,
        font: "Arial",
        fontSize: "24px",
        borderWidth: 3,
        borderColor: "black",
        fillColor: "grey",
        textColor: "white",
        ctx: ctx
    });
}

function keyPresses(e) {
    keys[e.keyCode] = e.type === "keydown";

    e.preventDefault();
    
    if (menuShowing) {
        runModifier = 0;
    }
    else if (keys[16]) { //Shift
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
        else if (menuShowing) {
            menu_ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            menuShowing = false;
        }
        else {
            drawMenu();
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

function clickHandler(e) {
    var mouseX = event.clientX;
    var mouseY = event.clientY;

    if (gameOverShowing) {
        var button = buttons["gameOver"];

        if (Math.abs(mouseX - button.x - button.width / 2) <= button.width / 2) {
            if (Math.abs(mouseY - button.y - button.height / 2) <= button.height / 2) {
                gameOverShowing = false;
                hasMoved = false;
                init();
            }
        }
    }
    else if (menuShowing) {
        var button = buttons["resume"];
        
        if (Math.abs(mouseX - button.x - button.width / 2) <= button.width / 2) {
            if (Math.abs(mouseY - button.y - button.height / 2) <= button.height / 2) {
                menuShowing = false;
                menu_ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            }
        }
    }
}

function eventListeners() {
    document.addEventListener("scroll", updateMap);

    document.addEventListener("keydown", keyPresses, event);
    document.addEventListener("keyup", keyPresses, event);

    document.addEventListener("click", clickHandler, event);

    document.addEventListener("mousewheel", function (event) { event.preventDefault() });
}

init();
