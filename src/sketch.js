

const sketch = (s) => {

  let canv;
  let container;
  let lblInfo;
  let rows = 50;
  let cols = 50;
  let grid = new Array(cols);

  let openSet = [];
  let closedSet = [];
  let current;
  let start;
  let end;
  let w, h = 0;
  let path = [];
  const DiagonalStepDistance = Math.SQRT2;

  function Spot(i, j) {
    this.i = i; //column (x)
    this.j = j; //row (y)
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbours = [];
    this.wall = false;

    if (s.random(1) < 0.22) {
      this.wall = true;
    }

    this.show = function(col, shape = "g") {

      s.fill(col);
      s.noStroke();
      if (this.wall) {
        s.fill(0)
        s.noStroke();
      }
      if (shape == "c") {
        s.ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 2, h / 2);
      } else {
        s.rect(this.i * w, this.j * h, w - 1, h - 1);

      };
    }

    this.addNeighbours = function(grid) {

      let i = this.i;
      let j = this.j;

      if (i > 0) { // left
        this.neighbours.push(grid[i - 1][j]);
      }
      if (i < cols - 1) { //right
        this.neighbours.push(grid[i + 1][j]);
      }
      if (j > 0) { //upper
        this.neighbours.push(grid[i][j - 1]);
      }
      if (j < rows - 1) { //lower
        this.neighbours.push(grid[i][j + 1]);
      }

      if (i > 0 && j > 0) {
        this.neighbours.push(grid[i - 1][j - 1]); //top left
      }
      if (i < cols - 1 && j > 0) {
        this.neighbours.push(grid[i + 1][j - 1]); //top right
      }
      if (i > 0 && j < rows - 1) {
        this.neighbours.push(grid[i - 1][j + 1]); //bottom left
      }
      if (i < cols - 1 && j < rows - 1) {
        this.neighbours.push(grid[i + 1][j + 1]); //bottom right
      }
    }
  }

  function getGofNeighbour(curr, neigh) {
    if (curr.i !== neigh.i && curr.j !== neigh.j) {
      return curr.g + DiagonalStepDistance;
    } else {
      return curr.g + 1;
    }
  }

  s.setup = () => {
    
    canv = s.createCanvas(600, 600);
    s.background(55);
    container = document.getElementById('sketch-div');
    container.appendChild(canv.elt);
    lblInfo = document.getElementById("lblInfo");
    //frameRate(15);
    w = s.width / cols;
    h = s.height / rows;

    for (let i = 0; i < cols; i++) {
      grid[i] = new Array(rows);

    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i][j] = new Spot(i, j);
      }
    }
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i][j].addNeighbours(grid);
      }
    }

    start = grid[0][0];
    end = grid[cols - 1][rows - 1];

    start.wall = false;
    end.wall = false;
    // grid[cols - 1-1][rows - 1].wall=true;
    // grid[cols - 1][rows - 1-1].wall=true;
    // grid[cols - 1-1][rows - 1-1].wall=true;

    let cinit = cols - 15;
    let r1 = 8;
    let len1 = 15;
    for (let c = cinit; c > cinit - len1; c--) {
      // console.log(c,r1);
      grid[c][r1].wall = true;
      grid[c + 1][r1].wall = true;
      r1++;
    }

    cinit = cols - 18;
    r1 = 22;
    len1 = 20;

    for (let c = cinit; c > cinit - len1; c--) {
      grid[c][r1].wall = true;
      grid[c + 1][r1].wall = true;
      r1++;
    }

    cinit = cols - 2;
    r1 = 30;
    len1 = 13;
    for (let c = cinit; c > cinit - len1; c--) {
      grid[c][r1].wall = true;
      grid[c + 1][r1].wall = true;
      r1++;
    }
    openSet.push(start);
  }

  s.draw = () => {

    if (openSet.length > 0) {

      let winner = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[winner].f) {
          winner = i;
        }
      }

      current = openSet[winner];

      if (current === end) {

        console.log("Finished");
        s.noLoop();
      }

      removeFromArray(openSet, current);
      closedSet.push(current);


      let neighbours = current.neighbours;

      for (let i = 0; i < neighbours.length; i++) {
        var neighbour = neighbours[i];

        if (!closedSet.includes(neighbour) && !neighbour.wall) {
          let tempG = getGofNeighbour(current, neighbour);
          var newPath = false;
          if (openSet.includes(neighbour)) {
            if (tempG < neighbour.g) {
              neighbour.g = tempG;
              newPath = true;
            }
          } else {
            neighbour.g = tempG;
            newPath = true;
            openSet.push(neighbour);
          }
          if (newPath) {
            neighbour.h = heuristic(neighbour, end);
            neighbour.f = neighbour.h + neighbour.g;
            neighbour.previous = current;
          }
        }
      }

    } else {
      console.log("No Solutiuon"); //no solution
      s.noLoop();
      return;
    }

    s.background(245);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i][j].show(s.color(255, 215, 120));
      }
    }

    for (var i = 0; i < openSet.length; i++) {
      openSet[i].show(s.color(0, 170, 99), "c");
    }

    for (var i = 0; i < closedSet.length; i++) {
      closedSet[i].show(s.color(155, 61, 11), "c");
    }

    path = [];
    var temp = current;
    path.push(temp);

    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;

    }

    s.noFill();
    s.stroke(255, 0, 215);
    s.strokeWeight(3);
    s.beginShape();
    for (var i = 0; i < path.length; i++) {
      s.vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
    }
    s.endShape();
  }

  function removeFromArray(arr, elt) {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] == elt) {
        arr.splice(i, 1);
      }
    }
  }

  function heuristic(a, b) {
    //let d = dist(a.i, a.j, b.i, b.j);
    let d = Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
    return d;
  }
}

export default sketch;