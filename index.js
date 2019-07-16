(function (global){
  var module = {
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
      this.set = ob => this.objects.set(ob.name, ob);
      this.get = ob => this.objects.get(ob);
      this.$ = this.get;
      this.paused = true;
      this.update = function() {/*This is for users update (updates every second)*/};
      this.mainUpdate = function() { //updates every second
        that.context.beginPath();
        that.context.fillStyle = that.color;
        that.context.fillRect(0, 0, that.width, that.height);
        that.context.fill();
        that.objects.forEach(function(obj) {
          that.context.save();
          that.context.translate((obj.x - that.cam.x) * that.cam.zoom, (obj.y - that.cam.y) * that.cam.zoom);
          that.context.fillStyle = obj.color;
          if (obj.type == 'polygon') {
              obj.points.forEach(function() {

              });
              that.context.moveTo(obj.points[0].x + obj.x, obj.points[0].y + obj.y);
              obj.points.forEach(function(a) {
                that.context.lineTo(a.x + obj.x, a.y + obj.y);
              });
              that.context.fill();
              that.context.closePath();
          }
          that.context.restore();
        });
      };
      this.frame = function() {
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
      static sum (...points){
        var x = 0;
        var y = 0;
        points.forEach(function(point) {
           x += point.x;
           y += point.y;//very nice, or should i say, varry nice :}
        });
        return new Point(x, y); //rip water sheep https://www.google.com/search?q=rip+water+sheep&safe=strict&rlz=1C1DKCZ_enUS786US786&source=lnms&tbm=isch&sa=X&ved=0ahUKEwi7pOvhorfjAhWSQc0KHcLLCtkQ_AUIECgB&biw=1280&bih=617#imgrc=w325HGUJ-FvmMM:
      }
    },
    //Vector constructor
    Vector: class Vector {
      constructor(start, end) {
        this.start = start || new module.Point;
        this.end = end || new module.Point;
      }
      static sum (...vectors) {
        var result = new Vector; //no need for parentheses
        vectors.forEach(function(vector) {
          result.start.x += vector.start.x;
          result.start.y += vector.start.y;
          result.end.x += vector.end.x;
          result.end.y += vector.end.y;
        });
        return result;
      }
      add (vector) {
        this.start.x += vector.start.x;
        this.start.y += vector.start.y;
        this.end.x += vector.end.x;
        this.end.y += vector.end.y;
        return this;
      }
    },
    //Polygon constructor
    Polygon : class Polygon {
      constructor(name, x, y, points, color, mass) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.type = 'polygon';
        this.points = points;
        this.edges = [];
        this.color = color;
        this.mass = mass || 1;
      }
    }
  };
  global.critters = global.critters || module;
})(this);
