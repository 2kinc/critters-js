function world(width, height, x, y) {
    this.width = width || 500;
    this.height = height || 500;
    this.x = x || 0;
    this.y = y || 0;
    this.el = document.createElement('div');
    this.el.style.width = this.width + 'px';
    this.el.style.height = this.height + 'px';
    this.el.style.position = "absolute";
    this.el.style.top = this.y + "px";
    this.el.style.left = this.x + "px";
    this.things = [];
    localworld = this;
    this.rect = function(x, y, w, h, deg, color, name) {
        this.x = x || 0;
        this.y = y || 0;
        this.deg = deg || 0;
        this.width = w || 50;
        this.height = h || 50;
        this.color = color || 'black';
        this.name = name;
        this.el = document.createElement('span');
        this.el.style.width = this.width + 'px';
        this.el.style.height = this.height + 'px';
        this.el.style.fontSize = "0.1px";
        this.el.style.background = this.color;
        this.el.style.position = "absolute";
        localworld.el.appendChild(this.el);
        localworld.things.push(this);
        this.isCollided = (rect1,rect2)=>{
            if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
                return true;
            }
            return false;
        }
        (this.transform = ()=>{
            for (i = 0; i < localworld.things.length; i++) {
                this.el.style.transform = "rotate(" + this.deg + "deg) translate(" + this.x + "px," + this.y + "px)";
                this.el.style.transformOrigin = this.x + this.width / 2 + 'px ' + this.y + this.height / 2 + 'px';
            }
        }
        )();
        (this.turn = (deg)=>{
            this.deg += deg;
            this.transform();
        }
        )(0);
        (this.movex = (move)=>{
            if (this.x + move + this.width < localworld.width && this.x + move > 0) {
                this.x += move;
                this.transform()
            } else if (this.x + move >= localworld.width) {
                this.x = localworld.width - this.width;
                this.transform();
            } else if (this.x + move <= 0) {
                this.x = 0;
                this.transform();
            }
        }
        )(0);
        (this.movey = (move)=>{
            if (this.y + move + this.height < localworld.height && this.y + move > 0) {
                this.y += move;
                this.transform()
            } else if (this.y + move >= localworld.height) {
                this.y = localworld.height - this.height;
                this.transform();
            } else if (this.y + move <= 0) {
                this.y = 0;
                this.transform()
            }
        }
        )(0);
    }
    this.critter = function(x, y, w, h, deg, inside, name) {
        this.width = w || 50;
        this.height = h || 50;
        this.el = document.createElement('span');
        this.el.style.width = this.width + 'px';
        this.el.style.height = this.height + 'px';
        this.name = name;
        this.x = x;
        this.y = y;
        this.deg = deg;
        this.el.style.position = 'absolute';
        this.el.style.fontSize = "36px";
        this.el.style.lineHeight = "50px";
        this.el.style.textAlign = "center";
        this.el.style.transition = "150ms linear";
        this.el.style.userSelect = "none";
        localworld.el.appendChild(this.el);
        localworld.things.push(this);
        this.el.innerHTML = inside || Math.random().toString(36).substring(7).charAt(1);
        this.stop = false;
        this.delete = ()=> this.el.parentElement.removeChild(this.el);
        this.isCollided = (rect1,rect2)=>{
            if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
                return true;
            }
            return false;
        }
        (this.transform = ()=>{
            this.el.style.transform = "rotate(" + this.deg + "deg) translate(" + this.x + "px," + this.y + "px)";
            this.el.style.transformOrigin = (this.x + this.width / 2) + 'px ' + (this.y + this.height / 2) + 'px'
        }
        )();
        (this.turn = (deg)=>{
            this.deg += deg;
            this.transform();
        }
        )(0);
        (this.movex = (move)=>{
            if (this.x + move + this.width < localworld.width && this.x + move > 0 && !this.stop) {
                this.x += move;
                this.transform()
            } else if (this.x + move >= localworld.width) {
                this.x = localworld.width - this.width;
                this.transform();
            } else if (this.x + move <= 0) {
                this.x = 0;
                this.transform()
            }
        }
        )(0);
        (this.movey = (move)=>{
            if (this.y + move + this.height < localworld.height && this.y + move > 0 && !this.stop) {
                this.y += move;
                this.transform()
            } else if (this.y + move >= localworld.height) {
                this.y = localworld.height - this.height;
                this.transform();
            } else if (this.y + move <= 0) {
                this.y = 0;
                this.transform()
            }
        }
        )(0)
        this.rove = (intensity)=>{
            this.movex(Math.random() * intensity - (intensity / 2));
            this.movey(Math.random() * (intensity) - (intensity / 2));
        }
        this.activate = ()=>{
        }
    }
}
