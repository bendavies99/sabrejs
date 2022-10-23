import {PathUtil} from "@sabrejs/common";
import ts, {CompilerOptions} from "typescript";
import {TransformerOptions} from "../transformer";
import path from "path";
import {Modifiers} from "../transformer/modifiers";
import {SerialisedClass} from "../transformer/serialiser";
import {MetaFileWriter} from "./MetaFileWriter";
import {FileFinder} from "./FileFinder";
import {MapperFileWriter} from "./MapperFileWriter";

export interface TsConfigOptions {
    include: string[];
    compilerOptions: CompilerOptions;
}

export class Metadata {
    private _output: SerialisedClass[] = [];
    private readonly _outputMapper = {};
    private readonly _modifiers = new Modifiers();
    private _metaFileWriter!: MetaFileWriter;
    private _mapperFileWriter!: MapperFileWriter;

    constructor() {
        const fileFinder = new FileFinder();
        const foundFiles = fileFinder.findMetadataFiles();
        this._metaFileWriter = new MetaFileWriter(foundFiles.meta);
        this._mapperFileWriter = new MapperFileWriter(foundFiles.mapper);
        this.writeToFiles();
    }

    private writeToFiles() {
        this._metaFileWriter.write(this._output);
        this._mapperFileWriter.write(this._outputMapper);
    }

    public addClassMetadata(classMeta: SerialisedClass) {
        this._output = this._output.filter(i => i.name !== classMeta.name);
        this._output.push(classMeta);
        this.writeToFiles();
    }

    public addClassMapping(node: ts.ClassDeclaration, checker: ts.TypeChecker, sourceFile: ts.SourceFile,
                           options: TransformerOptions) {
        const symbol: ts.Symbol = checker.getSymbolAtLocation(node.name!)!;
        const name = symbol.getName();
        const distDir = PathUtil.resolve(PathUtil.requireFile<TsConfigOptions>('tsconfig.json').compilerOptions.outDir || './dist');
        const baseLoc = options.usesBundler ? path.resolve(options.sourceDir) : distDir;
        const outDir = path.dirname(require.resolve('@sabrejs/core'));
        let pathLoc = path.join(baseLoc, path.basename(sourceFile.fileName));
        pathLoc = "./" + path.relative(outDir, pathLoc);
        if (!options.usesBundler) {
            pathLoc = pathLoc.replace(".ts", ".js")
                .replace(".tsx", ".jsx");
        }
        if (this._modifiers.isExport(node) && this._modifiers.isDefault(node)) {
            this._outputMapper[name] = `async () => {{REPLACE_FUNCTION}}('${pathLoc}'){{REPLACE_FUNC_END}}{{REPLACE_ESM_RESULT}}`;
        } else if (this._modifiers.isExport(node)) {
            this._outputMapper[name] = `async () => {{REPLACE_FUNCTION}}('${pathLoc}'){{REPLACE_FUNC_END}}.${name}`;
        } else {
            throw new Error('Unable to parse injectable class: '
                + (pathLoc + "(" + name + ")") + " because it is not exported")
        }

        this.writeToFiles();
    }
}