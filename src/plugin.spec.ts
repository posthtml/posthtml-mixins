'use strict';

import * as assert from 'assert';

import * as posthtml from 'posthtml';
import * as exp from 'posthtml-exp';

import { posthtmlMixins } from './plugin';

describe('PostHTML Mixins', () => {

	it('Basic usage', () => {
		const html = [
			'<mixin name="say" from>',
			'  <p>Hello from {{ from }}!</p>',
			'</mixin>',
			'<div>',
			'  <mixin name="say" from="me"></mixin>',
			'</div>'
		].join('\n');

		return posthtml()
			.use(posthtmlMixins())
			.process(html)
			.then((result) => {
				assert.equal(result.html, '\n<div>\n  \n  <p>Hello from me!</p>\n\n</div>');
			});
	});

	it('Usage with default value', () => {
		const html = [
			'<mixin name="say" from="me">',
			'  <p>Hello from {{ from }}!</p>',
			'</mixin>',
			'<div>',
			'  <mixin name="say"></mixin>',
			'</div>'
		].join('\n');

		return posthtml()
			.use(posthtmlMixins())
			.process(html)
			.then((result) => {
				assert.equal(result.html, '\n<div>\n  \n  <p>Hello from me!</p>\n\n</div>');
			});
	});

	it('Usage with posthtml-expressions', () => {
		const html = [
			'<mixin name="say" from items>',
			'  <p>Hello from {{ from }}!</p>',
			'  <each loop="item in {{ items }}">',
			'    <p>{{item}}</p>',
			'  </each>',
			'</mixin>',
			'<div>',
			`  <mixin name="say" from="me" items="['a', 'b', 'c']"></mixin>`,
			'</div>'
		].join('\n');

		return posthtml([
			posthtmlMixins(),
			exp()
		])
			.process(html)
			.then((result) => {
				assert.equal(result.html, '\n<div>\n  \n  <p>Hello from me!</p>\n  \n    <p>a</p>\n  \n    <p>b</p>\n  \n    <p>c</p>\n  \n\n</div>');
			});
	});

});
