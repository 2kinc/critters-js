function World(parent, bgcolor, width, height, camx, camy, gravity, customProperties) {
  var that = this;
  this.cam = {};
  this.cam.x = camx || 0;
  this.cam.y = camy || 0;
  this.cam.zoom = 1;
  this.bgcolor = bgcolor || 'white';
  this.width = width || 500;
  this.height = height || 500;
  this.el = document.createElement('canvas');
  this.el.width = this.width;
  this.el.height = this.height;
  this.parent = parent || document.body;
  this.parent.appendChild(this.el);
  this.context = this.el.getContext('2d');
  this.gravity = gravity || { x: 0, y: 0 };
  this.objects = new Map(); //where all the objects go
  this.keys = {};
  this.stopped = false;
  this.atmosphere = {
    density: 1
  };
  if (customProperties) {
    for (const property of customProperties) {
      this[property] = customProperties[property];
    }
  }
  document.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = e.type = true);
  document.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
  this.Polygon = function(name, x, y, points, color, mass) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.points = points;
    this.coords = JSON.parse(JSON.stringify(this.points));
    this.coords.forEach((a, b) => {
      a[0] += this.x;
      a[1] += this.y;
    });
    this.edges = [];
    for (i=0;i<points.length;i++) {
      console.log(this.coords[(i+1)%points.length]);
      this.edges[i] = [this.coords[i%points.length], this.coords[(i+1)%points.length]];
    }
    this.type = 'polygon';
    if (mass) {
      this.rigidBody = true;
      this.gravity = true;
    }
    this.mass = mass || 1;
    this.acceleration = {x:0,y:0};
    this.color = color;
  };
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
  this.Image = function (name, x, y, width, height, src, mass) {
    this.name = name;
    this.x = x;
    if (mass) {
      this.rigidBody = true;
      this.gravity = true;
    }
    this.mass = mass || 1;
    this.y = y;
    this.src = src;
    this.type = 'image';
    this.acceleration = { x: 0, y: 0 };
    this.width = width;
    this.height = height;
  };
  this.Text = function (name, x, y, text, size, family, color, mass) {
    this.name = name;
    this.x = x;
    this.text = text;
    if (mass) {
      this.rigidBody = true;
      this.gravity = true;
    }
    this.mass = mass || 1;
    this.y = y;
    this.type = 'text';
    this.acceleration = { x: 0, y: 0 };
    this.size = size;
    this.family = family;
    this.color = color;
  };
  this.mouse = { x: 0, y: 0 };
  that.el.onmousemove = function (e) {
    that.mouse.x = e.clientX;
    that.mouse.y = e.clientY;
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
    moving = {
      right: previous.x < object.x,
      left: previous.x > object.x,
      up: previous.y < object.y,
      down: previous.y > object.y
    };
    if (object.rigidBody === true) {
      that.objects.forEach(function (obj) {
        if (obj != object && obj.rigidBody === true && that.collisionWith(object, obj)) {
          var col = that.collisionWith(object, obj, true);
          if (col.down || col.up) { col.right = false; col.left = false; }
          if (col.right || col.left) { col.down = false; col.up = false; }
          if (col.down || col.up) object.y = previous.y;
          if (col.right || col.left) object.x = previous.x;
          that.addForce({
            x: (col.left || col.right) ? object.acceleration.x : 0,
            y: (col.down || col.up) ? object.acceleration.y : 0
          }, obj);
          that.addForce({
            x: (col.left || col.right) ? -object.acceleration.x : 0,
            y: (col.down || col.up) ? -object.acceleration.y : 0
          }, object);
        }
      });
    }
  }
  this.set = (...objs) => { objs.forEach(obj => that.objects.set(obj.name, obj)) };  //set the object
  this.get = (name) => { return that.objects.get(name) }; //get the object
  this.update = function () {/*Happens every second*/ };
  this.drawFrame = function () { //Also happens every second
    that.context.beginPath();
    that.context.fillStyle = that.bgcolor;
    that.context.fillRect(0, 0, that.width, that.height);
    that.context.fill();
    that.objects.forEach(function (obj) {
      if (obj.type == 'circle') {
        that.context.save();
        that.context.translate((obj.x - that.cam.x) * that.cam.zoom, (obj.y - that.cam.y) * that.cam.zoom);
        that.context.fillStyle = obj.color;
        that.context.arc(0, 0, obj.radius * that.cam.zoom, 0, 6.283185);
        that.context.fill();
        that.context.restore();
      }
      else if (obj.type == 'rectangle') {
        that.context.save();
        that.context.translate((obj.x - that.cam.x) * that.cam.zoom, (obj.y - that.cam.y) * that.cam.zoom);
        that.context.fillStyle = obj.color;
        that.context.fillRect(0, 0, obj.width * that.cam.zoom, obj.height * that.cam.zoom);
        that.context.restore();
      }
      else if (obj.type == 'image') {
        that.context.save();
        that.context.translate((obj.x - that.cam.x) * that.cam.zoom, (obj.y - that.cam.y) * that.cam.zoom);
        that.context.scale((obj.flip ? -1 : 1), 1)
        var image = new Image();
        image.src = obj.src;
        that.context.drawImage(image, 0, 0, obj.width * that.cam.zoom, obj.height * that.cam.zoom);
        that.context.restore();
      }
      else if (obj.type == 'text') {
        that.context.save();
        that.context.translate((obj.x - that.cam.x) * that.cam.zoom, (obj.y - that.cam.y) * that.cam.zoom);
        that.context.fillStyle = obj.color;
        that.context.font = (obj.size * that.cam.zoom) + 'px ' +  obj.family;
        that.context.fillText(obj.text, 0, 0);
        that.context.restore();
      }
      else if (obj.type == 'polygon') {
        obj.coords = JSON.parse(JSON.stringify(obj.points));
        obj.coords.forEach((a, b) => {
          a[0] += obj.x;
          a[1] += obj.y;
        });
        obj.edges = [];
        for (i=0;i<obj.points.length;i++) {
          obj.edges[i] = [obj.coords[i%obj.points.length], obj.coords[i%obj.points.length+1]];
        }
        that.context.save();
        that.context.translate((obj.x - that.cam.x) * that.cam.zoom, (obj.y - that.cam.y) * that.cam.zoom);
        that.context.fillStyle = obj.color;
        that.context.moveTo(obj.points[0][0] + obj.x, obj.points[0][1] + obj.y);
        for (var i = 1; i < obj.points.length; i++) {
          that.context.lineTo(obj.points[i][0] + obj.x, obj.points[i][1] + obj.y);
        }
        that.context.closePath();
        that.context.fill();
        that.context.restore();
      }
    });
  };
  this.collisionWith = function (obj1, obj2, rlud) {
    rlud = rlud || false;
    if (obj1.type == 'rectangle' && obj2.type == 'rectangle') {
      if (!rlud) return !(obj2.x > obj1.x + obj1.width || obj2.x + obj2.width < obj1.x || obj2.y > obj1.y + obj1.height || obj2.y + obj2.height < obj1.y)
      if (rlud) {
        var d = !(obj2.x > obj1.x + obj1.width || obj2.x + obj2.width < obj1.x || obj2.y > obj1.y + obj1.height || obj2.y + obj2.height < obj1.y);
        var ob = { down: false, up: false, right: false, left: false };
        if (!d) return ob;
        if (obj1.y + obj1.height < obj2.y + obj2.height / 2) ob.down = true;
        if (obj1.y > obj2.y + obj2.height / 2) ob.up = true;
        if (obj1.x > obj2.x + obj2.width / 2) ob.left = true;
        if (obj1.x + obj1.width < obj2.x + obj2.width / 2) ob.right = true;
        return ob;
      }
    }
    if (obj1.type == 'rectangle' && obj2.type == 'circle') {
      var circle = obj2;
      var rect = obj1;
      if (!rlud) {
        var distX = Math.abs(circle.x - rect.x - rect.width / 2);
        var distY = Math.abs(circle.y - rect.y - rect.height / 2);
        if (distX > (rect.width / 2 + circle.radius)) return false;
        if (distY > (rect.height / 2 + circle.radius)) return false;
        if (distX <= (rect.width / 2)) return true;
        if (distY <= (rect.height / 2)) return true;
        var dx = distX - rect.width / 2;
        var dy = distY - rect.height / 2;
        return (dx * dx + dy * dy <= (circle.radius ** 2));
      } if (rlud) {
        var ob = { right: false, left: false, up: false, down: false };
        var distX = Math.abs(circle.x - rect.x - rect.width / 2);
        var distY = Math.abs(circle.y - rect.y - rect.height / 2);
        if (distX > (rect.width / 2 + circle.radius)) return ob;
        if (distY > (rect.height / 2 + circle.radius)) return ob;
        var dx = distX - rect.width / 2;
        var dy = distY - rect.height / 2;
        var d = (dx * dx + dy * dy <= (circle.radius ** 2));
        if (!d) return ob;
        if (rect.x > circle.x + circle.radius) ob.right = true;
        if (rect.y + rect.height < circle.y + circle.radius) ob.down = true;
        if (rect.y > circle.y + circle.radius) ob.up = true;
        if (rect.x > circle.x + circle.radius) ob.left = true;
        if (rect.x + rect.width < circle.x + circle.radius) ob.right = true;
        return ob;
      }
    }
    if (obj1.type == 'circle' && obj2.type == 'rectangle') {
      var circle = obj1;
      var rect = obj2;
      var distX = Math.abs(circle.x - rect.x - rect.width / 2);
      var distY = Math.abs(circle.y - rect.y - rect.height / 2);
      if (distX > (rect.width / 2 + circle.radius)) return false;
      if (distY > (rect.height / 2 + circle.radius)) return false;
      if (distX <= (rect.width / 2)) return true;
      if (distY <= (rect.height / 2)) return true;
      var dx = distX - rect.width / 2;
      var dy = distY - rect.height / 2;
      return (dx * dx + dy * dy <= (circle.r ** 2));
    }
    if (obj1.type == 'circle' && obj2.type == 'circle') {
      if (!rlud) return ((obj2.x - obj1.x) ** 2 + (obj2.y - obj1.y) ** 2 <= (obj1.radius + obj2.radius) ** 2);
      if (rlud) {
        var d = ((obj2.x - obj1.x) ** 2 + (obj2.y - obj1.y) ** 2 <= (obj1.radius + obj2.radius) ** 2);
        if (!d) return false;
        //var
        //if ()
      }
    }
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
    if (that.stopped) return;
    that.physics();
    that.update();
    that.drawFrame();
    requestAnimationFrame(that.animationFrame);
  }
  this.start = () => {
    requestAnimationFrame(that.animationFrame);
    that.stopped = false
  };
  this.stop = () => that.stopped = true;
}
