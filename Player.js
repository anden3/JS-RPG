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

    if (!hasMoved) {
        if (obj.tileValue >= 0.66) {
            init();
        }
        else {
            hasMoved = true;
        }
    }

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
                mobs[mob].hp -= 1;

                if (mobs[mob].hp < 1) {
                    mobs[mob].isDead = true;
                    entity_ctx.clearRect(mobs[mob].x, mobs[mob].y, mobs[mob].width, mobs[mob].height);

                    obj.score += 1;
                    obj.drawScore(obj);
                }
            }
        }
    }
}
