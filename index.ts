import { AngularWebpackPlugin } from "@ngtools/webpack";
import type * as ts             from "typescript";

export default function modifyConfig(cfg: any) {
	const angularWebpackPlugin = cfg.plugins.find((plugin: unknown) => plugin instanceof AngularWebpackPlugin);

	if (!angularWebpackPlugin)
	{
		console.error("Could not inject the typescript transformers, because AngularWebpackPlugin not found.");
		return;
	}

	addTransformers(angularWebpackPlugin);

	return cfg;
}

export const AngularCustomTransformers = {
	modifyConfig
};

modifyConfig.config = modifyConfig;

function addTransformers(plugin: AngularWebpackPlugin)
{
	// Original private method
	const originalCreateFileEmitter = (plugin as any).createFileEmitter;

	(plugin as any).createFileEmitter = function (builderProgram: ts.BuilderProgram, transformers: ts.CustomTransformers, ...rest: any[])
	{
		if (!transformers)
		{
			transformers = {};
		}

		if (!transformers.before)
		{
			transformers.before = [];
		}

		const program: ts.Program = builderProgram.getProgram();
		const transformersConfig: Array<{ transform: string }> = ((program.getCompilerOptions() as any).plugins) || [];
		const customTransformers: Array<ts.TransformerFactory<ts.SourceFile> | ts.CustomTransformerFactory> = [];

		for (let entry of transformersConfig)
		{
			if (!entry.transform)
			{
				console.warn("Unsupported format of plugin configuration.");
			}
			else
			{
				const transformerRequire = require(entry.transform);
				const transformer: (program: ts.Program) => (ts.TransformerFactory<ts.SourceFile> | ts.CustomTransformerFactory)
					= typeof transformerRequire == "function" ? transformerRequire : transformerRequire.default;

				customTransformers.push(transformer(program));
			}
		}

		transformers.before = [...customTransformers, ...transformers.before!];

		return originalCreateFileEmitter.apply(plugin, [builderProgram, transformers, ...rest,]);
	};
}
