## webpack-to-vite
convert a webpack project to a vite project

## Quick Start

1. download
```
git clone https://github.com/originjs/webpack-to-vite.git
cd webpack-to-vite
```
2. install

with npm, run
```
npm install
npm run build
```
with yarn, run
```
yarn
yarn build
```
3. convert
```
node ./bin/index -d <project path>
```

## Demos

The following is a list of projects that successfully converted from a webpack project to a vite project using the tool

- [helloworld-vue2](https://github.com/originjs/webpack-to-vite-demos/tree/main/helloworld-vue2)
- [helloworld-vue3](https://github.com/originjs/webpack-to-vite-demos/tree/main/helloworld-vue3)
- [helloworld-webpack](https://github.com/originjs/webpack-to-vite-demos/tree/main/helloworld-webpack)
- [vue-manage-system-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/vue-manage-system-vite)
- [newbee-mall-vue3-app-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/newbee-mall-vue3-app-vite)
- [vue-realworld-example-app-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/vue-realworld-example-app-vite)
- [vue-uploader-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/vue-uploader-vite)
- [douban-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/douban-vite)

## Awesome projects successfully converted

### vue-cli
- [vue-manage-system](https://github.com/lin-xin/vue-manage-system) -> [vue-manage-system-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/vue-manage-system-vite)
- [newbee-mall-vue3-app](https://github.com/newbee-ltd/newbee-mall-vue3-app) -> [newbee-mall-vue3-app-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/newbee-mall-vue3-app-vite)
- [vue-realworld-example-app](https://github.com/gothinkster/vue-realworld-example-app) -> [vue-realworld-example-app-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/vue-realworld-example-app-vite)

### webpack
- [vue-uploader](https://github.com/simple-uploader/vue-uploader) -> [vue-uploader-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/vue-uploader-vite)
- [douban](https://github.com/jeneser/douban) -> [douban-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/douban-vite)

## Conversion items
The following is a list of configuration items that need to convert

Legend of annotations:

| Mark | Description |
| ---- | ---- |
|✅|auto convert by `webpack-to-vite`|
|⚠️|need manual convert|
|❌|not support now|

### Base conversion
* ✅ B01: add required devDependencies and dependencies in `package.json`
  * required: `vite-plugin-env-compatible`, `vite`,
  * Vue2 required: `vite-plugin-vue2`
  * Vue3 required: `@vue/compiler-sfc`, `@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx`
* ✅ B02: add vite entry file `index.html` to root directory
  * add entry point like: `<script type="module" src="/src/main.js"></script>`, don't need to add `dev-client` entry point because vite support HMR default
* ✅ B03: add vite config file `vite.config.js` to root directory
* ✅ B04: import and use required plugins in `vite.config.js`
  * required `vite-plugin-env-compatible`
  * Vue2 required: `vite-plugin-vue2`, pass `{ jsx: true }` option to enable `jsx` support default
  * Vue3 required: `@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx`
* ✅ B05: support imports that omit `.vue` extension
  * in `vite.config.js`, add `.vue` to `resolve.extensions` to default configuration,
    then you may encounter issue like '[Problems caused by using alisaes and omitting file suffixes at the same time](https://github.com/vitejs/vite/issues/3532)',
    we use patch to fix this issue, in case of vite didn't accept relate PR
* ✅ B06: sass support
  * if using `node-sass` dependency before, convert to `sass` dependency
* ✅ B07: postcss 8 support
  * if using postcss 8 before, add `postcss` dependency
* ⚠️ B08: fix issue '[No matching export for import typescript interface](https://github.com/vitejs/vite/issues/2117)'
  * Do not re-export type or interface in vite. You can just export it in file A and import it in file B. Don't try to export it in file B again.
  The following is an error with re-export a type or interface:
  ```
  Uncaught SyntaxError: The requested module '/src/app/reducers/state.ts' does not provide an export named 'RootState'
  ```
  * Just remove all re-export type or interface in typescript project and modify relate import path
* ⚠️ B09: remove Hot Module Replacement (or HMR) relate code because vite support HMR default.
  * The following error occur when project contain HMR relate code:
  ```
  index.tsx:6 Uncaught ReferenceError: module is not defined
    at index.tsx:6
  ```
* ⚠️ B10: CSS Modules
  * In vite, any CSS file ending with .module.css is considered a CSS modules file
  * That is mean you need to covert `.css` file to `.module.css` to implement CSS Modules
  
### Vue-CLI conversion
> Vue-CLI conversion are base on `vue.config.js`, map configuration to `vite.config.js`

* ✅ V01: base public path
  * `process.env.PUBLIC_URL` or `publicPath` or `baseUrl` -> `base`
* ✅ V02: css options
  * `css.loaderOptions` -> `css.preprocessorOptions`
  * `css.loaderOptions.less.lessOptions.modifyVars` -> `css.preprocessorOptions.less.modifyVars`
  * if there is only `css.loaderOptions.sass` options, convert to `css.preprocessorOptions.sass` and `css.preprocessorOptions.sass`.
    The `sass` configuration takes effect both `sass` and `scss` in Vue-CLI while vite need configure they respectively
* ✅ V03: server options
  * default set `server.strictPort = false`
  * `process.env.PORT` or `devServer.port` -> `server.port`
  * `process.env.DEV_HOST` or `devServer.public` or `devServer.host` -> `server.host`, and replace `http://` or `https://` to `''`
  * `devServer.open`, `devServer.https` -> `server.open`, `server.https`
  * `devServer.proxy` -> `server.proxy`, in proxy configuration, convert `pathRewrite` -> `rewrite`
* ✅ V04: build options
  * `outputDir` -> `build.outDir`
  * `css.extract` -> `build.cssCodeSplit`
  * if `process.env.MODERN === 'true'`, set `build.minify = esbuild`
  * if `process.env.GENERATE_SOURCEMAP === 'true'` or `vueConfig.productionSourceMap` or `css.sourceMap` -> `build.sourcemap`
* ✅ V05: `resolve.alias` options
  * add default alias options
  ```javascript
  resolve: {
    alias: [
      { find: '/^~/', replacement: ''},
      { find: '@', replacement: path.resolve(__dirname,'src') }
    ]
  }
  ```
  * convert webpack alias options to match format above
* ✅ V06: default values exposed by plugins or client-side env variables
  * replace jsp scriptlet tags in `index.html` to exact values
  
### Webpack conversion
> Webpack conversion are base on `webpack.config.js` or `webpack.base.js、webpack.dev.js、webpack.prod.js|webpack.build.js|webpack.production.js`, map configuration to `vite.config.js`

> Note: if you are not using configuration file above, you need to convert configuration manually instead using tool

* ✅ W01: build input options
  * if `entry` is `string` type, `entry` -> `build.rollupOptions.input`
  * if `entry` is `object` type, convert each object property and each array element to `build.rollupOptions.input`
  * if `entry` is `function` type, convert function execute result to `build.rollupOptions.input`
* ✅ W02: outDir options
  * `output.path` -> `build.outDir`
* ✅ W03: `resolve.alias` options
  * add default alias options
  ```javascript
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname,'src') }
    ]
  }
  ```
  * convert webpack alias options to match format above
  * `resolve.alias` options key has trailing `$`, need to remove '$' and re-assign an exact path value
* ✅ W04: server options
  * `devServer.host`, `devServer.port`, `devServer.proxy`, `devServer.https`, `devServer.contentBase` -> `server.host`, `server.port`, `server.proxy`, `server.https`, `server.base`
* ✅ W05: define options
  * `new webpack.DefinePlugin()` -> `define`
  
### Others
* ⚠️ O01: use CommonJS syntax, e.g. `require('./')`
  * add vite plugin `@originjs/vite-plugin-commonjs`, see detail: https://github.com/originjs/vite-plugins/tree/main/packages/vite-plugin-commonjs
  * plugin above support part of CommonJS syntax, still, some special syntax didn't support, recommend covert to ES Modules syntax
* ❌ O02: use ElementUI, see detail: https://github.com/vitejs/vite/issues/3370
  ```
   [vite] Uncaught TypeError: Cannot read property '$isServer' of undefined
    at node_modules/_element-ui@2.15.1@element-ui/lib/utils/dom.js (:8080/node_modules/.vite/element-ui.js?v=675d2c77:1189)
    at __require (:8080/node_modules/.vite/chunk-6VNJZP5B.js?v=675d2c77:12)
    at node_modules/_element-ui@2.15.1@element-ui/lib/utils/popup/popup-manager.js (:8080/node_modules/.vite/element-ui.js?v=675d2c77:1478)
    at __require (:8080/node_modules/.vite/chunk-6VNJZP5B.js?v=675d2c77:12)
    at node_modules/_element-ui@2.15.1@element-ui/lib/utils/popup/index.js (:8080/node_modules/.vite/element-ui.js?v=675d2c77:1701)
    at __require (:8080/node_modules/.vite/chunk-6VNJZP5B.js?v=675d2c77:12)
    at node_modules/_element-ui@2.15.1@element-ui/lib/utils/vue-popper.js (:8080/node_modules/.vite/element-ui.js?v=675d2c77:2546)
    at __require (:8080/node_modules/.vite/chunk-6VNJZP5B.js?v=675d2c77:12)
    at Object.5 (:8080/node_modules/.vite/element-ui.js?v=675d2c77:6861)
    at __webpack_require__ (:8080/node_modules/.vite/element-ui.js?v=675d2c77:6547)
  ```
* ⚠️ O03: css automatic imports
  * if use `style-resources-loader` before, try to replace by `additionalData`. Example:
  ```javascript
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        resolve('src/styles/var.less'),
        resolve('src/styles/mixin.less')
      ]
    }
  }
  ```
  ->
  ```javascript
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import 'src/styles/var.less';` + `@import 'src/styles/mixin.less';`
      }
    }
  }
  ```
* ⚠️ O04: imports path include multiple alias like: `@import '~@/styles/global.scss'`, which is includes alias `~` and `@` 
  * add an alias configure `{ find: /^~@/, replacement: path.resolve(__dirname, 'src') }` to `resolve.alias` options, and place it on first
* ⚠️ O05: use `jsx` syntax in `.vue` file
  * make sure enable `jsx` support, Vue2 add plugin `vite-plugin-vue2` and pass `{ jsx: true }` option, Vue3 add plugin `@vitejs/plugin-vue-jsx`
  * add attribute `lang="jsx"` to `script` label, e.g. `<script lang="jsx"></script>`
  * If the following error occurs
  ```
  3:54:29 PM [vite] Internal server error: /Users/Chieffo/Documents/project/Vue-mmPlayer/src/base/mm-icon/mm-icon.vue?vue&type=script&lang.tsx: Duplicate declaration "h" (This is an error on an internal node. Probably an internal error.)
  Plugin: vite-plugin-vue2
  File: /Users/Chieffo/Documents/project/Vue-mmPlayer/src/base/mm-icon/mm-icon.vue?vue&type=script&lang.tsx
      at File.buildCodeFrameError (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/core/lib/transformation/file/file.js:244:12)
      at Scope.checkBlockScopedCollisions (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/scope/index.js:421:22)
      at Scope.registerBinding (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/scope/index.js:581:16)
      at Scope.registerDeclaration (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/scope/index.js:523:14)
      at Object.BlockScoped (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/scope/index.js:240:12)
      at Object.newFn (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/visitors.js:212:17)
      at NodePath._call (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/path/context.js:53:20)
      at NodePath.call (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/path/context.js:36:14)
      at NodePath.visit (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/path/context.js:90:31)
      at TraversalContext.visitQueue (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/context.js:99:16)
      at TraversalContext.visitMultiple (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/context.js:68:17)
      at TraversalContext.visit (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/context.js:125:19)
      at Function.traverse.node (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/index.js:76:17)
      at NodePath.visit (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/path/context.js:97:18)
      at TraversalContext.visitQueue (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/context.js:99:16)
      at TraversalContext.visitSingle (/Users/Chieffo/Documents/project/Vue-mmPlayer/node_modules/@babel/traverse/lib/context.js:73:19)
  ```
  update config to `babel.config.js`
  ```javascript
  module.exports = {
    presets: [
      '@vue/app'
    ]
  }
  ```
  ->
  ```javascript
  module.exports = {
    presets: [
      ['@vue/babel-preset-jsx']
    ]
  }
  ```
  see detail: https://vuejs.org/v2/guide/render-function.html#JSX
* ⚠️ O06: use webpack api `require.context`
  * add vite plugin `@originjs/vite-plugin-require-context`, see detail: https://github.com/originjs/vite-plugins/tree/main/packages/vite-plugin-require-context
* ✅ O07: fix issue 'Compiling error when the template of the .vue file has the attribute lang="html"'
  * remove `lang="html"` attribute from `template` label, see detail: https://github.com/vuejs/vue-loader/issues/1443
* ❌ O08: use webpack api `require.ensure`
* ⚠️ O09: convert dynamic imports that paths include alias to absolute path or relative path, see detail: see detail: https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
  ```javascript
  () => import('@/components/views/test.vue')
  ```
  ->
  ```javascript
  () => import('./components/views/test.vue')
  ```
