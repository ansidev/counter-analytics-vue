import type { App, Plugin } from 'vue'
import type { CounterAnalyticsPluginOptions } from './types'

export type { CounterAnalyticsPluginOptions } from './types'

/**
 * Vue Composition API for automatically tracking navigation changes on Vue v3 apps.
 *
 * @param options Counter Analytics plugin options.
 */
export const useCounterAnalytics = (options: CounterAnalyticsPluginOptions) => {
  const externalScript = document.createElement('script')
  externalScript.setAttribute('src', 'https://cdn.counter.dev/script.js')
  externalScript.setAttribute('data-id', options.id)
  externalScript.setAttribute('data-utcoffset', options.utcOffset.toString())
  document.head.appendChild(externalScript)
}

const plugin: Plugin = {
  install: (_: App, options: CounterAnalyticsPluginOptions) => {
    useCounterAnalytics(options)
  },
}

export default plugin
