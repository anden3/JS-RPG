var mobAmount = 100;
var mobs = [];

var Mob = function (id, color) {
    var ctx = entity_ctx;

    this.id = id;

    this.x = Math.floor(window.innerWidth * scalingX * Math.random() / 10) * 10;
    this.y = Math.floor(window.innerHeight * scalingY * Math.random() / 10) * 10;

    this.width = 10;
    this.height = 10;

    this.color = color;

    this.hp = Math.ceil(Math.random() * 4);

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

    switch (this.hp) {
        case 4:
            ctx.fillStyle = "green";
            break;
        case 3:
            ctx.fillStyle = "yellow";
            break;
        case 2:
            ctx.fillStyle = "orange";
            break;
        case 1:
            ctx.fillStyle = "red";
            break;
    }

    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.closePath();
}

function drawMobs() {
    mobs = [];

    for (var n = 0; n < mobAmount; n++) {
        window["mob_" + n] = new Mob(n, "green");
    }

    moveMobs();
}

function moveMobs() {
    for (var mob = 0; mob < mobs.length; mob++) {
        if (!mobs[mob].isDead && !menuShowing) {
            mobs[mob].move();
        }
    }

    window["mobsLoop"] = setTimeout(moveMobs, 1000);
}
