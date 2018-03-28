# Cattaz ドキュメント

Cattazのドキュメントはセルフホストされています。
あなたは同じページでテキストを編集したり、アプリケーションを実行したりできます。

## Markdownシンタックス

Cattazのシンタックスは、Markdownに基づいています。
Markdownには、3つ以上のバッククォート、または、チルダで始まる'fenced code block'シンタックスがあります。
通常、fenced code block内のテキストは、固定幅でレンダリングされます。

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

fenced code blockは、言語指定ができます。
以下の例では、`js`はJavaScriptを表し、ブロックの中はJavaScriptコードになっています。

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

Cattazは、fenced code blockに新しい機能を導入しました。
言語指定はアプリケーションの名前を表します。
fenced code block内のテキストは、アプリケーションの状態を表します。

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

アプリケーションはインタラクティブに動きます。
例えば、上記のテキストボックスにあなたの名前を入力すれば、アプリケーションはあなたにメッセージを表示します。
その際、左側のエディタのテキストが同時に同期されることに注目してください。

逆もまた同じです。
fenced code block内のテキストを編集するとテキスト入力の下に表示されるメッセージが更新されます。

独自のアプリケーションを実装するには、[Hello World ドキュメント](./app-hello)を参照してください。

## リソース

* [実行方法](./usage)
* [アプリケーションのリスト](../apps)
