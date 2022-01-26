[English](./README.md) | 简体中文

[![Test](https://github.com/originjs/webpack-to-vite/actions/workflows/test.yml/badge.svg)](https://github.com/originjs/webpack-to-vite/actions/workflows/test.yml/) [<img src="https://img.shields.io/npm/v/@originjs/webpack-to-vite" alt="npm" />](https://www.npmjs.com/package/@originjs/webpack-to-vite)

# Webpack to Vite
将 webpack 项目转换为 vite 项目。<br/>
webpack-to-vite 已被官方收录，[详情](https://github.com/vitejs/awesome-vite#migrations)

## 快速开始

直接通过 npx 使用:
```
$ npx @originjs/webpack-to-vite <project path>
```
...或者全局安装使用:
```
$ npm install @originjs/webpack-to-vite -g
$ webpack-to-vite <project path>
```
> 注意：默认转换的是 vue-cli 项目。 传入 `-t webpack` 选项来转换 webpack 项目。

## 选项
该命令行工具提供以下选项：
```
$ webpack-to-vite --help
  
Usage: webpack-to-vite [options] [root]

Options:
  -v, --version            显示版本号
  -d --rootDir <path>      要转换的项目目录
  -t --projectType <type>  项目类型，传入 vue-cli 或 webpack（默认：vue-cli）
  -e --entry <type>        整个构建过程的入口，webpack 或 vite 会从那些入口文件开始构建，如果没有指定入口文件，则默认使用 src/main.ts 或 src/main.js
  -h, --help               显示命令帮助
```

## 成功转换的项目

以下是使用工具成功从 webpack 项目转换为 vite 项目的项目列表

### demos
- [helloworld-vue2](https://github.com/originjs/webpack-to-vite-demos/tree/main/helloworld-vue2)
- [helloworld-vue3](https://github.com/originjs/webpack-to-vite-demos/tree/main/helloworld-vue3)
- [helloworld-webpack](https://github.com/originjs/webpack-to-vite-demos/tree/main/helloworld-webpack)

### vue-cli
- [vue-manage-system](https://github.com/lin-xin/vue-manage-system) -> [vue-manage-system-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/vue-manage-system-vite)
- [newbee-mall-vue3-app](https://github.com/newbee-ltd/newbee-mall-vue3-app) -> [newbee-mall-vue3-app-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/newbee-mall-vue3-app-vite)
- [vue-realworld-example-app](https://github.com/gothinkster/vue-realworld-example-app) -> [vue-realworld-example-app-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/vue-realworld-example-app-vite)

### webpack
- [vue-uploader](https://github.com/simple-uploader/vue-uploader) -> [vue-uploader-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/vue-uploader-vite)
- [douban](https://github.com/jeneser/douban) -> [douban-vite](https://github.com/originjs/webpack-to-vite-demos/tree/main/douban-vite)

## 转换项
以下是需要转换的配置项列表

图例注解：

| 图例 | 描述 |
| ---- | ---- |
|✅|通过 `webpack-to-vite` 自动转换|
|⚠️|需要手动转换|
|❌|目前不支持|

### 基础转换项
* ✅ B01: 在 `package.json` 中添加需要的 devDependencies 和 dependencies
  * 必要的依赖：`vite-plugin-env-compatible`, `vite-plugin-html`, `vite`,
  * Vue2 项目需要的依赖：`vite-plugin-vue2`
  * Vue3 项目需要的依赖：`@vue/compiler-sfc`, `@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx`
* ✅ B02: 将 vite 入口文件 `index.html` 添加到根目录
  * 支持在 `vue.config.js` 的 `pages` 选项中配置的多个入口的转换
  * 以这种方式添加入口：`<script type="module" src="/src/main.js"></script>`，不需要添加 `dev-client` 入口，因为 vite 默认支持 HMR
* ✅ B03: 将 vite 配置文件 `vite.config.js` 添加到根目录
* ✅ B04: 在 `vite.config.js` 中导入和使用需要的插件
  * 必要的插件： `vite-plugin-env-compatible`
  * Vue2 项目需要的插件：`vite-plugin-vue2`，默认通过 `{ jsx: true }` 选项启用 `jsx` 支持
  * Vue3 项目需要的插件：`@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx`
* ✅ B05: 支持省略 `.vue` 扩展名的导入
  * ~~在 `vite.config.js` 中，设置 `resolve.extensions` 配置项为 `['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']`，
    然后您可能会遇到 "[Problems caused by using alisaes and omitting file suffixes at the same time](https://github.com/vitejs/vite/issues/3532)" 这样的问题，
    我们使用补丁来解决这个问题，在 vite 接受相关 PR 之前~~
    自从 vite 发布 `^2.5.0` 版本后已修复
* ✅ B06: sass 支持
  * 如果项目使用到 `node-sass` 依赖，则转换为 `sass` 依赖
* ✅ B07: postcss 8 支持
  * 如果项目使用到 `postcss 8` ，则添加 `postcss` 依赖
* ⚠️ B08: 修复问题 '[No matching export for import typescript interface](https://github.com/vitejs/vite/issues/2117)'
  * 请勿在 vite 中重复导出 typescript 类型或接口。 您只能在文件 A 中将其导出，然后在文件 B 中将其导入。不要尝试在文件 B 中将其再次导出。
    以下是重复导出类型或接口时出现的错误：

  ```
  Uncaught SyntaxError: The requested module '/src/app/reducers/state.ts' does not provide an export named 'RootState'
  ```
  * 删除 typescript 项目中所有重复导出的类型或接口，并修改相关导入路径即可
* ⚠️ B09: 删除模块热更新（或 HMR）相关代码，因为 vite 默认支持 HMR
  * 项目包含 HMR 相关代码时出现以下错误：

  ```
  index.tsx:6 Uncaught ReferenceError: module is not defined
    at index.tsx:6
  ```
* ⚠️ B10: CSS Modules
  * 在 vite 中，任何以 `.module.css` 为后缀名的 CSS 文件都被认为是一个 CSS modules 文件
  * 这意味着您需要将以 `.css` 为后缀的文件转换为以 `.module.css` 为后缀的文件来实现 CSS Modules
* ⚠️ B11: 插件暴露的默认值
  * 当 `index.html` 包含 `htmlWebpackPlugin.options.variableName` 时，会出现 `htmlWebpackPlugin is not defined` 错误，您需要在 `vite.config.js` 中添加插件选项：

  ```
  plugins: [
    injectHtml:({
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

### Vue-CLI 转换项
> Vue-CLI 转换是将 `vue.config.js` 中的配置，转换后设置到 `vite.config.js` 中

* ✅ V01: public path 环境变量

* `process.env.PUBLIC_URL` 或 `publicPath` 或 `baseUrl` -> `base`

* ✅ V02: css 配置
  * `css.loaderOptions` -> `css.preprocessorOptions`
  
  * `css.loaderOptions.less.lessOptions.modifyVars` -> `css.preprocessorOptions.less.modifyVars`
  * 在 Vue-CLI 项目中，`sass` 配置可以同时生效于 `sass` 和 `scss` ，而在 vite 项目中需要对它们分别进行单独配置。因此，即使在 Vue-CLI 项目中只进行了 `css.loaderOptions.sass` 配置，也会在 vite 项目中生成 `css.preprocessorOptions.sass` 和 `css.preprocessorOptions.scss` 两个配置；而如果在 Vue-CLI 项目中只进行 `css.loaderOptions.scss` 配置，则在 vite 项目中只生成 `css.preprocessorOptions.scss` 配置
  
* ✅ V03: server 配置
  * 默认添加 `server.strictPort = false` 配置
  * `process.env.PORT` 或 `devServer.port` -> `server.port`
  * `process.env.DEV_HOST` 或 `devServer.public` 或 `devServer.host` -> `server.host` ，并将 `http://` 或 `https://` 替换为 `''`
  * `devServer.open`, `devServer.https` -> `server.open`, `server.https`
  * `devServer.proxy` -> `server.proxy` ，另外在 proxy 配置中，进行 `pathRewrite` -> `rewrite` 转换
  
* ✅ V04: build 配置
  * `outputDir` -> `build.outDir`
  * `css.extract` -> `build.cssCodeSplit`
  * 如果配置了 `process.env.MODERN === 'true'` ，则添加配置 `build.minify = esbuild`
  * `process.env.GENERATE_SOURCEMAP === 'true'` 或 `vueConfig.productionSourceMap` 或 `css.sourceMap` -> `build.sourcemap`
  
* ✅ V05: `resolve.alias` 配置
  * 默认添加 alias 配置

  ```javascript
  resolve: {
    alias: [
      { find: '/^~/', replacement: ''},
      { find: '@', replacement: path.resolve(__dirname,'src') }
    ]
  }
  ```
  * webpack 中的 alias 配置也会按照类似的方式进行转换

* ✅ V06: 客户端环境变量
  * 提取 jsp 脚本 tag 中的环境变量
  * `VUE_APP_VARIABLE` -> `process.env['VUE_APP_VARIABLE']`
  
* ✅ V07: css 自动化导入
  * 如果使用 'style-resources-loader' 加载 css 预处理器资源，即 `pluginOptions['style-resources-loader']` ，配置将被转换并写入`css.preprocessorOptions`

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
### Webpack 转换项
> Webpack 转换是将`webpack.config.js` 或 `webpack.base.js/webpack.dev.js/webpack.prod.js` 或 `webpack.build.js/webpack.production.js` 中的配置，转换后设置到 `vite.config.js` 中

> 注意：如果您没有在上述文件中进行 webpack 配置，那么工具将无法进行配置转换，您需要手工配置

* ✅ W01: 构建入口配置
  * 如果 `entry` 类型是 `string` ，`entry` -> `build.rollupOptions.input`
  * 如果 `entry` 类型是 `object` ，则将 object 中的每条属性配置到 `build.rollupOptions.input` 中
  * 如果 `entry` 类型是 `function` ，则将 function 的运行结果配置到 `build.rollupOptions.input` 中
* ✅ W02: output 配置
  * `output.path` -> `build.outDir`
  * `output.filename` -> `build.rollupOptions.output.entryFileNames`
  * `output.chunkFilename` -> `build.rollupOptions.output.chunkFileNames`
* ✅ W03: `resolve.alias` 配置
  * 添加默认 alias 配置

  ```javascript
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname,'src') }
    ]
  }
  ```
  * webpack 配置的其他别名也会按照上述格式进行转换
  * 以 `$` 结尾的 `resolve.alias` 配置，需要删除 `$` 并配置为确切的值
* ✅ W04: server 配置
  * `devServer.host`, `devServer.port`, `devServer.proxy`, `devServer.https`, `devServer.contentBase` -> `server.host`, `server.port`, `server.proxy`, `server.https`, `server.base`
* ✅ W05: define 配置
  * `new webpack.DefinePlugin()` -> `define`
  
### 其他转换项
* ⚠️ O01: 使用 CommonJS 规范语法，例如 `require('./')`
  * 添加 vite 插件 `@originjs/vite-plugin-commonjs` ，参阅[这里](https://github.com/originjs/vite-plugins/tree/main/packages/vite-plugin-commonjs)
  * 请注意该插件只支持部分 CommonJS 规范语法，这意味着一些语法是不支持的，您需要手动转换为 ES Modules 规范语法
  * 转换动态 require(例如：`require('@assets/images/' + options.src)`)，你可以参考以下步骤
  1. 使用 Web API `new URL`
  ```vue
  <template>
  <img alt="" :src="imgSrc" />
  </template>
  <script>
  export default {
  name: 'img',
  data: () => ({
    imgSrc: new URL('./assets/logo.png', import.meta.url).href
  })
  }
  </script>
  ```
  ...或使用 Vite 的 API `import.meta.glob`
  1. 创建一个模型保存已导入的模块,使用异步方法动态地导入模块并更新到模型中
  ```js
  // src/store/index.js
  import Vue from 'vue'
  import Vuex from 'vuex'
  const assets = import.meta.glob('../assets/**')
  Vue.use(Vuex)
  export default new Vuex.Store({
    state: {
      assets: {}
    },
    mutations: {
      setAssets(state, data) {
        state.assets = Object.assign({}, state.assets, data)
      }
    },
    actions: {
      async getAssets({ commit }, url) {
        const getAsset = assets[url]
        if (!getAsset) {
          commit('setAssets', { [url]: ''})
        } else {
          const asset = await getAsset()
          commit('setAssets', { [url]: asset.default })
        }
      }
    }
  })
  ```
  2. 在 `.vue` 单文件组件中使用
  ```js
  // img1.vue
  <template>
    <img :src="$store.state.assets['../assets/images/' + options.src]" />
  </template>
  <script>
  export default {
    name: "img1",
    props: {
      options: Object
    },
    watch: {
      'options.src': {
        handler (val) {
          this.$store.dispatch('getAssets', `../assets/images/${val}`)
        },
        immediate: true,
        deep: true
      }
    }
  }
  </script>
  ```
* ❌ O02: 对于 `Element-UI` ，参阅[这里](https://github.com/vitejs/vite/issues/3370)

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
* ⚠️ O03: 包含多个别名的导入，如：`@import '~@/styles/global.scss'`，同时包含了别名 `~` 和 `@`
  * 您可以添加别名配置 `{ find: /^~@/, replacement: path.resolve(__dirname, 'src') }` 到 `resolve.alias` 配置中，并且把该项配置移到别名配置中的第一项
* ⚠️ O04: 在 `.vue` 文件中使用 `jsx` 语法
  * 确保您开启了 `jsx` 支持，在 Vue2 中，需要添加 `vite-plugin-vue2` 插件并传入 `{ jsx: true }` 配置，在 Vue3 中需要添加 `@vitejs/plugin-vue-jsx` 插件
  * 添加 `lang="jsx"` 属性到 `script` 标签，例如 `<script lang="jsx"></script>`
  * 如果您遇到以下错误

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
  您可以尝试更新 `babel.config.js` 配置文件，如下：

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
  参阅[这里](https://vuejs.org/v2/guide/render-function.html#JSX)
* ⚠️ O05: 对于 Webpack 语法 `require.context`
  * 添加 vite 插件 `@originjs/vite-plugin-require-context` ，参阅[这里](https://github.com/originjs/vite-plugins/tree/main/packages/vite-plugin-require-context)
* ✅ O06: 我们修复了错误 'Compiling error when the template of the .vue file has the attribute lang="html"'
  * 从 `template` 标签中移除 `lang="html"` 属性，参阅[这里](https://github.com/vuejs/vue-loader/issues/1443)
* ❌ O07: 不支持 Webpack 语法 `require.ensure`
* ⚠️ O08: 如下所示，您需要手动把包含别名的动态导入转换为绝对路径或相对路径导入。参阅[这里](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations)

  ```javascript
  () => import('@/components/views/test.vue')
  ```
  ->
  ```javascript
  () => import('./components/views/test.vue')
  ```
* ⚠️ O09：如果您遇到构建错误 `[rollup-plugin-dynamic-import-variables] Unexpected token`，则需要删除 `<img>` 标签中的空属性 `srcset` 或 `srcset=""`
* ⚠️ O10: Vite 无法解析一些静态资源，如`.PNG`，你可以把它放在 `assetsInclude` 选项中，比如 `assetsInclude: ['**.PNG']`
* ⚠️ O11：支持 `.md` markdown 文件作为 vue 组件，需要添加 [`vite-plugin-md`](https://github.com/antfu/vite-plugin-md) 插件
