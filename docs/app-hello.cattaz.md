# Hello application

This is a "hello world" application in cattaz.

## Application

```hello
```

## PropTypes

Cattaz expect applications to have following propTypes.

```js
HelloApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
```

* `data` is a string object extracted from the fenced code block. Applications should parse it and render React nodes.
* `onEdit` is a callback that applications should call when status of applications changes. It takes two arguments, a string object to be placed into the fenced code block and `appContext` object.
* `appContext` is an object to determine application's context. It will be used for the second argument of 'onEdit' callback.
