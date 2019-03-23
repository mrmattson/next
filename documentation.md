---
layout: detail
title: Documentation
---

## Example

Riot custom components are the building blocks for user interfaces. They make the "view" part of the application. Let's start with an extended `<todo>` example highlighting various features of Riot:

```html
<todo>
  <h3>{ props.title }</h3>

  <ul>
    <li each={ item in state.items }>
      <label class={ item.done ? 'completed' : null }>
        <input
          type="checkbox"
          checked={ item.done }
          onclick={ () => toggle(item) }>
        { item.title }
      </label>
    </li>
  </ul>

  <form onsubmit={ add }>
    <input onkeyup={ edit }>
    <button disabled={ !state.text }>
      Add #{ state.items.length + 1 }
    </button>
  </form>

  <script>
    export default {
      onBeforeMount(state, props) {
        // initial state
        this.state = {
          items: props.items,
          text: ''
        }
      },
      edit(e) {
        // update only the text state
        this.update({
          text: e.target.value
        })
      },
      add(e) {
        e.preventDefault()

        if (this.state.text) {
          this.update({
            items: [
              ...this.state.items,
              // add a new item
              {title: this.state.text}
            ],
            text: ''
          })
        }
      },
      toggle(item) {
        item.done = !item.done
        // trigger a component update
        this.update()
      }
    }
  </script>
</todo>
```

Custom components are [compiled](/compiler/) to javascript.

See the [live demo](https://riot.js.org/examples/plunker/?app=todo-app), browse the [sources](https://github.com/riot/examples/tree/gh-pages/todo-app), or download the [zip](https://github.com/riot/examples/archive/gh-pages.zip).


## Component syntax

A Riot component is a combination of layout (HTML) and logic (javascript). Here are the basic rules:

* Each `.riot` file can contain the logic for only a single component
* HTML is defined first and the logic is enclosed inside a `<script>` tag.
* Custom components can be empty, HTML only or javascript only
* All template expressions are "just javascript™️"`: <pre>{ JSON.stringify(props) }</pre>`
* The `this` keyword is optional: `<p>{ name }</p>` is valid as `<p>{ this.name }</p>`
* Quotes are optional: `<foo bar={ baz }>` is valid as `<foo bar="{ baz }">`.
* Boolean attributes (checked, selected etc..) are ignored when the expression value is falsy: `<input checked={ undefined }>` becomes `<input>`.
* All attribute names *must be lowercase*. This is due to browser specification.
* Standard HTML tags (`label`, `table`, `a` etc..) can also be customized, but not necessarily a wise thing to do.
* Tag definition **root** may also have attributes: `<foo onclick={ click } class={ active: active }>`.


## Pre-processor

You can specify a pre-processor with `type` attribute. For example:

```html
<my-component>
  <script type="coffee">
    # your coffeescript logic goes here
  </script>
</my-component>
````

Your component will be compiled with the preprocessor selected only if it was previously [registered before](/compiler#registerpreprocessor). You can also prefix the language with "text/", such as "text/coffee".

## Tag styling

You can put a `style` tag inside. Riot.js automatically takes it out and injects it into `<head>`. This happens once, no matter how many times the component is initialized.

```html
<my-component>

  <!-- layout -->
  <h3>{ props.title }</h3>

  <style>
   /** other component specific styles **/
    h3 { font-size: 120% }
    /** other component specific styles **/
  </style>

</my-component>
```

### Scoped CSS

[Scoped css and :host pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:host()) is also available for all browsers. Riot.js has its own custom implementation in JS which does not rely on or fallback to the browser implementation. The example below is equivalent to the first one. Notice that the example below uses the `:host` `pseudo-class` instead of relying in the component name to scope the styles.

```html
<my-component>

  <!-- layout -->
  <h3>{ opts.title }</h3>

  <style>
    :host { display: block }
    h3 { font-size: 120% }
    /** other component specific styles **/
  </style>

</my-component>
```

## Mounting

Once a component is created you can mount it on the page as follows:


```html
<body>

  <!-- place the custom component anywhere inside the body -->
  <my-component></my-component>

  <!-- is attributes are also supported -->
  <div is="my-component"></div>

  <!-- include riot.js -->
  <script src="riot.min.js"></script>

  <!-- mount the component -->
  <script type="module">
    // import the component javascript output generated with the riot compiler
    import MyComponent from './my-component.js'

    // register the riot component
    riot.register('my-component', MyComponent)

    riot.mount('my-component')
  </script>

</body>
```

Custom components inside the `body` of the page needs to be closed normally: `<my-component></my-component>` and self-closing: `<my-component/>` is not supported.


Some example uses of the mount method:

```js
// mount an element with a specific id
riot.mount('#my-element')

// mount selected elements
riot.mount('todo, forum, comments')
```

A document can contain multiple instances of the same component.


### Accessing DOM elements

Riot gives you access to your component DOM elements via `this.$` and `this.$$` helper methods.

```html
<my-component>
  <h1>My todo list</h1>
  <ul>
    <li>Learn Riot.js</li>
    <li>Build something cool</li>
  </ul>

  <script>
    export default {
      onMounted() {
        const title = this.$('h1') // single element
        const items = this.$$('li') // multiple elements
      }
    }
  </script>
</my-component>
```


### How to use jQuery, Zepto, querySelector, etc...

If you need to access the DOM inside Riot, you'll want to take a look at the [riot component lifecycle](#riot-component-lifecycle). Notice that the DOM elements aren't instantiated until the `mount` event first fires, meaning any attempt to select an element before then will fail.

```html
<my-component>
  <p id="findMe">Do I even Exist?</p>

  <script>

    var test1 = document.getElementById('findMe')
    console.log('test1', test1)  // Fails

    export default {
      onMounted() {
        const test2 = document.getElementById('findMe')
        console.log('test3', test3) // Succeeds, fires once (per mount)
      },
      onUpdated() {
        const test3 = document.getElementById('findMe')
        console.log('test2', test2) // Succeeds, fires on every update
      }
    }
  </script>
</my-component>
```

### Contexted DOM query

Now that we know how to get DOM elements in the `onUpdated` or `onMounted` callbacks, we can make this useful by also adding a context to our element queries to the `root element` (the riot tag we're creating).

```html
<my-component>
  <p id="findMe">Do I even Exist?</p>
  <p>Is this real life?</p>
  <p>Or just fantasy?</p>

  <script>
    export default {
      onMounted() {
        // Contexted jQuery
        $('p', this.root) // similar to this.$

        // Contexted Query Selector
        this.root.querySelectorAll('p') // similar to this.$$
      }
    }
  </script>
</my-component>
```

### Properties

You can pass initial properties for components in the second argument

```html
<script>
  riot.mount('todo', { title: 'My TODO app', items: [ ... ] })
</script>
```

The passed data can be anything, ranging from a simple object to a full application API. Or it can be a Flux store. Depends on the designed architecture.

Inside the tag the properties can be referenced with the `this.props` attribute as follows:

```html
<my-component>

  <!-- Props in HTML -->
  <h3>{ props.title }</h3>

  <script>
    export default {
      onMounted() {
        // Props in javascript
        const title = this.opts.title

        // this.props is frozen and it's immutable
        this.props.description = 'my description' // this will not work
      }
    }
  </script>

</my-component>
```

### State

Each riot component can use the `this.state` object to store or modify its internal state.
While the `this.props` attribute is frozen the `this.state` object is completely mutable and it could be updated manually or via the `this.update()` method:

```html
<my-component id="{ state.name }-{ state.surname }">

  <p>{ state.name } - { state.surname }</p>

  <script>
    export default {
      onMounted() {
        // this is good but doesn't update the component DOM
        this.state.name = 'Jack'

        // this call updates the state and the component DOM as well
        this.update({
          surname: 'Black'
        })
      }
    }
  </script>
</my-component>
```

### Riot component lifecycle

A component is created in following sequence:

1. The component object is created
2. The javascript logic is executed
3. All HTML expressions are calculated
4. The component DOM is mounted on the page and "onMounted" callback is called

After the component is mounted the expressions are updated as follows:

1. When `this.update()` is called on the current component instance
2. When `this.update()` is called on a parent component, or any parent upwards. Updates flow uni-directionally from parent to child.

The "onUpdated" callback is called every time component tag is updated.

Since the values are calculated before mounting there are no surprise issues such as failed `<img src={ src }>` calls.


### Lifecycle callbacks

You can setup you component lifecycles as follows:


```html
<my-component>
  <script>
    export default {
      onBeforeMount(props, state) {
        // before the component is mounted
      },
      onMounted(props, state) {
        // right after the component is mounted on the page
      },
      onBeforeUpdate(props, state) {
        // allows recalculation of context data before the update
      },
      onUpdated(props, state) {
        // right after the component template is updated after an update call
      },
      onBeforeUnmount(props, state) {
        // before the component is removed
      },
      onUnmounted(props, state) {
        // when the component is removed from the page
      }
    }
  </script>
</my-component>
```

Any callback receives always the current `this.props` and `this.state` as arguments.

## Plugins

Riot provides an easy way to upgrade its components. When a component is created it can be enhanced by the plugins registered via `riot.install`.

```js
// riot-uid-plugin.js
let id = 0

riot.install(function(component) {
  // all components will pass through here
  component.uid = id++
})

```

```html
<!-- my-component.riot -->
<my-component>
  <h1>{ uid }</h1>
</my-component>
```

## Expressions

HTML can be mixed with expressions that are enclosed in curly braces:

```js
{ /* my_expression goes here */ }
```

Expressions can set attributes or nested text nodes:

```html
<h3 id={ /* attribute_expression */ }>
  { /* nested_expression */ }
</h3>
```

Expressions are 100% javascript. A few examples:

```js
{ title || 'Untitled' }
{ results ? 'ready' : 'loading' }
{ new Date() }
{ message.length > 140 && 'Message is too long' }
{ Math.round(rating) }
```

The goal is to keep the expressions small so your HTML stays as clean as possible. If your expression grows in complexity consider moving some of logic to the "onBeforeUpdate" callback. For example:


```html
<my-component>

  <!-- the `val` is calculated below .. -->
  <p>{ val }</p>

  <script>
    export default {
      onBeforeUpdate() {
        // ..on every update
        this.val = some / complex * expression ^ here
      }
    }
  </script>
</my-component>
```

### Boolean attributes

Boolean attributes (checked, selected etc..) are ignored when the expression value is falsy:

`<input checked={ null }>` becomes `<input>`.

W3C states that a boolean property is true if the attribute is present at all — even if the value is empty of `false`.

The following expression does not work:

```html
<input type="checkbox" { true ? 'checked' : ''}>
```

since only attribute and nested text expressions are valid. Riot detects automatically all the valid html boolean attributes.


### Object spread attribute

You can also use an object spread expression to define multiple attributes. For example:

```html
<my-component>
  <p ...{ attributes }></p>
  <script>
    export default {
      attributes: {
        id: 'my-id',
        role: 'contentinfo',
        class: 'main-paragraph'
      }
    }
  </script>
</my-component>
```

evaluates to `<p id="my-id" role="contentinfo" class="main-paragraph">`.

### Printing brackets

You can output an expression without evaluation by escaping the opening bracket:

`\{ this is not evaluated }` outputs `{ this is not evaluated }`

Be sure to escape brackets in any situation where they should not be evaluated. For example, the Regex pattern below will fail to validate the intended input (any two numeric characters) and instead only accept a single numeric character followed by the number "2":

```html
<my-component>
  <input type='text' pattern="\d{2}">
</my-component>
```

The correct implementation would be:

```html
<my-component>
  <input type='text' pattern="\d\{2}">
</my-component>
```

### Etc

Expressions inside `style` tags are ignored.


### Render unescaped HTML

Riot expressions can only render text values without HTML formatting. However you can make a custom tag to do the job. For example:

```html
<raw>
  <script>
    export default {
      setInnerHTML() {
        this.root.innerHTML = props.content
      }
      onMounted() {
        this.setInnerHTML()
      },
      onUpdated() {
        this.setInnerHTML()
      }
    }
  </script>
</raw>
```

After the tag is defined you can use it inside other tags. For example

```html
<my-component>
  <p>Here is some raw content: <raw content={ html }/> </p>

  <script>
    export default {
      onBeforeMount() {
        this.html = 'Hello, <strong>world!</strong>'
      }
    }
  </script>
</my-component>
```

[demo on jsfiddle](http://jsfiddle.net/23g73yvx/)

<strong>warning: this could expose the user to XSS attacks so make sure you never load data from an untrusted source.</strong>

## Nested tags

Let's define a parent tag `<account>` and with a nested tag `<subscription>`:


```html
<account>
  <subscription plan={ props.plan } show_details={ true } />
</account>
```

```html
<subscription>
  <h3>{ props.plan.name }</h3>

  <script>
    export default {
      onMounted(props) {
        // Get JS handle to props
        const plan = props.plan
        const show_details = props.show_details
      }
    }
  </script>
</subscription>
```

<span class="tag red">important</span> Note how we named the `show_details` attribute using an underscore instead of camel case, which due to browser specification would have been automatically converted to lowercase.

Then we mount the `account` tag to the page with a `plan` configuration option:

```html
<body>
  <account></account>
</body>

<script>
  riot.mount('account', { plan: { name: 'small', term: 'monthly' } })
</script>
```

Parent tag options are passed with the `riot.mount` method and child tag options are passed on the tag attribute.

<span class="tag red">important</span> Nested tags are always declared inside a parent custom tag. They are not initialized if they are defined on the page.

### Nested HTML

"HTML transclusion" is a way to process the inner HTML on the page. This is achieved with a build-in `<yield>` tag. Example:


### Tag definition

```html
<my-component>
  <p>Hello <yield/></p>
  this.text = 'world'
</my-component>
```

### Usage

Custom tag is placed on a page with nested HTML

```html
<my-component>
  <b>{ text }</b>
</my-component>
```

### Result

```html
<my-component>
  <p>Hello <b>world</b><p>
</my-component>
```

See [API docs](/api/#yield) for `yield`.

## Named elements

Elements with `ref` attribute are automatically linked to the context under `this.refs` so you'll have an easy access to them with javascript:

```html
<login>
  <form ref="login" onsubmit={ submit }>
    <input ref="username">
    <input ref="password">
    <button ref="submit">
  </form>

  // grab above HTML elements
  submit(e) {
    var form = this.refs.login,
        username = this.refs.username.value,
        password = this.refs.password.value,
        button = this.refs.submit
  }

</login>
```

The refs attribute will be set when the mount event gets fired, so you can access to the `this.refs` collection into 'mount' (`this.on('mount', function() {...}) `) or other event handlers.

<span class="tag red">&gt;=3.0</span>

If the `ref` attribute is applied to a Riot tag, it will reference a [tag instance](/api/#tag-instance), and not the DOM element, as in the case above. For example:


```html
<my-component>
  <my-nested-tag data-ref="one"></my-nested-tag>
  <div data-ref="two"></div>

  this.on('mount', function() {
    console.log(this.refs.one); // Riot tag object
    console.log(this.refs.two); // HTML DOM element
  });
</my-component>

```

In cases where the same `ref` value is used on multiple elements, the refs property will return an array of the respective elements / tags. For example:


```html
<my-component>
  <div data-ref="items" id="alpha"></div>
  <div data-ref="items" id="beta"></div>

  this.on('mount', function() {
    console.log(this.refs.items); // [div#alpha, div#beta]
  });
</my-component>

```



## Event handlers

A function that deals with DOM events is called an "event handler". Event handlers are defined as follows:

```html
<login>
  <form onsubmit={ submit }>

  </form>

  // this method is called when above form is submitted
  submit(e) {

  }
</login>
```

Attributes beginning with "on" (`onclick`, `onsubmit`, `oninput` etc...) accept a function value which is called when the event occurs. This function can also be defined dynamically with an expression. For example:


```html
<form onsubmit={ condition ? method_a : method_b }>
```

In the function `this` refers to the current tag instance. After the handler is called `this.update()` is automatically called reflecting all the possible changes to the UI (unless you set `event.preventUpdate` in the handler).

### Event object

The event handler receives the standard event object as the first argument. The following properties are normalized to work across browsers:

- `e.currentTarget` points to the element where the event handler is specified.
- `e.target` is the originating element. This is not necessarily the same as `currentTarget`.
- `e.which` is the key code in a keyboard event (`keypress`, `keyup`, etc...).
- `e.item` is the current element in a loop. See [loops](#loops) for more details.


## Conditionals

Conditionals let you show / hide elements based on a condition. For example:

```html
<div if={ is_premium }>
  <p>This is for premium users only</p>
</div>
```

Again, the expression can be just a simple property or a full javascript expression. The following special attributes are available:

- `show` – show the element using `style="display: ''"` when the value is true
- `hide` – hide the element using `style="display: none"` when the value is true
- `if` – add (true value) or remove (false value) the element from the document

The equality operator is `==` and not `===`. For example: `'a string' == true`.

## Loops

Loops are implemented with `each` attribute as follows:

```html
<my-component>
  <ul>
    <li each={ items } class={ completed: done }>
      <input type="checkbox" checked={ done }> { title }
    </li>
  </ul>

  this.items = [
    { title: 'First item', done: true },
    { title: 'Second item' },
    { title: 'Third item' }
  ]
</my-component>
```

The element with the `each` attribute will be repeated for all items in the array. New elements are automatically added / created when the items array is manipulated using `push()`, `slice()` or `splice` methods for example.

### Context

A new context is created for each item. These are [tag instances](/api/#tag-instance). When loops are nested, all the children tags in the loop inherit any of their parent loop's properties and methods they themselves have `undefined`. In this way, Riot avoids overriding things that should not be overridden by the parent tag.

The parent can be explicitly accessed through the `parent` variable. For example:


```html
<my-component>
  <div each={ items }>
    <h3>{ title }</h3>
    <a onclick={ parent.remove }>Remove</a>
  </div>

  this.items = [ { title: 'First' }, { title: 'Second' } ]

  remove(event) {

  }
</my-component>
```

In the looped element everything but the `each` attribute belongs to the child context, so the `title` can be accessed directly and `remove` needs to be prefixed with `parent.` since the method is not a property of the looped item.

The looped items are [tag instances](/api/#tag-instance). Riot does not touch the original items so no new properties are added to them.


### Event handlers with looped items

Event handlers can access individual items in a collection with `event.item`. Now let's implement the `remove` function:

```html
<my-component>
  <div each={ items }>
    <h3>{ title }</h3>
    <a onclick={ parent.remove }>Remove</a>
  </div>

  this.items = [ { title: 'First' }, { title: 'Second' } ]

  remove(event) {

    // looped item
    var item = event.item

    // index on the collection
    var index = this.items.indexOf(item)

    // remove from collection
    this.items.splice(index, 1)
  }
</my-component>
```

After the event handler is executed the current tag instance is updated using `this.update()` (unless you set e.preventUpdate to true in your event handler) which causes all the looped items to execute as well. The parent notices that an item has been removed from the collection and removes the corresponding DOM node from the document.


### Looping custom tags

Custom tags can also be looped. For example:

```html
<todo-item each="{ items }" data="{ this }"></todo-item>
```

The currently looped item can be referenced with `this` which you can use to pass the item as an option to the looped tag.


### Non-object arrays

The array elements need not be objects. They can be strings or numbers as well. In this case you need to use the `{ name, i in items }` construct as follows:


```html
<my-component>
  <p each="{ name, i in arr }">{ i }: { name }</p>

  this.arr = [ true, 110, Math.random(), 'fourth']
</my-component>
```

The `name` is the name of the element and `i` is the index number. Both of these labels can be anything that's best suited for the situation.


### Object loops

Plain objects can also be looped. For example:

```html
<my-component>
  <p each="{ value, name  in obj }">{ name } = { value }</p>

  this.obj = {
    key1: 'value1',
    key2: 1110.8900,
    key3: Math.random()
  }
</my-component>
```

Object loops are not recommended since internally Riot detects changes on the object with `JSON.stringify`. The *whole* object is studied and when there is a change the whole loop is re-rendered. This can be slow. Normal arrays are much faster and only the changes are drawn on the page.


### Loops advanced tips

#### Performances

The default `each` directive algorithm will sync the position of the looped DOM nodes together with the items in your collection via `indexOf` lookup. This strategy might be not efficient in case you are dealing with big collections of data. In that case if your looped tags don't need to be reordered but just update their templates you can add the `no-reorder` options to them.

```html
<loop>
  <!-- `items` here might be a huge collection of data... -->
  <table>
    <tr each="{ item in items }" no-reorder>
      <td>
        { item.name }
      </td>
      <td>
        { item.surname }
      </td>
    </tr>
  </table>
</loop>
```

The table rows in the above example will be added/removed/updated without being reordered following the item position initially bound to them.

#### Key

<span class="tag red">&gt;= v3.7</span>

Adding the `key` attribute to the looped tags you will provide a more precise strategy to track your items position. This will improve massively the loop performance in case your collections are immutable.

```html
<loop>
  <ul>
    <li each={ user in users } key="id">{ user.name }</li>
  </ul>
  <script>
    this.users = [
      { name: 'Gian', id: 0 },
      { name: 'Dan', id: 1 },
      { name: 'Teo', id: 2 }
    ]
  </script>
</loop>
```

The `key` attribute can be generated also via expressions

```html
<loop>
  <ul>
    <li each={ user in users } key={ user.id() }>{ user.name }</li>
  </ul>
  <script>
    this.users = [
      { name: 'Gian', id() { return 0 } },
      { name: 'Dan', id() { return 1 } },
      { name: 'Teo', id() { return 2 } }
    ]
  </script>
</loop>
```

#### The `virtual` tag

In some cases you may need to loop some html without having a particular wrapper tag. In that case you can use the `<virtual>` tag that will be removed rendering just the html tags wrapped in it. For example:

```html
<dl>
  <virtual each={item in items}>
    <dt>{item.key}</dt>
    <dd>{item.value}</dd>
  </virtual>
</dl>
```

`virtual` however is not exclusive to looping and can be used in conjuction with `if` for any tag

```html
<virtual data-is="my-tag" if={condition}>
  <p>Show me with no wrapper on condition</p>
</virtual>
```

## HTML elements as tags

Standard HTML elements can be used as riot tags in the page body with the addition of the `data-is` attribute.

```html
<ul data-is="my-list"></ul>
```

This provides users with an alternative that can provide greater compatibility with css frameworks.  The tags are treated like any other custom tag.

```js
riot.mount('my-list')
```

will mount the `ul` element shown above as if it were `<my-list></my-list>`

Note that you can use also an expression in the `data-is` attribute and riot will be able to
render dynamically also different tags on the same DOM node

```html
<my-component>
  <!-- dynamic component -->
  <div data-is={ component }></div>
  <button onclick={ switchComponent }>
    Switch
  </button>

  <script>
    this.component = 'foo'

    switchComponent() {
      // riot will render the <bar> component
      // replacing <foo>
      this.component = 'bar'
    }
  </script>
</my-component>
```

Note that when using the `data-is` attribute, the tag name should be rendered in all lowercase, regardless of how it's defined.

```html
  <MyTag></MyTag> <!-- Correct -->
  <div data-is="mytag"></div> <!-- Also Correct -->
  <div data-is="MyTag"></div> <!-- Incorrect -->
  <script type="text/javascript">
    riot.mount('MyTag');
  </script>
```


## Server-side rendering

Riot supports server-side rendering with Node/io.js. You can `require` tags and render them:

```js
var riot = require('riot')
var timer = require('timer.tag')

var html = riot.render(timer, { start: 42 })

console.log(html) // <timer><p>Seconds Elapsed: 42</p></timer>
```

## Riot DOM Caveats

Riot tags rely on browsers rendering so you must be aware of certain situations where your components might not render properly their template.

Consider the following tag:

``` html

<my-fancy-options>
  <option>foo</option>
  <option>bar</option>
</my-fancy-options>
```

This markup is not valid if not injected in a `<select>` tag:

``` html

<!-- not valid, a select tag allows only <option> children -->
<select>
  <my-fancy-options />
</select>

<!-- valid because we will render the <option> tags using <select> as root node -->
<select data-is='my-fancy-options'></select>

```

Tags like `table, select, svg...` don't allow custom children tags so the use of custom riot tags (`<virtual>` included) is forbidden. Use `data-is` instead like demonstrated above. [more info](https://github.com/riot/riot/issues/2206)
