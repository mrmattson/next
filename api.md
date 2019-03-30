---
title: API
layout: detail
class: apidoc
---


## Component object

Each Riot.js component is created as lightweight object. The object that you export via `export default` will have the following properties:

- Attributes
  - `props` - the props received as object
  - `state` - the current component state object
  - `root` - root DOM node
- [Create/Destroy](#createdestroy)
  - `mount` - initialize the component
  - `unmount` - destroy the component and remove it from the DOM
- [State handling](#state-handling) methods
  - `update` - method to update the component state
  - `shouldUpdate` - method to pause the component rendering
- [Lifecycle callbacks](#lifecycle)
  - `onBeforeMount` - called before the component will be mounted
  - `onMounted` - called after the component has rendered
  - `onBeforeUpdate` - called before updating the component
  - `onUpdated` - callend after the component has been updated
  - `onBeforeUnmount` - called before the component will be removed
  - `onUnmounted` - called once the component has been removed
- [Helpers](#helpers)
  - `$` - method similar to `document.querySelector`
  - `$$` - method similar to `document.querySelectorAll`


### Component Interface

If you familiar with Typescript here you can read how a Riot.js component interface looks like:

```ts
// This interface is only exposed and any Riot component will receive the following properties
interface RiotCoreComponent {
  // automatically generated on any component instance
  props: object;
  root: HTMLElement;
  mount(element: HTMLElement, initialState?: object, parentScope?: object): RiotComponent;
  update(newState?:object, parentScope?: object): RiotComponent;
  unmount(keepRootElement: boolean): RiotComponent;

  // Helpers
  $(selector: string): HTMLElement;
  $$(selector: string): [HTMLElement];
}

// All the RiotComponent Public interface properties are optional
interface RiotComponent extends RiotCoreComponent {
  // optional on the component object
  state?: object;

  // state handling methods
  shouldUpdate?(newProps:object, currentProps:object): boolean;

  // lifecycle methods
  onBeforeMount?(currentProps:object, currentState:object): void;
  onMounted?(currentProps:object, currentState:object): void;
  onBeforeUpdate?(currentProps:object, currentState:object): void;
  onUpdated?(currentProps:object, currentState:object): void;
  onBeforeUnmount?(currentProps:object, currentState:object): void;
  onUnmounted?(currentProps:object, currentState:object): void;
}
```

You can use any of the component properties in both the HTML and javascript code. For example:


``` html
<my-component>
  <h3>{ props.title }</h3>

  <script>
    export default {
      onBeforeMount() {
        const {title} = this.props
      }
    }
  </script>
</my-component>
```

You can freely set any property to the component scope and it will be available in the HTML expressions. For example:

``` html
<my-component>
  <h3>{ title }</h3>

  <script>
    export default {
      onBeforeMount() {
        this.title = this.props.title
      }
    }
  </script>
</my-component>
```

Note: if you have some globals, you can also use these references in both the HTML and javascript code:

```js
window.someGlobalVariable = 'Hello!'
```

``` html
<my-component>
  <h3>{ window.someGlobalVariable }</h3>

  <script>
    export default {
      message: window.someGlobalVariable
    }
  </script>
</my-component>
```

<aside class="note note--warning">:warning: beware that the use of global variables in your components might compromise their server side rendering and it's highly not recommended.</aside>


### Create/Destroy

#### component.mount

`component.mount(element: HTMLElement, initialState?: object, parentScope?: object): RiotComponent;`

Any component object can should "mounted on a DOM node" in order to rendered its template becoming interactive.

You will likely never call the `component.mount` method by yourself, you will use instead the [riot.mount](#riotmount) or [riot.component](#riotcomponent) instead.

#### component.unmount

`component.mount(keepRoot?: boolean): RiotComponent`

Detaches the custom component and its children from the page.
If you want to unmount a tag without removing the root node you need to pass `true` to the unmount method

Unmount the tag and remove it template from the DOM:

``` js
myComponent.unmount()
```

Unmount the component keeping the root node into the DOM:

``` js
myComponent.unmount(true)
```


### State handling

#### component.state

Each riot component created has a `state` object property. The `state` object is meant to store all the mutable component properties. For example:

```html
<my-component>
  <button>{ state.message }</button>

  <script>
    export default {
      // initial component state
      state: {
        message: 'hi'
      }
    }
  </script>
</my-component>
```

In this case the component is created with an initial state that can be modified internally via the `component.update` method.

You should avoid to store nested javascript objects into the state property because their references will be shared across multiple component and might generate side effects. To avoid surprises you can export your components also as function

```html
<my-component>
  <button>{ state.message }</button>

  <script>
    export default function MyComponent() {
      // remember to return an object
      return {
        // the initial state will be always fresh created avoiding surprises
        state: {
          nested: {
            properties: 'are ok now'
          },
          message: 'hi'
        }
      }
    }
  </script>
</my-component>
```

#### component.update

`component.update(newState?:object, parentScope?: object): RiotComponent;`

Updates the component `state` object triggering the re-rendering of all its expressions. This method can eventually be called every time an event handler is dispatched and the user interacts with the application.

``` html
<my-component>
  <button onclick={ onClick }>{ state.message }</button>

  <script>
    export default {
      state: {
        message: 'hi'
      },
      onClick(e) {
        this.update({
          message: 'goodbye'
        })
      }
    }
  </script>
</my-component>
```

You can call this method also manually whenever you need to update your components UI. This typically happens after some non-UI related event: after `setTimeout`, AJAX call or on some server event. For example:

``` html
<my-component>

  <input name="username" onblur={ validate }>
  <span class="tooltip" if={ state.error }>{ state.error }</span>

  <script>
    export default {
      async validate() {
        try {
          const {username} = this.props
          const response = await fetch(`/validate/username/${username}`)
          const json = response.json()
          // do something with the response
        } catch (error) {
          this.update({
            error: error.message
          })
        }
      }
    }
  </script>
</my-component>
```

On above example the error message is displayed on the UI after the `update()` method has been called.

If you want to have more control over your tags DOM updates you can set a custom `shouldUpdate` function, and your tag will update only if that function will return `true`

``` html
<my-component>
  <button onclick={ onClick }>{ state.message }</button>

  <script>
    export default {
      state: {
        message: 'hi'
      },
      onClick(e) {
        this.update({
          message: 'goodbye'
        })
      },
      shouldUpdate(newProps, currentProps) {
        // do not update
        if (this.state.message === 'goodbye') return false
        // if this.state.message is different from 'goodbye' we could update the component
        return true
      }
    }


  </script>
</my-component>
```

The `shouldUpdate` method will always receive 2 arguments: the first one contains the new component properties and the second argument the current ones.

``` html
<my-component>
  <child-tag message={ state.message }></child-tag>
  <button onclick={ onClick }>Say goodbye</button>

  <script>
    export default {
      state: {
        message = 'hi'
      },
      onClick(e) {
        this.update({
          message: 'goodbye'
        })
      }
    }
  </script>
</my-component>

<child-tag>
  <p>{ props.message }</p>

  <script>
    export default {
      shouldUpdate(newProps, currentProps) {
        // update the DOM depending on the new options received
        return newProps.message !== 'goodbye'
      }
    }
  </script>
</child-tag>
```

###  Slots

The `<slot>` tag is a special Riot.js core feature that allows you to inject and compile the content of any custom component inside its template in runtime.
For example using the following riot tag `my-post`

``` html
<my-post>
  <h1>{ props.title }</h1>
  <p><slot/></p>
</my-post>
```

anytime you will include the `<my-post>` tag in your app

``` html
<my-post title="What a great title">
  My beautiful post is <b>just awesome</b>
</my-post>
```

once mounted `riot.mount('my-post')` it will be rendered in this way:

``` html
<my-post>
  <h1>What a great title</h1>
  <p>My beautiful post is <b>just awesome</b></p>
</my-post>
```

The expressions in slot tags will not have access to the properties of the components in which they will be injected

``` html
<!-- This tag just inherits the yielded DOM -->
<child-tag><slot/></child-tag>

<my-component>
  <child-tag>
    <!-- here the child-tag internal properties are not available -->
    <p>{ message }</p>
  </child-tag>
  <script>
    export default {
      message: 'hi'
    }
  </script>
</my-component>
```

#### Named Slots

The `<slot>` tag provides also a mechanism to inject fragments of html specific part of a component template

For example using the following riot tag `my-other-post`

``` html
<my-other-post>
  <article>
    <h1>{ opts.title }</h1>
    <h2><slot name="summary"/></h2>
    <article>
      <slot name="content"/>
    </article>
  </article>
</my-other-post>
```

anytime you will include the `<my-other-post>` tag in your app

``` html
<my-other-post title="What a great title">
  <span slot="summary">
    My beautiful post is just awesome
  </span>
  <p slot="content">
    And the next paragraph describes just how awesome it is
  </p>
</my-other-post>
```

once mounted `riot.mount('my-other-post')` it will be rendered in this way:

``` html
<my-other-post>
  <article>
    <h1>What a great title</h1>
    <h2><span>My beautiful post is just awesome</span></h2>
    <article>
      <p>
        And the next paragraph describes just how awesome it is
      </p>
    </article>
  </article>
</my-other-post>
```

### Lifecycle

Each tag instance is an [observable](./observable) so you can use `on` and `one` methods to listen to the events that happen on the tag instance. Here's the list of supported events:


- "update" – right before the tag is updated. allows recalculation of context data before the UI expressions are updated.
- "updated" – right after the tag is updated. allows do some work with updated DOM
- "before-mount" – right before tag is mounted on the page
- "mount" – right after tag is mounted on the page
- "before-unmount" – before the tag is removed from the page
- "unmount" – after the tag is removed from the page

For example:

``` js
// cleanup resources after tag is no longer part of DOM
this.on('unmount', function() {
  clearTimeout(timer)
})
```

### Helpers

### Manual construction

#### riot.tag(tagName, html, [css], [attrs], [constructor])

Creates a new custom tag "manually" without the compiler.

- `tagName` the tag name
- `html` is the layout with [expressions](/guide/#expressions)
- `css` is the style for the tag (optional)
- `attrs` string of attributes for the tag (optional).
- `constructor` is the initialization function being called before the tag expressions are calculated and before the tag is mounted

#### Example

``` javascript
riot.tag('timer',
  '<p>Seconds Elapsed: { time }</p>',
  'timer { display: block; border: 2px }',
  'class="tic-toc"',
  function (opts) {
    var self = this
    this.time = opts.start || 0

    this.tick = function () {
      self.update({ time: ++self.time })
    }

    var timer = setInterval(this.tick, 1000)

    this.on('unmount', function () {
      clearInterval(timer)
    })

  })
```

See [timer demo](http://jsfiddle.net/gnumanth/h9kuozp5/) and [riot.tag](/api/#component-object) API docs for more details and *limitations*.


<span class="tag red">Warning</span> by using `riot.tag` you cannot enjoy the advantages of the compiler and the following features are not supported:

1. Self-closing tags
2. Unquoted expressions. Write `attr="{ val }"` instead of `attr={ val }`
3. Shorthand ES6 method signatures
4. `<img src={ src }>` must be written as `<img riot-src={ src }>` in order to avoid illegal server requests
5. `<input value={ val }>` must be written as `<img riot-value={ val }>` in order to avoid unexpected IE issues
5. `style="color: { color }"` must be written as `riot-style="color: { color }"` so that style attribute expressions work in IE
6. Scoped CSS precompilation.


You can take advantage of `<template>` or `<script>` tags as follows:

``` html
<script type="tmpl" id="my_tmpl">
  <h3>{ opts.hello }</h3>
  <p>And a paragraph</p>
</script>

<script>
riot.tag('tag-name', my_tmpl.innerHTML, function(opts) {

})
</script>
```


#### Tags without template

<span class="tag red">&gt;=3.5.0</span>

Starting from riot 3.5 you can also create "wrapper tags" without any template as follows:

``` js
riot.tag('tag-name', false, function(opts) {
  this.message = 'hi'
})

```

In this case anytime you will mount a tag named `tag-name` riot will leave the tag markup untouched parsing and rendering only the expressions contained in it:

```html
<html>
<body>
  <tag-name>
    <p>I want to say { message }</p>
  </tag-name>
</body>
</html>
```

This technique might be used to enhance serverside rendered templates.
It will allow you also creating new tags composition patterns wrapping logic agnostic children components communicating with wrapper tags where you can handle your application logic:


```html
<form-validator>
  <date-picker onchange={ updateDate } />
  <color-picker onchange={ pickAColor } />
  <errors-reporter if={ errors.length } errors={ errors }/>
</form-validator>
```

## Core API

### riot.mount

`riot.mount(selector: string, props?: object, componentName?: string): [RiotComponent]`

1. `selector` selects elements from the page and mounts them with a custom components. The selected elements' name must match the custom tag name. DOM nodes having the `is` attribute can also be automounted

2. `props` optional object is passed for the component to consume. This can be anything, ranging from a simple object to a full application API. Or it can be a Flux- store. Really depends on how you want to structure your client-side applications. *Also note* that attributes you set on your tags will take precedence over ones specified with same names via `props` argument.

3. `componentName` optional component name in case the node to mount can't be automounted by riot

<strong>@returns: </strong>an array of the mounted [component objects](#component-object)


Examples:

``` js
// selects and mounts all <pricing> tags on the page
const components = riot.mount('pricing')

// mount all custom components with a class name .customer
const components = riot.mount('.customer')

// mount <account> tag and pass an API object as options
const components = riot.mount('account', api)
```

Note: users of [In-browser compilation](/compiler/#in-browser-compilation) will need to wait the components compilation before calling the `riot.mount` method.

```javascript
(async function main() {
  await riot.compile()

  const components = riot.mount('user')
}())
```

The `opts` argument can be also a function in order to avoid sharing the same object across several tag instances [riot/2613](https://github.com/riot/riot/issues/2613)

``` js
riot.mount('my-component', () => ({
  custom: 'option'
}))
```
### riot.unmount

### riot.component

### riot.install

### riot.uninstall

### riot.register

### riot.unregister

`riot.unregister(tagName)`

Unregistering a tag previously created via compiler or via `riot.register()`
This method could be handy in case you need to test your app and you want to create multiple
tags using the same name for example

```js
// create a test component
riot.register('test-component', TestComponent)

// mount it
const [component] = riot.mount(document.createElement('div'), 'test-component')
expect(component.root.querySelector('p')).to.be.ok

// unregister the tag
riot.unregister('test-component')

// recreate the same component using a different template
riot.register('test-component', TestComponent2)
```

### riot.version
