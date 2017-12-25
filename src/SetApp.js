export const Apps = {};

export default function SetApp(name, func) {
  Apps[name] = func;
}
