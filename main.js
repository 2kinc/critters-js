function World(parent, bgcolor, width, height, camx, camy) {
  var that = this;
  this.cam = {};
  this.cam.x = camx || 0;
  this.cam.y = camy || 0;
  this.bgcolor = bgcolor || 'white';
  this.width = width || 500;
  this.height = width || 500;
  this.el = document.createElement('canvas');
  this.el.width = this.width;
  this.el.height = this.height;
  this.parent = parent || document.body;
  this.parent.appendChild(this.el);
  this.context = this.el.getContext('2d');
  this.objects = new Map(); //where all the objects go
  this.keys = {};
  document.addEventListener('keydown', e=>this.keys[e.key.toLowerCase()]=e.type=true);
  document.addEventListener('keyup', e=>this.keys[e.key.toLowerCase()]=false);
  this.Rectangle = function(name, x, y, width, height, color, mass) {
    this.name = name;
    this.x = x;
    this.type = 'rectangle';
    this.y = y;
    this.width = width;
    this.mass = mass || 1;
    this.acceleration = {x: 0,y: 0};
    this.height = height;
    this.color = color;
  }
  this.Circle = function(name, x, y, radius, color, mass) {
    this.name = name;
    this.mass = mass || 1;
    this.x = x;
    this.type = 'circle';
    this.y = y;
    this.radius = radius;
    this.acceleration = {x: 0,y: 0};
    this.color = color;
  }
  this.Image = function(name, x, y, src, width, height, color, mass) {
    this.name = name;
    this.x = x;
    this.mass = mass || 1;
    this.y = y;
    this.src = src;
    this.type = 'image';
    this.acceleration = {x: 0,y: 0};
    this.width = width;
    this.height = height;
    this.color = color;
  }
  this.set = (obj) => that.objects.set(obj.name, obj);  //set the object
  this.get = (name) => {return that.objects.get(name)}; //get the object
  this.update = function() {/*Happens every second*/};
  this.drawFrame = function() { //Also happens every second
    that.context.beginPath();
    that.context.fillStyle = that.bgcolor;
    that.context.fillRect(0, 0, that.width, that.height);
    that.context.fill();
    that.objects.forEach(function(obj) {
      if (obj.type == 'circle') {
        that.context.beginPath();
        that.context.fillStyle = obj.color;
        that.context.arc(obj.x - that.cam.x, obj.y - that.cam.y, obj.radius, 0, 6.283185);
        that.context.fill();
      }
      if (obj.type == 'rectangle') {
        that.context.beginPath();
        that.context.fillStyle = obj.color;
        that.context.fillRect(obj.x - that.cam.x, obj.y - that.cam.y, obj.width, obj.height);
        that.context.closePath();
      }
    });
    requestAnimationFrame(that.drawFrame);
  }
  this.animationFrame = function () {
    that.drawFrame();
    that.update();
    requestAnimationFrame(that.animationFrame);
  }
  this.start = () => requestAnimationFrame(that.animationFrame);
}
