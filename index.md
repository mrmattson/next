---
layout: home
title: Riot.js — Simple and elegant component-based UI library
description: Riot lets you build user interfaces with custom tags using simple and enjoyable syntax. It uses a virtual DOM similar to React but faster. Riot is very tiny compared to industry standards. We think there is a clear need for another UI library.
---

<grid class="hero" cols="8">
  <c span="3-4" span-s="2-5">
    <img src="/img/logo/riot-logo.svg">
  </c>
  <c span="row">
    <h1>Simple and elegant component-based UI library</h1>
    <p>Custom tags • Enjoyable syntax • Elegant API • Tiny size</p>
  </c>
</grid>

## Why do we need a new UI library?

The frontend space is indeed crowded, but we honestly feel the solution is still "out there". We believe Riot offers the right balance for solving the great puzzle. While React seems to do it, they have serious weak points that Riot will solve.

So — here's why we need one:


## 1. Custom tags

Riot brings custom tags to all browsers.

``` html
<todo>

  <!-- layout -->
  <h3>{ props.title }</h3>

  <ul>
    <li each={(item, i) in state.items }>{ item }</li>
  </ul>

  <form onsubmit={ add }>
    <input>
    <button>Add #{ state.items.length + 1 }</button>
  </form>

  <!-- style -->
  <style>
    h3 {
      font-size: 14px;
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

A custom tag glues relevant HTML and JavaScript together forming a reusable component. Think React + Polymer but with enjoyable syntax and a small learning curve.


### Human-readable

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

Riot tags are [converted](/guide/compiler/) to pure JavaScript before browsers can execute them.



