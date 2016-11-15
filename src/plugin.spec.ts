'use strict';

import * as assert from 'assert';
import * as fs from 'fs';

import * as posthtml from 'posthtml';
import * as expressions from 'posthtml-exp';
import * as include from 'posthtml-include';

import posthtmlMixins from './plugin';

function readFile(filepath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readFile(filepath, (err, buf) => {
			if (err) {
				return reject(err);
			}

			resolve(buf.toString());
		});
	});
}

function assertCase(source: string): Promise<any> {
	const files = [
		readFile('test/' + source + '.html'),
		readFile('test/' + source + '.expected.html')
	];

	return Promise.all(files).then((data) => {
		return posthtml([
			include(),
			posthtmlMixins(),
			expressions()
		])
			.use()
			.process(data[0])
			.then((result) => {
				// console.log(result.html);
				assert.equal(result.html, data[1]);
			});
	});
}

describe('PostHTML Mixins', () => {

	it('Basic usage', () => {
		return assertCase('basic');
	});

	it('Basic usage with default value', () => {
		return assertCase('basic-default');
	});

	it('Basic usage with parameters in attributes', () => {
		return assertCase('parameters');
	});

	it('Basic usage with reloading', () => {
		return assertCase('reloading');
	});

	it('Usage with posthtml-expressions', () => {
		return assertCase('expressions');
	});

	it('Usage with posthtml-includes', () => {
		return assertCase('includes');
	});

});
