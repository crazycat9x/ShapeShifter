function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY // been adjusted to be relative to element
  };
}

class Shape {
  constructor(context, fill = null) {
    this.context = context;
    this.fill = fill;
  }

  containPoint(x, y) {
    this.createPath();
    const contain = this.context.isPointInPath(x, y);
    return contain;
  }

  setCenterPosition() {
    throw new Error("not implemented");
  }

  createPath() {
    throw new Error("not implemented");
  }

  draw() {
    this.context.save();
    this.fill !== null && (this.context.fillStyle = fill);

    this.createPath();
    this.context.fill();
    this.context.restore();
  }
}

class Rect extends Shape {
  constructor(context, x, y, width, height, fill = null) {
    super(context, fill);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  setCenterPosition(x, y) {
    this.x = Math.floor(x - this.width / 2);
    this.y = Math.floor(y - this.height / 2);
  }

  createPath() {
    this.context.beginPath();
    this.context.rect(this.x, this.y, this.width, this.height);
    this.context.closePath();
  }
}

class Triangle extends Shape {
  constructor(context, side, cx, cy, fill = null) {
    super(context, fill);
    this.side = side;
    this.cx = cx;
    this.cy = cy;
  }

  setCenterPosition(x, y) {
    this.cx = x;
    this.cy = y;
  }

  createPath() {
    this.context.save();
    const h = this.side * (Math.sqrt(3) / 2);

    this.context.translate(this.cx, this.cy);

    this.context.beginPath();

    this.context.moveTo(0, -h / 2);
    this.context.lineTo(-this.side / 2, h / 2);
    this.context.lineTo(this.side / 2, h / 2);
    this.context.lineTo(0, -h / 2);

    this.context.stroke();
    this.context.fill();

    this.context.closePath();
    this.context.restore();
  }
}

class Star extends Shape {
  constructor(context, cx, cy, spikes, outerRadius, innerRadius, fill = null) {
    super(context, fill);
    this.cx = cx;
    this.cy = cy;
    this.spikes = spikes;
    this.outerRadius = outerRadius;
    this.innerRadius = innerRadius;
  }

  setCenterPosition(x, y) {
    this.cx = x;
    this.cy = y;
  }

  createPath() {
    let x, y;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / this.spikes;
    this.context.beginPath();
    this.context.moveTo(this.cx, this.cy - this.outerRadius);
    for (let i = 0; i < this.spikes; i++) {
      x = this.cx + Math.cos(rot) * this.outerRadius;
      y = this.cy + Math.sin(rot) * this.outerRadius;
      this.context.lineTo(x, y);
      rot += step;

      x = this.cx + Math.cos(rot) * this.innerRadius;
      y = this.cy + Math.sin(rot) * this.innerRadius;
      this.context.lineTo(x, y);
      rot += step;
    }
    this.context.lineTo(this.cx, this.cy - this.outerRadius);
    this.context.closePath();
  }
}

const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

const shapesState = [];
shapesState.push(new Rect(ctx, 50, 50, 50, 50));
shapesState.push(new Star(ctx, 100, 100, 5, 30, 15));
shapesState.push(new Triangle(ctx, 50, 150, 150));

canvas.width = 1024;
canvas.height = 768;

let selectedShape;
let mousedown = false;

canvas.addEventListener("mousedown", event =>
  shapesState.some(shape => {
    mousedown = true;
    const { x, y } = getMousePos(canvas, event);
    if (shape.containPoint(x, y)) {
      selectedShape = shape;
      return true;
    }
  })
);

canvas.addEventListener("mouseup", () => {
  mousedown = false;
  selectedShape = null;
});

canvas.addEventListener("mousemove", () => {
  if (mousedown && selectedShape) {
    const { x, y } = getMousePos(canvas, event);
    selectedShape.setCenterPosition(x, y);
  }
});

requestAnimationFrame(updateLoop);

function updateLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let shape of shapesState) {
    shape.draw();
  }
  requestAnimationFrame(updateLoop);
}
