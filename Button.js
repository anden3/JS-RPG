var buttons = {};

var Button = function (opt) {
    this.x = opt.x;
    this.y = opt.y;

    this.width = opt.width;
    this.height = opt.height;

    this.text = opt.text;
    this.textX = opt.textX
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

        ctx.fillText(this.text, this.textX, this.y + 30);

        ctx.fill();
    ctx.closePath();
}
