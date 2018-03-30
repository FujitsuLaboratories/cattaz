# Hello application

This is a "hello world" application in cattaz.

## Application

```hello
```

## How it works

All the applications in cattaz are written as react components.
Cattaz expect applications to have following propTypes. These propTypes help to synchronize text in the editor with the contents of runnnig application.

### PropTypes

```js
HelloApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
```

* `data` is a string object extracted from the fenced code block. Applications should parse it and render React nodes.

  `HelloApplication` extracts username from `data` object set it as a state to handle synchronization and render it below the text input on app view.

  ```js
  static getDerivedStateFromProps(nextProps) {
    return { name: nextProps.data };
  }
  ...
  <div key="message">{this.state.name ? `Hello, ${this.state.name}` : 'Input your name'}</div>
  ```

* `onEdit` is a callback that applications should call when status of applications changes. It takes two arguments, a string object to be placed into the fenced code block and `appContext` object.

  `HelloApplication` passes username to `onEdit` method to show it in fenced code block on editor side.

  ```js
  handleEdit() {
      const name = this.refInput.current.value;
      this.setState({ name });
      this.props.onEdit(name, this.props.appContext);
  }
  ...
  <div key="input"><input type="text" ref={this.refInput} placeholder="name" value={this.state.name} onChange={this.handleEdit} /></div>
  ```

* `appContext` is an object to determine application's context. It will be used for the second argument of `onEdit` callback. Basically user can write multiple instances of apps on same editor and `appContext` will help to separate contents between apps.

## How to write your own app

Hello app can be extended to implement your own app logic.

* First, copy `src/apps/HelloApplication.jsx` and make `<Your App Name Here>.jsx` in `src/apps/` directory.
* Edit `src/apps/index.js` in same directory to import the `<Your App Name Here>.jsx` and add it to export default.
* Start editing `<Your App Name Here>.jsx` to implement your app logic as explained for Hello application.
