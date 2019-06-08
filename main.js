function World(parent, bgcolor, width, height, camx, camy, gravity, customProperties) {
  var that = this;
  this.cam = {};
  this.cam.x = camx || 0;
  this.cam.y = camy || 0;
  this.bgcolor = bgcolor || 'white';
  this.width = width || 500;
  this.height = height || 500;
  this.el = document.createElement('canvas');
  this.el.width = this.width;
  this.el.height = this.height;
  this.parent = parent || document.body;
  this.parent.appendChild(this.el);
  this.context = this.el.getContext('2d');
  this.gravity = gravity || {x: 0, y: 0};
  this.objects = new Map(); //where all the objects go
  this.keys = {};
  this.atmosphere = {
    density: 1
  };
  if (customProperties) {
    for (const customProperty of customProperties) {
      this[customProperty] = customProperties[customProperty];
    }
  }
  document.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = e.type = true);
  document.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
  this.Rectangle = function (name, x, y, width, height, color, mass) {
    this.name = name;
    this.x = x;
    this.type = 'rectangle';
    this.y = y;
    this.width = width;
    if (mass) {
      this.rigidBody = true;
      this.gravity = true;
    }
    this.mass = mass || 1;
    this.acceleration = { x: 0, y: 0 };
    this.height = height;
    this.color = color;
  }
  this.Circle = function (name, x, y, radius, color, mass) {
    this.name = name;
    if (mass) {
      this.rigidBody = true;
      this.gravity = true;
    }
    this.mass = mass || 1;
    this.x = x;
    this.type = 'circle';
    this.y = y;
    this.radius = radius;
    this.acceleration = { x: 0, y: 0 };
    this.color = color;
  }
  this.Image = function (name, x, y, width, height, src, flip, mass) {
    this.name = name;
    this.x = x;
    if (mass) {
      this.rigidBody = true;
      this.gravity = true;
    }
    this.mass = mass || 1;
    this.y = y;
    this.src = src;
    this.flip = flip;
    this.type = 'image';
    this.acceleration = { x: 0, y: 0 };
    this.width = width;
    this.height = height;
  }
  this.addForce = function (force, object) {
    object.acceleration.x += (force.x / (object.mass || 1)) || 0;
    object.acceleration.y += (force.y / (object.mass || 1)) || 0;
  }
  this.translate = function (vector, object) {
    var previous = {
      x: object.x,
      y: object.y
    };
    object.x += vector.x || 0;
    object.y += vector.y || 0;
    if (object.rigidBody === true) {
      that.objects.forEach(function (obj){
        if (obj != object && obj.rigidBody === true && that.collisionWith(object, obj)) {
          object.x = previous.x;
          object.y = previous.y;
          that.addForce({
            x: object.acceleration.x,
            y: object.acceleration.y
          }, obj);
          that.addForce({
            x: object.acceleration.x * -2,
            y: object.acceleration.y * -2
          }, object);
        }
      });
    }
  }
  this.set = (...objs) => {objs.forEach(obj=>that.objects.set(obj.name, obj))};  //set the object
  this.get = (name) => { return that.objects.get(name) }; //get the object
  this.update = function () {/*Happens every second*/ };
  this.collisionWith = function (obj1, obj2) {
    if (obj1.type == 'rectangle' && obj2.type == 'rectangle') {
      return !(obj2.x > obj1.x + obj1.width || obj2.x + obj2.width < obj1.x || obj2.y > obj1.y + obj1.height || obj2.y + obj2.height < obj1.y)
    }
    if (obj1.type == 'rectangle' && obj2.type == 'circle') {
      var circle = obj2;
      var rect = obj1;
      var distX = Math.abs(circle.x - rect.x-rect.width/2);
      var distY = Math.abs(circle.y - rect.y-rect.height/2);
      if (distX > (rect.width/2 + circle.radius)) { return false; }
      if (distY > (rect.height/2 + circle.radius)) { return false; }
      if (distX <= (rect.width/2)) { return true; }
      if (distY <= (rect.height/2)) { return true; }
      var dx=distX-rect.width/2;
      var dy=distY-rect.height/2;
      return (dx*dx+dy*dy<=(circle.radius**2));
    }
    if (obj1.type == 'circle' && obj2.type == 'rectangle') {
      var circle = obj1;
      var rect = obj2;
      var distX = Math.abs(circle.x - rect.x-rect.width/2);
      var distY = Math.abs(circle.y - rect.y-rect.height/2);
      if (distX > (rect.width/2 + circle.radius)) { return false; }
      if (distY > (rect.height/2 + circle.radius)) { return false; }
      if (distX <= (rect.width/2)) { return true; }
      if (distY <= (rect.height/2)) { return true; }
      var dx=distX-rect.width/2;
      var dy=distY-rect.height/2;
      return (dx*dx+dy*dy<=(circle.r**2));
    }
    if (obj1.type == 'circle' && obj2.type == 'circle') {
      return ((obj2.x - obj1.x) ** 2 + (obj2.y - obj1.y) ** 2 <= (obj1.radius + obj2.radius) ** 2);
    }
  }
  this.drawFrame = function () { //Also happens every second
    that.context.beginPath();
    that.context.fillStyle = that.bgcolor;
    that.context.fillRect(0, 0, that.width, that.height);
    that.context.fill();
    that.objects.forEach(function (obj) {
      if (obj.type == 'circle') {
        that.context.save();
        that.context.translate(obj.x - that.cam.x, obj.y - that.cam.y);
        that.context.fillStyle = obj.color;
        that.context.arc(0, 0, obj.radius, 0, 6.283185);
        that.context.fill();
        that.context.restore();
      }
      if (obj.type == 'rectangle') {
        that.context.save();
        that.context.translate(obj.x - that.cam.x, obj.y - that.cam.y);
        that.context.fillStyle = obj.color;
        that.context.fillRect(0, 0, obj.width, obj.height);
        that.context.restore();
      }
      if (obj.type == 'image') {
        that.context.save();
        that.context.translate(obj.x - that.cam.x, obj.y - that.cam.y);
        that.context.scale((obj.flip ? -1 : 1), 1)
        var image = new Image();
        image.src = obj.src;
        that.context.drawImage(image, 0, 0, obj.width, obj.height);
        that.context.restore();
      }
    });
  }
  this.physics = function () {
    that.objects.forEach(function (obj) {
      if (obj.rigidBody && obj.gravity) {
        that.addForce(that.gravity, obj);
      } //gravity
      that.translate(obj.acceleration, obj); //move the object, acceleration
      obj.acceleration.x *= that.atmosphere.density / 1.1; //friction
      obj.acceleration.y *= that.atmosphere.density / 1.1;
      if (Math.abs(0 - obj.acceleration.x) < 0.9) {
        obj.acceleration.x = 0;
      }
      if (Math.abs(0 - obj.acceleration.y) < 0.9) {
        obj.acceleration.y = 0;
      }
    });
  }
  this.animationFrame = function () {
    that.physics();
    that.update();
    that.drawFrame();

    requestAnimationFrame(that.animationFrame);
  }
  this.start = () => requestAnimationFrame(that.animationFrame);
}
