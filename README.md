English | [简体中文](./README-zh.md)

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
* ✅ B01: add necessary devDependencies and dependencies in `package.json`
  * necessary: `vite-plugin-env-compatible`, `vite-plugin-html`, `vite`,
  * necessary for Vue2: `vite-plugin-vue2`
  * necessary for Vue3: `@vue/compiler-sfc`, `@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx`
* ✅ B02: add vite's entry file `index.html` to root directory
  * multiple entries defined by the `pages` option in `vue.config.js` is supported
  * please add entry point like `<script type="module" src="/src/main.js"></script>`. There's no need to add `dev-client` entry point cause vite supports HMR by default
* ✅ B03: add vite's config file `vite.config.js` to root directory
* ✅ B04: import and use necessary plugins in `vite.config.js`
  * necessary: `vite-plugin-env-compatible`
  * necessary for Vue2: `vite-plugin-vue2`, we set `{ jsx: true }` option to enable `jsx` support by default
  * necessary for Vue3: `@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx`
* ✅ B05: imports that omit `.vue` extension is supported
  * If the `resolve.extensions` is set to be `['.mjs','.js','.ts','.jsx','.tsx','.json ','.vue']`, in `vite.config.js`,
    then you may encounter errors like '[Problems caused by using alisaes and omitting file suffixes at the same time](https://github.com/vitejs/vite/issues/3532)'.
    We use a patch to fix this issue, in case of vite didn't accept relate PR
* ✅ B06: `sass` is supported
  * if `node-sass` is used in dependency, then we'll convert it to `sass` to dependencies
* ✅ B07: `postcss 8` is supported
  * if `postcss 8` is used, then we'll add `postcss` to dependencies
* ⚠️ B08: fix issue '[No matching export for import typescript interface](https://github.com/vitejs/vite/issues/2117)'
  * Do not re-export typescript type or interface in vite. You can just export it in file A and import it in file B. Don't try to export it in file B again.
  The following error may occur if a type or a interface is re-exported:
  ```
  Uncaught SyntaxError: The requested module '/src/app/reducers/state.ts' does not provide an export named 'RootState'
  ```
  * Just remove all re-export types or interfaces in typescript project and modify corresponding imports
* ⚠️ B09: remove `Hot Module Replacement`(aka HMR) related code because vite supports HMR by default.
  * The following error may occur when project contains HMR relate code:
  ```
  index.tsx:6 Uncaught ReferenceError: module is not defined
    at index.tsx:6
  ```
* ⚠️ B10: CSS Modules
  * In vite, any CSS files ending with `.module.css` is considered a CSS modules file
  * That means you need to covert files with extension of `.css` to files with extension of `.module.css` to implement CSS Modules
* ⚠️ B11: default values exposed by plugins
  * The error `htmlWebpackPlugin is not defined` may occur if `index.html` includes `htmlWebpackPlugin.options.variableName`. You need to add a plugin in `vite.config.js` like this:
  ```js
  plugins: [
    injectHtml: ({
      injectData: {
        htmlWebpackPlugin: {
          options: {
            variableName: value
          }
        }
      }
    })
  ]
  ```

### Vue-CLI conversion
> Vue-CLI conversion is based on `vue.config.js`. Configurations will be transformed and written to `vite.config.js`

* ✅ V01: base public path
  * `process.env.PUBLIC_URL` or `publicPath` or `baseUrl` -> `base`
* ✅ V02: css options
  * `css.loaderOptions` -> `css.preprocessorOptions`
  * `css.loaderOptions.less.lessOptions.modifyVars` -> `css.preprocessorOptions.less.modifyVars`
  * with only `css.loaderOptions.sass` option is set, it will be converted to `css.preprocessorOptions.sass` and `css.preprocessorOptions.sass`.
    The `sass` configuration influence both `sass` and `scss` in Vue-CLI while vite need to configure them respectively
* ✅ V03: server options
  * `server.strictPort = false` is set by default
  * `process.env.PORT` or `devServer.port` -> `server.port`
  * `process.env.DEV_HOST` or `devServer.public` or `devServer.host` -> `server.host`, and convert `http://` or `https://` to `''`
  * `devServer.open`, `devServer.https` -> `server.open`, `server.https`
  * if `devServer.proxy` -> `server.proxy` is transformed in proxy configuration, we'll also `pathRewrite` -> `rewrite`
* ✅ V04: build options
  * `outputDir` -> `build.outDir`
  * `css.extract` -> `build.cssCodeSplit`
  * if `process.env.MODERN === 'true'` is set, we'll also set `build.minify = esbuild`
  * `process.env.GENERATE_SOURCEMAP === 'true'` or `vueConfig.productionSourceMap` or `css.sourceMap` -> `build.sourcemap`
* ✅ V05: `resolve.alias` options
  * add alias options by default
  ```javascript
  resolve: {
    alias: [
      { find: '/^~/', replacement: ''},
      { find: '@', replacement: path.resolve(__dirname,'src') }
    ]
  }
  ```
  * webpack alias options will be converted to match format above
* ✅ V06: client-side env variables
  * extract variable names in jsp scriptlet tags
  * `VUE_APP_VARIABLE` -> `process.env['VUE_APP_VARIABLE']`
* ✅ V07: css automatic imports
  * if 'style-resources-loader' is used to load css processor resources, the `pluginOptions.'style-resources-loader'`. Configurations will be transformed and written to `css.preprocessorOptions`
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
        additionalData: `@import "src/styles/var.less";@import "src/styles/mixin.less";`
      }
    }
  }
  ```
  
### Webpack conversion
> Webpack conversion is based on `webpack.config.js` or `webpack.base.js/webpack.dev.js/webpack.prod.js` or `webpack.build.js/webpack.production.js`, map configuration to `vite.config.js`

> Note: if you are not using configuration files above, you need to convert configurations manually

* ✅ W01: build entry options
  * if `entry` is `string` type: `entry` -> `build.rollupOptions.input`
  * if `entry` is `object` type: the properties of `entry` will be converted set to `build.rollupOptions.input`
  * if `entry` is `function` type: execute result of `entry` will be set to `build.rollupOptions.input`
* ✅ W02: `outDir` options
  * `output.path` -> `build.outDir`
* ✅ W03: `resolve.alias` options
  * add alias options by default
  ```javascript
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname,'src') }
    ]
  }
  ```
  * webpack alias options will also be converted to match the configuration above
  * for `resolve.alias` configurations trailing with `$`, we'll remove the trailing '$' and set an accurate value
* ✅ W04: server options
  * `devServer.host`, `devServer.port`, `devServer.proxy`, `devServer.https`, `devServer.contentBase` -> `server.host`, `server.port`, `server.proxy`, `server.https`, `server.base`
* ✅ W05: define options
  * `new webpack.DefinePlugin()` -> `define`
  
### Others
* ⚠️ O01: for CommonJS syntax, e.g. `require('./')`
  * you can use vite plugin `@originjs/vite-plugin-commonjs`, see also [here](https://github.com/originjs/vite-plugins/tree/main/packages/vite-plugin-commonjs).
    Please note that the plugin only supports part of CommonJS syntax. That means some syntax is not supported. You need to covert them to ES Modules syntax manually
* ❌ O02: for `Element-UI`, see also [here](https://github.com/vitejs/vite/issues/3370)
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
* ⚠️ O03: imports that containing multiple alias like: `@import '~@/styles/global.scss'`, which includes alias `~` and `@` at the same time 
  * you can add an alias `{ find: /^~@/, replacement: path.resolve(__dirname, 'src') }` to `resolve.alias` options, and place it as the first alias configuration
* ⚠️ O04: for `jsx` syntax in `.vue` file
  * you need to enable `jsx` support : In Vue2, add plugin `vite-plugin-vue2` and set `{ jsx: true }` option. In Vue3, add plugin `@vitejs/plugin-vue-jsx`
  * you also need to add attribute `lang="jsx"` to `script` label if jsx syntax is used, e.g. `<script lang="jsx"></script>`
  * If you encountered the following error
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
  you can try to update configuration of `babel.config.js` like this :
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
  see also [here](https://vuejs.org/v2/guide/render-function.html#JSX)
* ⚠️ O05: for webpack syntax `require.context`
  * add vite plugin `@originjs/vite-plugin-require-context`, see also [here](https://github.com/originjs/vite-plugins/tree/main/packages/vite-plugin-require-context)
* ✅ O06: we have fixed the error `Compiling error when the template of the .vue file has the attribute lang="html"`
  * we will remove `lang="html"` attribute from `template` label by default, see also [here](https://github.com/vuejs/vue-loader/issues/1443)
* ❌ O07: webpack syntax `require.ensure` is not supported
* ⚠️ O08: you need to convert `dynamic imports` that include alias to `absolute paths` or `relative paths` like the followings, see also [here](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations)
  ```javascript
  () => import('@/components/views/test.vue')
  ```
  ->
  ```javascript
  () => import('./components/views/test.vue')
  ```
