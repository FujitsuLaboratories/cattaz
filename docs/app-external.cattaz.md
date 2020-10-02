# External application

## Application

```external
```

## Demo application

Here is an example external application based on [hello](./app-hello) app:

```external
https://cattaz-external-app-demo.glitch.me/
```

## How it works

External Cattaz applications are rendered inside an `<iframe>` and they communicate with Cattaz via the `postMessage` API.

### App &rarr; Cattaz: `cattazGetState`

```js
parent.postMessage({ cattazGetState: true }, '*');
```

Requests the latest state from Cattaz. Cattaz will then send the `cattazState` message.

### Cattaz &rarr; App: `cattazState`

Cattaz sends this message to the external app whenever the data is updated. Structure looks like this:

```js
{
  cattazState: {
    data: '(string)',
    appContext: { /* ... */ },
  }
}
```

Your external application should store the `appContext` for sending back later in `cattazEdit`.

### App &rarr; Cattaz: `cattazEdit`

```js
parent.postMessage({ cattazEdit: { data, appContext } }, '*');
```

Edits App’s data.

### App &rarr; Cattaz: `cattazSetHeight`

```js
parent.postMessage({ cattazSetHeight: 96 }, '*');
```

Sets the height of the external app’s iframe.
