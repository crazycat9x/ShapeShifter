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
  constructor(context, cx, cy, scale, rotationDegree, fill = null) {
    this.context = context;
    this.cx = cx;
    this.cy = cy;
    this.scale = scale;
    this.rotationDegree = rotationDegree;
    this.fill = fill;
    this.hovered = false;
    this.selected = false;
  }

  containPoint(x, y) {
    this.createPath();
    const contain = this.context.isPointInPath(x, y);
    return contain;
  }

  setCenterPosition(x, y) {
    this.cx = x;
    this.cy = y;
  }

  getCenterPosition() {
    return { cx: this.cx, cy: this.cy };
  }

  createPath() {
    this.context.save();
    if (this.rotationDegree !== 0) {
      this.context.translate(this.cx, this.cy);
      this.context.rotate((this.rotationDegree * Math.PI) / 180);
      this.context.translate(-this.cx, -this.cy);
    }
  }

  scaleBy(value) {
    if (this.scale + value > 0) this.scale += value;
  }

  rotate(degree) {
    this.rotationDegree += degree;
  }

  draw() {
    this.context.save();

    if (this.fill) this.context.fillStyle = fill;
    if (this.hovered && !this.selected) this.context.globalAlpha = 0.65;

    this.createPath();
    if (this.selected) {
      this.context.lineWidth = 15;
      this.context.strokeStyle = "red";
      this.context.stroke();
    }
    this.context.fill();
    this.context.restore();
  }
}

class Rect extends Shape {
  constructor(
    context,
    x,
    y,
    width,
    height,
    scale = 1,
    rotationDegree = 0,
    fill = null
  ) {
    super(context, x + width / 2, y + height / 2, scale, rotationDegree, fill);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  createPath() {
    super.createPath();
    const scaledWidth = this.width * this.scale;
    const scaledHeight = this.height * this.scale;
    const scaledX = Math.floor(this.cx - scaledWidth / 2);
    const scaledY = Math.floor(this.cy - scaledHeight / 2);
    this.context.beginPath();
    this.context.rect(scaledX, scaledY, scaledWidth, scaledHeight);
    this.context.closePath();
    this.context.restore();
  }
}

class Circle extends Shape {
  constructor(
    context,
    cx,
    cy,
    radius,
    scale = 1,
    rotationDegree = 0,
    fill = null
  ) {
    super(context, cx, cy, scale, rotationDegree, fill);
    this.radius = radius;
  }

  createPath() {
    super.createPath();
    const scaledRadius = this.radius * this.scale;
    this.context.beginPath();
    this.context.arc(this.cx, this.cy, scaledRadius, 0, 2 * Math.PI);
    this.context.closePath();
    this.context.restore();
  }
}

class Triangle extends Shape {
  constructor(
    context,
    side,
    cx,
    cy,
    scale = 1,
    rotationDegree = 0,
    fill = null
  ) {
    super(context, cx, cy, scale, rotationDegree, fill);
    this.side = side;
  }

  setCenterPosition(x, y) {
    this.cx = x;
    this.cy = y;
  }

  createPath() {
    super.createPath();
    const scaledSide = this.side * this.scale;
    const h = scaledSide * (Math.sqrt(3) / 2);
    this.context.translate(this.cx, this.cy);
    this.context.beginPath();
    this.context.moveTo(0, -h / 2);
    this.context.lineTo(-scaledSide / 2, h / 2);
    this.context.lineTo(scaledSide / 2, h / 2);
    this.context.lineTo(0, -h / 2);
    this.context.closePath();
    this.context.restore();
  }
}

class Star extends Shape {
  constructor(
    context,
    cx,
    cy,
    spikes,
    outerRadius,
    innerRadius,
    scale = 1,
    rotationDegree = 0,
    fill = null
  ) {
    super(context, cx, cy, scale, rotationDegree, fill);
    this.spikes = spikes;
    this.outerRadius = outerRadius;
    this.innerRadius = innerRadius;
  }

  createPath() {
    super.createPath();
    const step = Math.PI / this.spikes;
    const scaledOuterRadius = this.outerRadius * this.scale;
    const scaledInnerRadius = this.innerRadius * this.scale;
    let x, y;
    let rot = (Math.PI / 2) * 3;
    this.context.beginPath();
    this.context.moveTo(this.cx, this.cy - scaledOuterRadius);
    for (let i = 0; i < this.spikes; i++) {
      x = this.cx + Math.cos(rot) * scaledOuterRadius;
      y = this.cy + Math.sin(rot) * scaledOuterRadius;
      this.context.lineTo(x, y);
      rot += step;
      x = this.cx + Math.cos(rot) * scaledInnerRadius;
      y = this.cy + Math.sin(rot) * scaledInnerRadius;
      this.context.lineTo(x, y);
      rot += step;
    }
    this.context.lineTo(this.cx, this.cy - scaledOuterRadius);
    this.context.closePath();
    this.context.restore();
  }
}

const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

const shapesState = [];
let rect = new Rect(ctx, 50, 50, 50, 50, 2);
rect.rotate(15);
shapesState.push(rect);
shapesState.push(new Star(ctx, 100, 100, 5, 30, 15));
shapesState.push(new Triangle(ctx, 50, 150, 150));
shapesState.push(new Circle(ctx, 200, 200, 25));

canvas.width = 1024;
canvas.height = 768;

let selectedShape;
let mousedDownShape;
let hoveredShape;
let mousedown = false;

canvas.addEventListener("mousedown", event => {
  const mouseDownOnShape = shapesState.some(shape => {
    mousedown = true;
    const { x, y } = getMousePos(canvas, event);
    if (shape.containPoint(x, y)) {
      selectedShape = shape;
      mousedDownShape = shape;
      return true;
    }
  });
  if (!mouseDownOnShape) selectedShape = null;
});

canvas.addEventListener("mouseup", () => {
  mousedown = false;
  mousedDownShape = null;
});

canvas.addEventListener("mousemove", () => {
  const hoveredOnShape = shapesState.some(shape => {
    const { x, y } = getMousePos(canvas, event);
    if (shape.containPoint(x, y)) {
      hoveredShape = shape;
      return true;
    }
  });

  if (!hoveredOnShape) hoveredShape = null;

  if (mousedown && mousedDownShape) {
    const { x, y } = getMousePos(canvas, event);
    mousedDownShape.setCenterPosition(x, y);
  }
});

document
  .getElementById("rot-left-button")
  .addEventListener("click", function() {
    if (selectedShape) selectedShape.rotate(-15);
  });

document
  .getElementById("rot-right-button")
  .addEventListener("click", function() {
    console.log(selectedShape);
    if (selectedShape) selectedShape.rotate(15);
  });

document
  .getElementById("scale-down-button")
  .addEventListener("click", function() {
    console.log(selectedShape);
    if (selectedShape) selectedShape.scaleBy(-0.1);
  });

document
  .getElementById("scale-up-button")
  .addEventListener("click", function() {
    if (selectedShape) selectedShape.scaleBy(0.1);
  });

requestAnimationFrame(updateLoop);

function updateLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let shape of shapesState) {
    shape.hovered = shape === hoveredShape;
    shape.selected = shape === selectedShape;
    shape.draw();
  }
  requestAnimationFrame(updateLoop);
}
