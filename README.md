# cattaz

TODO add badges of Travis, etc.

Cattaz is an interactive Wiki platform. You can implement an application which runs in a Wiki page.

## Usage

### Node

Install [Node 6 and npm](https://nodejs.org/en/download/) and [yarn](https://yarnpkg.com/en/docs/install).

```bash
yarn
yarn run storybook
```

Now you can visit `http://localhost:6006/` to view the application.

### Docker

```bash
docker build . -t cattaz # --build-arg http_proxy=http://user:pass@proxy.example.com:8080 --build-arg https_proxy=http://user:pass@proxy.example.com:8080
docker run -p 8080:8080 -p 1234:1234 cattaz
```

Now you can visit `http://localhost:8080/` to view the application.

## Design

### Traditional fenced code block

In [CommonMark](http://commonmark.org/), you can specify language in fenced code block by [info-string](http://spec.commonmark.org/0.26/#info-string). For instance, specifying `js` language makes Markdown parser to highlight the code in JS syntax.

* Input:

  ~~~md
  ```js
  function f() {}
  ```
  ~~~

* Output

  ```js
  function f() {}
  ```

### Application-enabled fenced code block

Cattaz allows you to set an application name by info-string. If you want to run an application of [KPT method](http://code-artisan.io/retrospective-method-kpt/), just set `kpt` as info-string.

* Input

  ~~~md
  ```kpt
  ```
  ~~~

* Demo

  TODO link to gh-pages

In the preview pane, you can view a KPT application. If you edit KPT via the application, the text in the fenced code block will be modified based on your input. If you edit the text in the fenced code block, KPT items in the application will be modified.

### Benefits

* You can easily implement your own applications on the platform.
* You do not have to parse Markdown. Text in fenced code block is supplied by the platform.
* You do not have to generate Markdown. If application serialzes its state, the platform will embed it in the Wiki page.

## FAQ

### WYSIWYG editor

Partially true. In traditional WYSISYG editors, you can edit predefined components in WYSIWYG. In this project, you can implement WYSISYG components.

## Related works

There are some projects which try to extend fenced code blocks. All of them convert fenced code blocks in a specific way. None of them converts converted content back to Markdown.

* [R Markdown](http://rmarkdown.rstudio.com/) executes fenced code blocks and emit their results. It does not support only R but also supports several languages.
* [Haroopad](http://pad.haroopress.com/) allows you to use [mermaid](http://knsv.github.io/mermaid/). If you write mermaid code in fenced block with `mermaid` info-string, it will generate graphs.
