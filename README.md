# posthtml-mixins

> A [PostHTML](https://github.com/posthtml/posthtml) plugin adds support for Mixins. Mixins allow you to create reusable blocks of code.

[![Travis Status](https://travis-ci.org/mrmlnc/posthtml-mixins.svg?branch=master)](https://travis-ci.org/mrmlnc/posthtml-mixins)

## Install

```
$ npm i -D posthtml-mixins
```

## Usage

```js
const { readFileSync } = require('fs');

const posthtml = require('posthtml');
const mixins = require('posthtml-mixins');

const html = readFileSync('index.html');
posthtml([ mixins() ])
  .process(html)
  .then((result) => console.log(result.html))
```

## Options

#### delimiters

  * Type: `String[]`
  * Default: `['{{', '}}']`

Array containing beginning and ending delimiters for locals.

For example:

  * `['{', '}']` - `{ key }`
  * `['${', '}']` - `${ key }`
  * `['%', '%']` - `%key%`
  * `['%', '']` - `%key`

## Features

### Parameters

We support parameters for Mixins inside tags and in attributes.

```html
<mixin name="say" class from>
  <p class="{{ class }}">Hello from {{ from }}!</p>
</mixin>

<div>
  <mixin name="say" class="hello" from="me"></mixin>
</div>
```

```html
<div>
  <p class="hello">Hello from me!</p>
</div>
```

### Default values

We support default values for parameters (order is unimportant).

```html
<mixin name="say" class from="me">
  <p class="{{ class }}">Hello from {{ from }}!</p>
</mixin>

<div>
  <mixin name="say" class="hello"></mixin>
</div>
```

```html
<div>
  <p class="hello">Hello from me!</p>
</div>
```

### Mixin reloading

We support Mixin reloading when the Mixin may have the same name but a different number of parameters.

```html
<mixin name="say" from>
  <p>Hello from {{ from }}!</p>
</mixin>

<mixin name="say">
  <p>Hello!</p>
</mixin>

<div>
  <mixin name="say"></mixin>
</div>

<div>
  <mixin name="say" from="mixin"></mixin>
</div>
```

```html
<div>
  <p>Hello!</p>
</div>

<div>
  <p>Hello from mixin!</p>
</div>
```

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/posthtml-mixins/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
