# アプリケーションのプラグイン化

各アプリとプラットフォーム側を別々にビルド（分散ビルド）する仕組みにする。

それにより、開発したアプリを簡易にプラットフォームに導入できるようになる。

## 現状のプラグイン化の方法

アプリを個別にビルドして、生成されたjsファイルを[cattaz\src\index.html]に下記のように追加する。

```html
<script src="plugin_vendor.js"></script>
<script src="platform.js"></script>
<script src="plugin_app_hello.js"></script>
<script src="plugin_app_vote.js"></script>
```

### plugin_vendor.js

プラットフォーム側とアプリ側の共通のライブラリをビルドしたもの。

現状、[react], [prop-types], [js-yaml], [lodash]ライブラリが含まれている。

上記ライブラリは、[cattaz\src\plugin\vendor\src\vendor.js]に記載されている。

このjsファイルにプラットフォーム側とアプリで共通に利用したいライブラリを記載し、[cattaz\src\plugin\vendor]上で記載したライブラリを[yarn add ○○ --save]でインストールし、[webpack]コマンドでビルドする。

[cattaz\src\plugin\vendor\build]内に生成されたjsファイルとmapファイルを[cattaz\build]内に置く。

プラットフォーム側とアプリ側の[webpack.config.babel.js]において、下記のように[externals]内に上記ライブラリを記載し、バンドルから上記ライブラリを除外する。

```js
externals: {
  react: 'React',
  'prop-types': 'PropTypes',
  'js-yaml': 'JsYaml',
  lodash: 'Lodash',
},
```

### platform.js

プラットフォーム側をビルドしたもの。

### plugin_app_hello.js, plugin_app_vote.js

各アプリをビルドしたもの。

各アプリは、[cattaz\src\plugin\apps]に置いてある。

HelloApplicationを例に説明する。

[cattaz\src\plugin\apps\HelloApplication]にというフォルダを作成し、下記を行う。

[package.json]を適宜書き換える。

srcフォルダ内にアプリのソースを置く。

アプリソース内に下記のようなコードを書き、プラットフォーム側にアプリを登録するようにする。

第1引数：fenced code blockに対応するアプリ名

第2引数：アプリ本体のクラス名

```js
/* global Cattaz */
Cattaz.SetApp('hello', HelloApplication);
```

[webpack.config.babel.js]において、下記のように[entry]部分で、出力したいビルド後のファイル名（例：plugin_app_hello）とビルド対象ファイルへのパス（例：./src/HelloApplication.jsx）を記載する。

```js
entry: {
  plugin_app_hello: ['./src/HelloApplication.jsx'],
},
```

[webpack]コマンドでビルドする。

[cattaz\src\plugin\apps\HelloApplication\build]内に生成されたjsファイルとmapファイルを[cattaz\build]内に置く。

[cattaz\src\index.html]に上記で生成したビルドjsファイルを下記のように追加する。

```html
<script src="plugin_app_hello.js"></script>
```
