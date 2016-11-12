declare module "posthtml" {

	function posthtml(plugins?: Function[]): posthtml.IPosthtml;

	namespace posthtml {

		interface IExpressionObject {
			tag?: string;
			attrs?: {
				[name: string]: string;
			};
		}

		interface INode {
			tag: string | boolean;
			attrs: any;
			content: (string | INode)[];
		}

		interface ITree {
			walk(cb: (node: INode) => INode): ITree;
			match(expression: string | RegExp | IExpressionObject | IExpressionObject[], cb: (node: INode) => INode): ITree;
		}

		interface IOptions {
			// Enables sync mode, plugins will run synchronously, throws an error when used with async plugins
			sync?: boolean;
			// Use custom parser, replaces default (posthtml-parser)
			parser?: Function;
			// Use custom render, replaces default (posthtml-render)
			render?: Function;
			// Skip parsing
			skipParse?: boolean;
		}

		interface IPosthtml {
			use(plugin?: Function): IPosthtml;
			process(html: string, options?: IOptions): Promise<{ html: String, tree: INode[] }>;
		}

	}

	export = posthtml;

}
