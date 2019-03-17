---
layout: home
title: Riot.js — Simple and elegant component-based UI library
description: Riot lets you build user interfaces with custom tags using simple and enjoyable syntax.
---

## Why do we need a new UI library?

The frontend space is indeed crowded, but we honestly feel the solution is still "out there". We believe Riot.js offers the right balance for solving the great puzzle.

So — here's why we need one:


### 1. Custom elements

Riot brings custom elements to all modern browsers without the use of any polyfill!

``` html
<todo>
  <!-- layout -->
  <h1>{ props.title }</h1>

  <ul>
    <li each={ item in state.items }>{ item }</li>
  </ul>

  <form onsubmit={ add }>
    <input>
    <button>Add #{ state.items.length + 1 }</button>
  </form>

  <!-- style -->
  <style>
    :host {
      padding: 16px;
    }
  </style>

  <!-- logic -->
  <script>
    export default {
      state: {
        items: []
      },
      add(e) {
        e.preventDefault()
        const input = e.target

        this.state.items.push(input.value)
        this.update()

        input.value = ''
      }
    }
  </script>
</todo>
```

A custom element glues relevant HTML and javascript together forming a reusable component. Think React + Polymer but with enjoyable syntax and a small learning curve.

#### Human-readable

Custom tags let you build complex views with HTML. Your application might look something like this:

``` html
<body>
  <h1>Acme community</h1>

  <forum-header/>

  <div class="content">
    <forum-threads/>
    <forum-sidebar/>
  </div>

  <forum-footer/>

  <script>riot.mount('*', { api: forum_api })</script>
</body>
```

HTML syntax is the *de facto* language of the web and it's designed for building user interfaces. The syntax is explicit, nesting is inherent to the language, and attributes offer a clean way to provide options for custom tags.

Riot tags are [converted](/compiler/) to pure javascript before browsers can execute them.


#### DOM Expressions binding
- Absolutely the smallest possible amount of DOM updates and reflows
- One way data flow: updates and unmounts are propagated downwards from parent to children
- Expressions are pre-compiled and cached for high performance
- Lifecycle events for more control
- Server-side rendering of custom tags for universal (isomorphic) applications


#### Close to standards
- No proprietary event system
- No need for external polyfills or additional libraries
- The rendered DOM can be freely manipulated with other tools
- No extra HTML root elements or `data-` attributes
- Web Components like API
- Modern modules syntax


#### Tooling friendly
- Integrate NPM ecosystem
- Node.js [require hooks](https://github.com/riot/ssr#usage)
- Develop with [webpack](https://github.com/riot/webpack-loader), [rollup](https://github.com/riot/rollup-plugin-riot) or [Browserify](https://github.com/riot/riotify) plugins


## 2. Simple and minimalistic

Minimalism sets Riot apart from others:


### 1. Enjoyable syntax

One of the design goals was to introduce a powerful tag syntax with as little boilerplate as possible:

- No brain overhead for attributes like `className`, `htmlFor`...
- Shortcut spread operator for multiple attributes: `<p ...{ attributes }></p>`
- Expressions Interpolation: `Add #{ items.length + 1 }` or `class="item { activeClass }"`
- `export default` statement for the tags interfaces
- Automatic CSS styling via `<style>` tag without shadow DOM hassles


### 2. Small learning curve

Riot has between 10 and 100 times fewer API methods than other UI libraries.

- Less to learn. Fewer books and tutorials to view
- Only template directives `if`, `each` and `is`
- Less proprietary stuff and more standard stuff


### 3. Tiny size

- Only 6kb!
- Fewer bugs
- Faster to parse and cheaper to download
- Embeddable. The library ought to be smaller than the application
- Less to maintain. We don't need a big team to maintain Riot


### 4. Small, but complete

Riot has all the essential building blocks for modern client-side applications:

- "Reactive" views for building user interfaces
- High performance also with many DOM nodes
- No Side Effects

Riot is an "open stack". It's meant for developers who want to avoid framework specific idioms. The generic tools let you mix and match design patterns.

## Conclusion

Riot is Web Components for everyone. Think React + Polymer but without the bloat. It's intuitive to use and it weighs almost nothing. And it works today. No reinventing the wheel, but rather taking the good parts of what's there and making the simplest tool possible.

We should focus on reusable components instead of templates. According to the developers of React:

> Templates separate technologies, not concerns.

By having related layout and logic together under the same component the overall system becomes cleaner. We respect React for this important insight.
