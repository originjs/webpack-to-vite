export const DEFAULT_VUE_VERSION = undefined
export const VUE_COMPILER_SFC_VERSION = '^3.2.26'
export const VITE_VERSION = '^2.7.2'
export const VITE_PLUGIN_VUE_VERSION = '^2.0.1'
export const VITE_PLUGIN_VUE_JSX_VERSION = '^1.3.2'
export const VITE_PLUGIN_VUE_TWO_VERSION = '^1.9.0'
export const VITE_PLUGIN_ENV_COMPATIBLE = '^1.1.1'
export const VITE_PLUGIN_HTML = '2.1.1'
export const SASS_VERSION = '^1.45.0'
export const VITE_PLUGIN_COMMONJS_VERSION = '^1.0.1'
export const VITE_PLUGIN_REQUIRE_CONTEXT_VERSION = '1.0.9'
export const POSTCSS_VERSION = '^8.4.5'
export const VUE_CONFIG_HTML_PLUGIN = 'htmlPluginOptions'

export const TRANSFORMATION_TYPES = {
  addJsxTransformation: 'addJsxTransformation',
  removeHtmlLangInTemplateTransformation:
    'removeHtmlLangInTemplateTransformation',
  indexHtmlTransformationVueCli: 'indexHtmlTransformationVueCli',
  indexHtmlTransformationWebpack: 'indexHtmlTransformationWebpack',
  lazyLoadingRoutesTransformation: 'lazyLoadingRoutesTransformation',
  chainWebpackTransformation: 'chainWebpackTransformation'
}

export const PARSER_TYPES = {
  FindJsxInScript: 'FindJsxInScript',
  FindRequireContextParser: 'FindRequireContextParser',
  FindWebpackConfigAttrs: 'FindWebpackConfigAttrs',
  FindChainWebpackConfigAttrs: 'FindChainWebpackConfigAttrs'
}
