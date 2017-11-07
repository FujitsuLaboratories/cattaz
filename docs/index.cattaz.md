# Cattaz documentation

Cattaz documentation is self-hosted.
You can edit text and use applications in place.

## Markdown syntax

Syntax of Cattaz is based on Markdown.
Markdown has 'fenced code block' syntax, which starts with 3 or more backslashes or tildes.
Normally, text in a fenced code block will be rendered in fixed width.

* Input

  ~~~md
  ```
  hello
  ```
  ~~~

* Output

  ```
  hello
  ```

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

Cattaz introduced a new interpretation to fenced code blocks.
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
Please note that text of editor on the left will be changed accordingly.

The opposite is also true.
If you edit text inside the fenced code block, the hello application will change its message.

To implement your own application, please see [Hello World documentation](./app-hello).

## Resources

* [List of applications](./apps)
