/*
** login-animate.js 
** login页面动画
** 
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');
    var canvas = document.getElementById('login-about-canvas');

    (function(){

        if ( !canvas ) {
            return;
        }

        function getRandom(min, max) {
            return Math.floor(Math.random()*(max+1-min))+min;
        }

        function drawCircle(ctx, x, y, r, color) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2, false);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        }

        function drawLine(ctx, x1, y1, x2, y2) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = '#dddddd';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        function randomColor() {
            return 'rgba('+getRandom(0, 240)+','+getRandom(0,240)+','+getRandom(0,240)+','+Math.random().toFixed(1)+')'; 
        }

        //圆
        function Circle(x, y, r, color) {
            this.x = x;
            this.y = y;
            this.r = r;
            this.color = color;
        }

        Circle.prototype.draw = function(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        //线
        function Line(x1, y1, x2, y2) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
            this.ratio = Math.abs((x2-x1)/(y2-y1));
            this.dir = {
                x: (x2-x1) >= 0 ? 1 : -1,
                y: (y2-y1) >= 0 ? 1 : -1
            };
        }

        Line.prototype.getY = function(x) {
            return x/this.ratio;
        }
        Line.prototype.getX = function(y) {
            return y*this.ratio;
        }

        Line.prototype.draw = function(ctx) {
            ctx.beginPath();
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(this.x2, this.y2);
            ctx.strokeStyle = '#dddddd';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        //连接
        function Link( line, step ) {
            this.line = line;
            this.x = this.line.x1;
            this.y = this.line.y1;
            this.step = step || 5;
            this.stepx = this.step * this.line.dir.x;
            this.stepy = this.step * this.line.dir.y;   
        }

        Link.prototype.go = function(ctx, timmer) {

            if ( this.line.x2 - this.line.x1 > 0 ) {
                if ( this.x >= this.line.x2) {
                    console.log('..end');
                } else {
                    drawLine(ctx, this.x, this.y, (this.x += this.stepx), (this.y += this.line.getY(this.stepy))); 
                }
            } else {
                if ( this.x <= this.line.x2) {
                    console.log('..end');
                } else {
                    drawLine(ctx, this.x, this.y, (this.x += this.stepx), (this.y += this.line.getY(this.stepy))); 
                }
            }
        }

        var ctx = canvas.getContext('2d');

        var ctxWidth = canvas.width;
        var ctxHeight = canvas.height;
        var _R = 20;

        var countCircle = 10;

        var Circles = [];
        var Lines = [];
        var Links = [];

        //创建圆
        for ( var i = 10; i--; ) {

            var circle = new Circle(getRandom(_R, ctxWidth-_R), getRandom(_R, ctxHeight-_R), getRandom(10, 20), randomColor());
            circle.draw(ctx);
            Circles.push(circle);

        }

        //创建线 
        for ( var i = 0, len = Circles.length; i < len; i++ ) {
            for ( var j = i+1; j < len; j++ ) {
                Lines.push(new Line( Circles[i].x, Circles[i].y, Circles[j].x, Circles[j].y ));
            }
        }

        //创建连接
        for (var i = 0, len = Lines.length; i < len; i++) {
            //Lines[i].draw(ctx);
            Links.push( new Link(Lines[i]) );
        };

        var timmer = 0;

        //主循环
        function loop() {

            for ( var i=0, len=Links.length; i<len; i++ ) {
                Links[i].go(ctx, timmer);
            }

        }

        var timmer = setInterval(loop, 50);

    })();

});

