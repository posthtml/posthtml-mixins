# posthtml-mixins (demo, only for show idea)

```js
import { posthtmlMixins } from './plugin';

posthtml()
  .use(posthtmlMixins())
  .process(html)
  .then(console.log);
```

## Basic usage

### Input

```html
<mixin name="say" from>
  <p>Hello from {{ from }}!</p>
</mixin>

<div class="c-splashs">
  <mixin name="say" from="me"></mixin>
</div>
```

### Output

```html
<div class="c-splashs">

  <p>Hello from me!</p>

</div>
```

## Usage with default values

### Input

```html
<mixin name="say" from="PostHTML">
  <p>Hello from {{ from }}!</p>
</mixin>

<div class="c-splashs">
  <mixin name="say"></mixin>
</div>
```

### Output

```html
<div class="c-splashs">

  <p>Hello from PostHTML!</p>

</div>
```

## Usage with posthtml-exp

### Input

```html
<mixin name="say" from items>
  <p>Hello from {{ from }}!</p>
  <each loop="item in {{ items }}">
    <p>{{item}}</p>
  </each>
</mixin>

<div>
  <mixin name="say" from="me" items="['a', 'b', 'c']"></mixin>
</div>
```

### Output

```html
<div>

  <p>Hello from me!</p>

    <p>a</p>

    <p>b</p>

    <p>c</p>


</div>
```
