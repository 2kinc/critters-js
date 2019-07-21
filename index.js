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
          if (obj.type == 'polygon') {
              if (obj.typetemp == 'rectangle') obj.points = [new moduleExports.Vector(0, 0), new moduleExports.Vector(obj.width, 0), new moduleExports.Vector(obj.width, obj.height), new moduleExports.Vector(0, obj.height)]
              obj.edges = [];
              var oblen = obj.points.length;
              for (var i = 0; i < oblen; i++) {
                obj.edges[i] = new moduleExports.Line(obj.points[i % oblen], obj.points[(i + 1) % (oblen)]);
              }
              that.context.save();
              that.context.translate((obj.x - that.cam.x) * that.cam.zoom, (obj.y - that.cam.y) * that.cam.zoom);
              that.context.rotate(obj.rotation * Math.PI / 180);
              that.context.strokeStyle = obj.outlineColor;
              that.context.lineWidth = obj.outlineWidth;
              that.context.moveTo(obj.points[0].x, obj.points[0].y);
              obj.points.forEach(a => that.context.lineTo(a.x, a.y));
              that.context.closePath();
              that.context.fillStyle = obj.color;
              that.context.fill();
              that.context.restore();
          } else if (obj.type == 'circle') {
            that.context.save();
            that.context.translate((obj.x - that.cam.x) * that.cam.zoom, (obj.y - that.cam.y) * that.cam.zoom);
            that.context.rotate(obj.rotation * Math.PI / 180);
            that.context.strokeStyle = obj.outlineColor;
            that.context.lineWidth = obj.outlineWidth;
            that.context.fillStyle = obj.color;
            that.context.arc(0, 0, obj.radius * that.cam.zoom, 0, Math.PI * 2);
            that.context.fill();
            that.context.restore();
          }
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
    // Vector constructor
    Vector: class Vector {
      constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
      }
      sum(...vectors) {
        var x = 0;
        var y = 0;
        vectors.forEach(function(vector) {
           x += vector.x;
           y += vector.y;
        });
        return new Vector(x, y);
      }
      add(vector) {
        return this.sum(this, vector);
      }
    },
    //Line constructor
    Line: class Line {
      constructor(start, end) {
        this.start = start || new moduleExports.Vector;
        this.end = end || new moduleExports.Vector;
      } static sum(...lines) {
        var result = new Line;
        lines.forEach(function (line) {
          result.start.x += line.start.x;
          result.start.y += line.start.y;
          result.end.x += line.end.x;
          result.end.y += line.end.y;
        });
        return result;
      } dist() {
        return 'hi';//(this.start.)
      } slope() {
        return -(this.start.y - this.end.y) / (this.start.x - this.end.x);
      } angle() {
        return Math.atan(this.slope()) * (180 / Math.PI);
      } add(line) {
        this.start.x += line.start.x;
        this.start.y += line.start.y;
        this.end.x += line.end.x;
        this.end.y += line.end.y;
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
          new moduleExports.Vector(0, 0), new moduleExports.Vector(width, 0), new moduleExports.Vector(width, height), new moduleExports.Vector(0, height)
        ], color, mass);
        for (var prop in poly) this[prop] = poly[prop];
        this.typetemp = 'rectangle';
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
        function pointinpolygon(point, vs) {
          var x = point.x, y = point.y;
          var inside = false;
          for (var i=0,j=vs.points.length - 1; i < vs.points.length; j = i++){
            var xi = vs.points[i].x + vs.x, yi = vs.points[i].y + vs.y;
            var xj = vs.points[j].x + vs.x, yj = vs.points[j].y + vs.y;
            var intersect = ((yi > y) != (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
              if (intersect) inside = !inside;
            }
            return inside;
        };
        var colliding = false;
        a.points.forEach(pnt=>{
          if (pointinpolygon(pnt.add({x:a.x,y:a.y}), b)) {colliding = true;}
        });
        if (colliding) return true;
        b.points.forEach(pnt=>{
          if (pointinpolygon(pnt.add({x:b.x,y:b.y}), a)) {colliding = true;}
        });
        if (colliding) return true;
        return false;
      }
    }
  };
  global.critters = global.critters || moduleExports;
})(this);
var $C = critters;
