// @ts-ignore
import { Transformer } from '@parcel/plugin';
import SourceMap from '@parcel/source-map';
// @ts-ignore
import { loadTSConfig } from '@parcel/ts-utils';
import typescript from 'ttypescript';

const TsTransformer = new Transformer({
    async loadConfig({config, options}) {
        return await loadTSConfig(config, options);
    },

    async transform({asset, config, options, logger}) {
        asset.type = 'js';
        logger.verbose({
            message: 'Handling file: ' + asset.filePath,
        });

        logger.verbose({
            message: 'File Dependencies: ' + JSON.stringify(asset.getDependencies())
        });

        let code = await asset.getCode();
        let transpiled = typescript.transpileModule(
            code,
            {
                compilerOptions: {
                    jsx: typescript.JsxEmit.React,
                    ...(config as object),
                    noEmit: false,
                    module: typescript.ModuleKind.ESNext,
                    sourceMap: !!asset.env.sourceMap,
                    plugins: [
                        {
                            // @ts-ignore
                            transform: "@sabrejs/transformer",
                            type: "checker",
                            usesBundler: true
                        }
                    ]
                },
                fileName: asset.filePath,
            },
        );

        let map;
        let {outputText, sourceMapText} = transpiled;
        if (sourceMapText != null) {
            map = new SourceMap(options.projectRoot);
            map.addVLQMap(JSON.parse(sourceMapText));

            outputText = outputText.substring(
                0,
                outputText.lastIndexOf('//# sourceMappingURL'),
            );
        }

        return [
            {
                type: 'js',
                content: outputText,
                map
            },
        ];
    },
});

export default TsTransformer;