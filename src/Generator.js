export default class Generator {
  static color() {
    let color = '#';
    for (let i = 0; i < 6; i += 1) {
      color += Math.floor(Math.random() * 16).toString(16);
    }
    return color;
  }
}
