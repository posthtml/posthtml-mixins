'use strict';

import * as posthtml from 'posthtml';

interface IMixin {
	params: { name: string; value: string; }[];
	body: (string | posthtml.INode)[];
}

interface IMixins {
	[name: string]: IMixin;
}

function traverse(tree, cb) {
	if (Array.isArray(tree)) {
		for (let i = 0; i < tree.length; i++) {
			tree[i] = traverse(cb(tree[i]), cb);
		};
	} else if (tree && typeof tree === 'object' && tree.hasOwnProperty('content')) {
		traverse(tree.content, cb);
	}

	return tree;
}

function replaceExpression(str, params) {
	const match = /({{\s*([^{{]+)\s*}})/g.exec(str);
	if (match) {
		const paramName = match[2].trim();

		if (params[paramName]) {
			return str.replace(match[1], params[paramName]);
		}
	}

	return str;
}

function replaceExpressions(tree: (string | posthtml.INode)[], params) {
	return traverse(tree, (node) => {
		if (typeof node === 'object' && node.attrs) {
			Object.keys(node.attrs).forEach((name) => {
				node.attrs[name] = replaceExpression(node.attrs[name], params);
			});
		} else if (typeof node === 'string') {
			node = replaceExpression(node, params);
		}

		return node;
	});
}

export function posthtmlMixins(options?) {

	const mixins: IMixins = {};

	return (tree?: posthtml.ITree) => {
		tree.match({ tag: 'mixin' }, (node) => {
			const name = node.attrs.name;

			if (node.content && node.content.length !== 0) {
				const params = [];
				Object.keys(node.attrs).forEach((attr) => {
					let value = null;
					if (attr === 'name') {
						return;
					}
					if (node.attrs[attr] !== '') {
						value = node.attrs[attr];
					}

					params.push({
						name: attr,
						value
					});
				});

				mixins[name] = {
					params,
					body: node.content
				};

				return {
					tag: false,
					content: [],
					attrs: null
				};
			}

			const referenceParams = [];
			Object.keys(node.attrs).forEach((attr) => {
				if (attr === 'name') {
					return;
				}

				referenceParams.push({
					name: attr,
					value: node.attrs[attr]
				});
			});

			let mixin: IMixin;
			const keys = Object.keys(mixins);

			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				if (key !== name) {
					return;
				}

				const maybeMixin = mixins[key];
				const paramsLength = maybeMixin.params.length;

				// Check balance of arguments. If Mixin has free parameters without default values then skip this Mixin
				let mixinStatus = true;
				for (let j = referenceParams.length; j < paramsLength; j++) {
					const param = maybeMixin.params[j];

					if (!param.value) {
						mixinStatus = false;
						break;
					}
				}

				if (mixinStatus) {
					mixin = maybeMixin;
					break;
				}
			}

			if (!mixin) {
				console.error('Mixin not found! (WIP)');
				return node;
			}

			const callParams = {};
			mixin.params.forEach((param) => {
				if (referenceParams.length === 0) {
					callParams[param.name] = param.value;
					return;
				}

				for (let i = 0; i < referenceParams.length; i++) {
					if (param.name === referenceParams[i].name) {
						callParams[param.name] = referenceParams[i].value;
						break;
					}
				}
			});

			return {
				tag: false,
				content: replaceExpressions(<posthtml.INode[]>mixin.body, callParams),
				attrs: null
			};
		});

		return tree;
	};

}
