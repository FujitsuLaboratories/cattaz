import clone from 'lodash/clone';
import every from 'lodash/every';
import isEqual from 'lodash/isEqual';
import flatMap from 'lodash/flatMap';
import fill from 'lodash/fill';
import range from 'lodash/range';
import Yaml from 'js-yaml';

const Size = 8;

export const StoneNone = 0;
export const StoneBlack = 1;
export const StoneWhite = 2;

const initialStones = [
  { stone: StoneBlack, x: 4, y: 3 },
  { stone: StoneWhite, x: 3, y: 3 },
  { stone: StoneWhite, x: 4, y: 4 },
  { stone: StoneBlack, x: 3, y: 4 },
];

function isValidPos(x, y) {
  return x >= 0 && y >= 0 && x < Size && y < Size;
}
function findFlippablesInDirection(cells, x, y, color, directionX, directionY) {
  for (let curX = x + directionX, curY = y + directionY; isValidPos(curX, curY); curX += directionX, curY += directionY) {
    const cur = cells[curX][curY];
    if (cur === StoneNone) return [];
    if (cur === color) {
      const result = [];
      for (let fillX = curX - directionX, fillY = curY - directionY; fillX !== x || fillY !== y; fillX -= directionX, fillY -= directionY) {
        result.push([fillX, fillY]);
      }
      return result;
    }
    // If other colors, continue
  }
  return [];
}
function findFlippables(cells, x, y, color) {
  const directions = [-1, 0, 1];
  return flatMap(directions, directionX =>
    flatMap(directions, (directionY) => {
      if (directionX === 0 && directionY === 0) return [];
      return findFlippablesInDirection(cells, x, y, color, directionX, directionY);
    }));
}

export default class ReversiModel {
  constructor() {
    this.steps = clone(initialStones);
    this.nextTurn = StoneBlack;
  }
  addStep(stone, x, y) {
    if (this.nextTurn !== stone) {
      throw new Error('Not your turn');
    }
    const flippables = findFlippables(this.getCells(), x, y, stone);
    if (flippables.length === 0) {
      throw new Error(`You cannot place stone ${stone} at ${x},${y}`);
    }
    this.steps.push({ stone, x, y });
    this.toggleTurn();
  }
  skipTurn() {
    this.toggleTurn();
  }
  toggleTurn() {
    switch (this.nextTurn) {
      case StoneBlack:
        this.nextTurn = StoneWhite;
        break;
      case StoneWhite:
        this.nextTurn = StoneBlack;
        break;
      default:
        throw new Error('should not reach here');
    }
  }
  getCells() {
    const cells = range(Size).map(() => {
      const arr = new Array(Size);
      fill(arr, StoneNone);
      return arr;
    });
    this.steps.forEach((step) => {
      cells[step.x][step.y] = step.stone;
      const flippables = findFlippables(cells, step.x, step.y, step.stone);
      flippables.forEach((pos) => {
        cells[pos[0]][pos[1]] = step.stone;
      });
    });
    return cells;
  }
  getStoneCounts() {
    const cells = this.getCells();
    const counts = {
      [StoneNone]: 0,
      [StoneBlack]: 0,
      [StoneWhite]: 0,
    };
    cells.forEach((r) => {
      r.forEach((c) => {
        counts[c] += 1;
      });
    });
    return counts;
  }
  equals(other) {
    return isEqual(this, other);
  }
  serialize() {
    return Yaml.safeDump({
      steps: this.steps,
      nextTurn: this.nextTurn,
    });
  }
  static deserialize(str) {
    try {
      const obj = Yaml.safeLoad(str);
      const model = new ReversiModel();
      if (obj.steps) {
        if (!every(obj.steps, (step) => {
          if (!isValidPos(step.x, step.y)) return false;
          if (step.stone !== StoneBlack && step.stone !== StoneWhite) return false;
          return true;
        })) {
          throw new Error('invalid steps');
        }
        model.steps = obj.steps;
      }
      if (obj.nextTurn) model.nextTurn = obj.nextTurn;
      return model;
    } catch (ex) {
      return new ReversiModel();
    }
  }
}
