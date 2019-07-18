(function (global){
  var moduleExports = {
    World: function (bgcolor, parent, width, height, camx, camy, gravity, customprops) {
      //Get everything started
      var that = this;
      this.cam = {};
      this.cam.x = camx;
      this.cam.y = camy;
      this.cam.zoom = 1;
      this.color = bgcolor;
      this.width = width;
      this.height = height;
      this.el = document.createElement('canvas');
      this.el.width = this.width;
      this.el.height = this.height;
      this.parent = parent || document.body;
      this.parent.appendChild(this.el);
      this.context = this.el.getContext('2d');
      this.gravity = gravity;
      if (customprops) for (prop in customprops) this[prop] = customprops[prop];
      this.keys = {};
      this.objects = new Map();
      this.set = (...obs) => obs.forEach(ob=>this.objects.set(ob.name, ob));
      this.get = ob => this.objects.get(ob);
      this.$ = this.get;
      this.paused = true;
      this.update = function () {/*This is for users update (updates every second)*/ };
      this.mainUpdate = function () { //updates every second
        that.context.beginPath();
        that.context.fillStyle = that.color;
        that.context.fillRect(0, 0, that.width, that.height);
        that.context.fill();
        that.objects.forEach(function (obj) {
          that.context.save();
          that.context.translate((obj.x - that.cam.x) * that.cam.zoom, (obj.y - that.cam.y) * that.cam.zoom);
          that.context.rotate(obj.rotation * Math.PI / 180);
          that.context.strokeStyle = obj.outlineColor;
          that.context.lineWidth = obj.outlineWidth;
          that.context.fillStyle = obj.color;
          if (obj.type == 'polygon' || obj.type == 'rectangle') {
              if (obj.type == 'rectangle') obj.points = [new moduleExports.Point(0, 0), new moduleExports.Point(obj.width, 0), new moduleExports.Point(obj.width, obj.height), new moduleExports.Point(0, obj.height)]
              obj.edges = [];
              for (var i = 0; i < obj.points.length; i++) {
                obj.edges[i] = new moduleExports.Vector(obj.points[i % obj.points.length], obj.points[(i + 1) % (obj.points.length)]);
                var c = ((obj.points[(i + 1) % (obj.points.length)].x - obj.points[(i + 2) % (obj.points.length)].x)**2 + (obj.points[(i + 1) % (obj.points.length)].y - obj.points[(i  + 2) % (obj.points.length)].y)**2) ** (1/2);
                var a = ((obj.points[(i) % (obj.points.length)].x - obj.points[(i + 2) % (obj.points.length)].x)**2 + (obj.points[(i) % (obj.points.length)].y - obj.points[(i + 2) % (obj.points.length)].y)**2) ** (1/2);
                var b = ((obj.points[(i) % (obj.points.length)].x - obj.points[(i + 1) % (obj.points.length)].x)**2 + (obj.points[(i) % (obj.points.length)].y - obj.points[(i + 1) % (obj.points.length)].y)**2) ** (1/2);
                obj.points[i].angle = (Math.acos((a**2+b**2-c**2)/(2*a*b)))*(180/3.1415);
              }
              that.context.moveTo(obj.points[0].x, obj.points[0].y);
              obj.points.forEach(a => that.context.lineTo(a.x, a.y));
              that.context.fill();
              that.context.closePath();
          } else if (obj.type == 'circle') {
            that.context.arc(0, 0, obj.radius * that.cam.zoom, 0, Math.PI * 2);
            that.context.fill();
          }
          that.context.restore();

        });
      };
      this.frame = function () {
        if (that.paused) return;
        that.update();
        that.mainUpdate();
        requestAnimationFrame(that.frame);
      };
      (this.start = () => {
        requestAnimationFrame(this.frame);
        this.paused = false;
      })();
      this.stop = () => this.paused = true;
    },
    // Point constructor
    Point: class Point {
      constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
      }
      static sum(...points) {
        var x = 0;
        var y = 0;
        points.forEach(function(point) {
           x += point.x;
           y += point.y;
        });
        return new Point(x, y);
      }
    },
    //Vector constructor
    Vector: class Vector {
      constructor(start, end) {
        this.start = start || new moduleExports.Point;
        this.end = end || new moduleExports.Point;
      }
      static sum(...vectors) {
        var result = new Vector;
        vectors.forEach(function (vector) {
          result.start.x += vector.start.x;
          result.start.y += vector.start.y;
          result.end.x += vector.end.x;
          result.end.y += vector.end.y;
        });
        return result;
      }
      angle(d) {
        return Math.atan((this.start.y - this.end.y) / (this.start.x - this.end.x)) * (180 / Math.PI);
      }
      add(vector) {
        this.start.x += vector.start.x;
        this.start.y += vector.start.y;
        this.end.x += vector.end.x;
        this.end.y += vector.end.y;
        return this;
      }
    },
    //Polygon constructor
    Polygon: class Polygon {
      constructor(name, x, y, points, color, mass, customprops) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.type = 'polygon';
        this.points = points;
        this.edges = [];
        this.rotation = 0;
        this.color = color;
        this.mass = mass || 1;
        this.outlineColor = "transparent";
        this.outlineWidth = 1;
        for (var customprop in customprops) {
          this[customprop] = customprops[customprop];
        }
      }
    },
    Rectangle : class Rectangle {
      constructor(name, x, y, width, height, color, mass) {
        var poly = new moduleExports.Polygon(name, x, y, [
          new moduleExports.Point(0, 0), new moduleExports.Point(width, 0), new moduleExports.Point(width, height), new moduleExports.Point(0, height)
        ], color, mass);
        for (var prop in poly) this[prop] = poly[prop];
        this.type = 'rectangle';
        this.width = width;
        this.height = height;
      }
    },
    Circle : class Circle {
      constructor (name, x, y, radius, color, mass) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.type = 'circle';
        this.radius = radius;
        this.color = color;
        this.mass = mass;
      }
    },
    Collision: function (a, b) {
      if (a.type == 'polygon' && b.type == 'polygon') {
        console.log(a.edge);
      }
    }
  };
  global.critters = global.critters || moduleExports;
})(this);
var $C = critters;
