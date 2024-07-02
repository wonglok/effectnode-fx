import { Color, CubeTexture } from "three";

const easeOutSine = (t, b, c, d) => {
  return c * Math.sin((t / d) * (Math.PI / 2)) + b;
};

const easeOutQuad = (t, b, c, d) => {
  t /= d;
  return -c * t * (t - 2) + b;
};

export const getCanvasCube = () => {
  //
  let tex = new TouchTexture();
  let cubeTexture = new CubeTexture([
    tex.canvas,
    tex.canvas,
    tex.canvas,
    tex.canvas,
    tex.canvas,
    tex.canvas,
  ]);

  return {
    tex,
    tCube: cubeTexture,
    compute: () => {
      if (Math.random() < 1) {
        tex.addTouch({
          x: Math.random(),
          y: Math.random(),
        });
      }
      if (Math.random() < 0.8) {
        tex.addTouch({
          x: Math.random(),
          y: Math.random(),
        });
      }

      tex.update();
      cubeTexture.needsUpdate = true;
    },
  };
};

// implemnetation
class TouchTexture {
  constructor() {
    this.size = 64;
    this.width = 64;
    this.height = 64;
    this.width = this.height = this.size;

    this.maxAge = 350;
    this.radius = 0.1 * this.size;
    // this.radius = 0.15 * 1000

    this.speed = 2.33 / this.maxAge;
    // this.speed = 0.01

    this.trail = [];
    this.last = null;

    this.colorDot = new Color("#ffffff");
    this.colorBG = new Color("#00ffff");
    this.hueSpread = 5 / 10;

    // try {
    //   env.getSetting("canvas-texture-dot").stream((v) => {
    //     this.colorDot.set(v);
    //   }, "hex");
    // } catch (e) {}
    // try {
    //   env.getSetting("hue-spread").stream((v) => {
    //     // console.log(v)
    //     this.hueSpread = Number(v) / 10;
    //   });
    // } catch (e) {}
    // try {
    //   env.getSetting("canvas-texture-bg").stream((v) => {
    //     this.colorBG.set(v);
    //   }, "hex");
    // } catch (e) {}

    this.initTexture();
  }

  get hueDot() {
    let hue = this.colorDot.getHSL(this.colorDot).h;
    return (hue * 360).toFixed(0);
  }
  get satuationDot() {
    let satuation = this.colorDot.getHSL(this.colorDot).s;
    return (satuation * 100).toFixed(0);
  }
  get lightnessDot() {
    let lightness = this.colorDot.getHSL(this.colorDot).l;
    return (lightness * 100).toFixed(0);
  }

  initTexture() {
    this.canvas = document.createElement("canvas");

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.canvas.id = "touchTexture";
  }

  update(delta) {
    this.clear();
    let speed = this.speed;
    this.trail.forEach((point, i) => {
      let f = point.force * speed * (1 - point.age / this.maxAge);
      // let x = point.x
      // let y = point.y

      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1);
      }
    });

    this.trail.forEach((point, i) => {
      this.drawPoint(point);
    });

    // this.drawPoints()

    // this.ctx.fillStyle = "rgba(255,0,0,0.5)"
    // this.ctx.fillRect(0, 0, 200, 200)
    // this.ctx.fillStyle = "rgba(0,255,0,0.5)"
    // this.ctx.fillRect(50, 0, 200, 200)
    // this.test()
  }

  clear() {
    // this.ctx.fillStyle = 'hsl(61, 100%, 100%)'
    // this.ctx.fillStyle = 'white'

    // this.ctx.fillStyle = '#' + this.colorDot.getHexString()

    this.ctx.fillStyle = "#" + this.colorBG.getHexString();

    // this.ctx.fillStyle = this.gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  addTouch(point) {
    let force = 0;
    let vx = 0;
    let vy = 0;
    const last = this.last;
    if (last) {
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      let d = Math.sqrt(dd);
      vx = dx / d;
      vy = dy / d;

      force = Math.min(dd * 10000, 1);
      // force = Math.sqrt(dd)* 50.
      // force = 1
    }
    this.last = {
      x: point.x,
      y: point.y,
    };
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
  }
  drawPoint(point) {
    const ctx = this.ctx;
    const pos = {
      x: point.x * this.width,
      y: (1 - point.y) * this.height,
    };

    let intensity = 1;

    if (point.age < this.maxAge * 0.3) {
      intensity = easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1);
    } else {
      intensity = easeOutQuad(
        1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7),
        0,
        1,
        1
      );
    }
    intensity *= point.force;

    const radius = this.radius;
    let color = `${((point.vx + 1) / 2) * 255}, ${
      ((point.vy + 1) / 2) * 255
    }, ${intensity * 255}`;

    let variant = 20 * Number(this.hueSpread);

    color = `${(this.hueDot - variant / 2 + intensity * variant * point.vx).toFixed(0)}, ${this.satuationDot}%, ${this.lightnessDot}%`;
    // color = `${(this.colorDot.getHSL(this.colorDot).h * 360).toFixed(0)}, 100%, 87%`

    let offset = this.size * 5;
    ctx.shadowOffsetX = offset; // (default 0)
    ctx.shadowOffsetY = offset; // (default 0)
    ctx.shadowBlur = radius; // (default 0)
    ctx.shadowColor = `hsla(${color},${0.4 * intensity})`; // (default transparent black)

    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255,0,0,1)";
    this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
