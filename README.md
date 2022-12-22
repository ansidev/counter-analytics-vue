<img src="/counter.svg" alt="Counter Analytics" height="100" />

# Counter Analytics Vue 3 integration

[![npm version](https://img.shields.io/npm/v/counter-analytics-vue.svg)](https://www.npmjs.com/package/counter-analytics-vue)
[![Build Status](https://github.com/ansidev/counter-analytics-vue/workflows/publish_npm_package/badge.svg)](https://github.com/ansidev/counter-analytics-vue/actions/workflows/publish.yml)
[![Sourcegraph](https://sourcegraph.com/github.com/ansidev/counter-analytics-vue/-/badge.svg)](https://sourcegraph.com/github.com/ansidev/counter-analytics-vue?badge)
[![Netlify Status](https://api.netlify.com/api/v1/badges/d1146628-1539-4582-8764-15f4108e978d/deploy-status)](https://app.netlify.com/sites/counter-analytics-vue/deploys)

Unofficial [Counter Analytics](https://go2.vn/dr9ng) integration for Vue.js.

## Integration

### Install

Run the following command to install in your project:

```
npm install counter-analytics-vue
```

Or with yarn:

```
yarn add counter-analytics-vue
```

Or with pnpm:

```
pnpm add counter-analytics-vue
```

### Basic usage

You can now import, and use the Counter Analytics hook on your project:

```typescript
// ./src/main.ts

import { createApp } from 'vue'
import CounterAnalytics from 'counter-analytics-vue'

const app = createApp({})

app.use(CounterAnalytics, {
  id: 'COUNTER_ANALYTICS_ID',
  utcOffset: 0,
})
```

### Advanced options
You can use `useCounterAnalytics` hook, it accepts an option object as the parameter.

You can always [create an issue](https://github.com/ansidev/counter-analytics-vue/issues/new) in case of any questions! 😀

## Contribution

Feel free to contribute to the source code by opening a pull requests.

For any questions, you can [open an issue](https://github.com/ansidev/counter-analytics-vue/issues/new), refer to the official [Counter project](https://github.com/ihucos/counter.dev) or reach them at `hey@counter.dev`.

## Donate

You can support this project by donating me at:
- [Paypal](https://paypal.me/ansidev)
- [Ko-fi](https://ko-fi.com/ansidev)
- [Buy me a coffee](https://buymeacoffee.com/ansidev)

## License

This source code is available under the [MIT LICENSE](/LICENSE).
