# Cattaz documentation

Cattaz documentation is self-hosted.
You can edit text and use applications in the same place.

## Markdown syntax

Syntax of Cattaz is based on Markdown.
Markdown has 'fenced code block' syntax, which starts with 3 or more backticks or tildes.
Normally, text in a fenced code block will be rendered in fixed width.

* Input

  ~~~md
  ```
  hello
  ```
  ~~~

* Output

  <!-- markdownlint-disable MD040 -->

  ```
  hello
  ```

  <!-- markdownlint-enable MD040 -->

Fenced code block may have language specifier.
In this example, `js` stands for JavaScript and its content will be JavaScript code.

* Input

  ~~~md
  ```js
  function hello(name) {
    return `hello, ${name}!`;
  }
  ```
  ~~~

* Output

  ```js
  function hello(name) {
    return `hello, ${name}!`;
  }
  ```

Cattaz introduces a new interpretation to fenced code blocks.
Language specifier is a name of application.
Text in a fenced code block is state of the application.

* Input

  ~~~md
  ```hello
  world
  ```
  ~~~

* Output

  ```hello
  world
  ```

An application can be interactive.
For instance, you can type your name in the textbox above and the application will show a hello message to you.
Please note that text contents in editor on the left will be sychronized simultaneously.

The opposite is also true.
Editing text inside the fenced code block will update message shown below the text input.

To implement your own application, please see [Hello World documentation](./app-hello).

## Resources

* [How to run](./usage)
* [List of applications](./apps)
