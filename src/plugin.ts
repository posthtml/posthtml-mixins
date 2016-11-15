'use strict';

import * as posthtml from 'posthtml';
import expandPlaceholder from 'expand-placeholder';

const { walk } = require('posthtml/lib/api');

let delimiters: string[];

interface INode extends posthtml.INode {
	// :)
}

interface IAttributes extends posthtml.IAttributes {
	// :)
}

export interface IOptions {
	// Array containing beginning and ending delimiters for escaped locals
	delimiters: string[];
}

interface IAttribute {
	name: string;
	value: string;
}

interface IMixin {
	params: IAttribute[];
	body: (string | INode)[];
}

interface IMixinStorage {
	[name: string]: IMixin[];
}

function makeParams(attrs: posthtml.IAttributes): IAttribute[] {
	const params: IAttribute[] = [];
	Object.keys(attrs).forEach((attr) => {
		if (attr === 'name') {
			return;
		}

		params.push({
			name: attr,
			value: attrs[attr] !== '' ? attrs[attr] : null
		});
	});

	return params;
}

function makeMixinDefinition(node: INode): IMixin {
	return {
		params: makeParams(node.attrs),
		body: node.content
	};
}

function replaceExpression(str: string, params: IAttributes): string {
	return expandPlaceholder(str, params, {
		opening: delimiters[0],
		closing: delimiters[1]
	});
}

function replaceExpressions(tree: INode[], params: IAttributes): INode[] {
	return walk.call(tree, (node) => {
		if (typeof node === 'object') {
			if (node.attrs) {
				Object.keys(node.attrs).forEach((name) => {
					node.attrs[name] = replaceExpression(node.attrs[name], params);
				});
			}
		} else if (typeof node === 'string') {
			node = replaceExpression(node, params);
		}

		return node;
	});
}

function makeMixinReference(node: INode, storage: IMixinStorage): INode {
	const name = node.attrs.name;
	const referenceParams = makeParams(node.attrs);

	// Try to find Mixin with specified parameters
	let mixin: IMixin;
	const keys = Object.keys(storage);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (key !== name) {
			continue;
		}

		// Each Mixin can have multiple reloadings, depending on the number of parameters
		const setOfMixins = storage[key];
		for (let j = setOfMixins.length - 1; j >= 0; j--) {
			const maybe = setOfMixins[j];

			let status = true;
			if (maybe.params.length !== 0 && maybe.params.length !== referenceParams.length) {
				// Check balance of arguments. If Mixin has free parameters without default values then skip this Mixin
				const freeParams = maybe.params.filter((param) => {
					for (let k = 0; k < referenceParams.length; k++) {
						if (referenceParams[k].name === param.name || param.value !== null) {
							return false;
						}
					}

					return true;
				});

				if (freeParams.length !== 0) {
					status = false;
				}
			}

			if (status) {
				mixin = maybe;
				break;
			}
		}
	}

	if (!mixin) {
		throw new Error(`The Mixin with name "${name}" not exist`);
	}

	// Prepare parameters to call Mixin
	const callParams: IAttributes = {};
	mixin.params.forEach((param) => {
		if (referenceParams.length === 0) {
			callParams[param.name] = param.value;
			return;
		}

		for (let i = 0; i < referenceParams.length; i++) {
			const refParam = referenceParams[i];
			if (param.name === refParam.name) {
				callParams[param.name] = refParam.value;
			} else {
				callParams[refParam.name] = refParam.value;
			}
		}

		if (!callParams[param.name]) {
			callParams[param.name] = param.value;
		}
	});

	return {
		tag: false,
		content: replaceExpressions(<INode[]>mixin.body, callParams),
		attrs: null
	};
}

export default function posthtmlMixins(options?: IOptions) {
	const storage: IMixinStorage = {};

	const opts = Object.assign(<IOptions>{
		delimiters: ['{{', '}}']
	}, options);

	delimiters = opts.delimiters;

	return (tree?: posthtml.ITree) => {
		tree.match({ tag: 'mixin' }, (node) => {
			// Skip tag if it doesn't contain attributes or `name` attribute
			if (!node.attrs || (node.attrs && !node.attrs.name)) {
				return node;
			}

			// Name of Mixin
			const name = node.attrs.name;

			if (node.content && node.content.length !== 0) {
				if (!storage[name]) {
					storage[name] = [];
				}

				storage[name].push(makeMixinDefinition(node));

				return {
					tag: false,
					content: [],
					attrs: null
				};
			}

			// Mixin with specified name is exist?
			if (!node.content && !storage[name]) {
				throw new Error(`The Mixin with name "${name}" not exist`);
			}

			return makeMixinReference(node, storage);
		});

		return tree;
	};
}
