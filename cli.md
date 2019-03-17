### Riot CLI - WIP

**The new riot CLI is not yet available this content will be moved under `compiler.md`**

Pre-compilation happens with a [`riot`](https://github.com/riot/cli) executable, which can be installed with NPM as follows:

``` sh
npm install riotjs@cli -g
```

Type `riot --help` and make sure it works. [node.js](http://nodejs.org/) is required on your machine.

With pre-compilation your HTML might look like this:

``` html
<!-- mount point -->
<my-tag></my-tag>

<!-- include riot.js only -->
<script src="https://cdn.jsdelivr.net/npm/riot@{{ site.version }}/riot.min.js"></script>

<!-- import in runtime and mount -->
<script type="module">
import MyTag from 'path/to/javascript/my-tag.js'
const mountMyTag = riot.component(MyTag)

mountMyTag(document.querySelector('my-tag'))
</script>
```

#### Using

Here is how `riot` command works:

``` sh
# compile a file to current folder
riot some.riot

# compile file to target folder
riot some.riot some_folder

# compile file to target path
riot some.riot some_folder/some.js

# compile all files from source folder to target folder
riot some/folder path/to/dist

# compile all files from source folder to a single concatenated file
riot some/folder all-my-tags.js

```

The source files can contain only one custom tag each and there can be regular javascript mixed together with custom tags.

For more information, type: `riot --help`


#### Watch mode

You can watch directories and automatically transform files when they are changed.

``` sh
# watch for
riot -w src dist
```


#### Custom extension

You're free to use any file extension for your tags (instead of default `.riot`):

``` sh
riot --ext html
```

#### ES6 Config file

You can use a config file to store and configure easily all your riot-cli options and create your custom parsers

``` sh
riot --config riot.config
```

The riot `riot.config.js` file:

```js
export default {
  from: 'tags/src',
  to: 'tags/dist',
  // files extension
  ext: 'foo',
  // html preprocessor
  template: 'foo',
  // js preprocessor
  javascript: 'baz',
  // css preprocessor
  css: 'bar',
  preprocessors: {
    template: {
      foo: (code, { options }) => ({ code: require('foo').compile(code) })
    },
    css: {
      bar: (code, { options }) => ({ code: require('bar').compile(code) })
    },
    javascript: {
      baz: (code, { options }) => ({ code: require('baz').compile(code) })
    }
  },
  // beautify or minify scripts
  postprocessors: [
    function (code, {options}) {
      return { code: require('minifyjs').minify(code) }
    }
  ],
  // special options that may be used to extend
  // the default riot parsers options
  parserOptions: {}
}
```