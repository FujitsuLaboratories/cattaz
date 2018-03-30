# Hello application

Cattazの"hello world"アプリケーションです。

## アプリケーション

```hello
```

## 仕組み

Cattaz内の全てのアプリケーションは、Reactコンポーネントで書かれています。
Cattazのアプリケーションは、propTypesを持つことを要求します。これらのpropTypesは、エディタ内のテキストと実行中のアプリケーションを同期させるために利用されます。

### PropTypes

```js
HelloApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
```

* `data`は、fenced code block内のテキストが入っている文字列オブジェクトです。アプリケーションは、その文字列オブジェクトを解析して、Reactノードをレンダリングする必要があります。

  `HelloApplication`は、`data`オブジェクトからユーザ名を抽出し、それを同期処理するためにstateにセットし、アプリケーションのテキスト入力ボックスの下にレンダリングします。

  ```js
  static getDerivedStateFromProps(nextProps) {
    return { name: nextProps.data };
  }
  ...
  <div key="message">{this.state.name ? `Hello, ${this.state.name}` : 'Input your name'}</div>
  ```

* `onEdit`は、アプリケーションの状態が変化した時にアプリケーションが呼び出すコールバックです。これは2つの引数を持ちます。第1引数は、fenced code block内に反映する文字列オブジェクトで、第2引数は、`appContext`オブジェクトです。

  `HelloApplication`は、入力されたユーザ名を`onEdit`メソッドに渡して、エディタのfenced code block内に反映させます。

  ```js
  handleEdit() {
      const name = this.refInput.current.value;
      this.setState({ name });
      this.props.onEdit(name, this.props.appContext);
  }
  ...
  <div key="input"><input type="text" ref={this.refInput} placeholder="name" value={this.state.name} onChange={this.handleEdit} /></div>
  ```

* `appContext`は、アプリケーションのコンテキストを持つオブジェクトです。これは`onEdit`コールバックの第2引数として使用されます。ユーザは同じページ上のエディタに複数のアプリケーションのfenced code blockを入力でき、`appContext`はその複数のアプリケーション間でコンテンツを判別するのに利用されます。

## アプリの開発方法

Hello applicationを拡張していくことで、新しいアプリケーションを実装できます。

* 最初に、 `src/apps/HelloApplication.jsx`をコピーし、`<Your App Name Here>.jsx`のようにファイル名を変更し、`src/apps/`ディレクトリ内に置きます。
* 同じディレクトリにある`src/apps/index.js`を編集して、`<Your App Name Here>.jsx`をimportし、`export default`にも名前を追加します。
* Hello applicationの説明を参考に、`<Your App Name Here>.jsx`を編集して、アプリケーションのロジックを実装していきます。
