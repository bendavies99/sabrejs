import * as ts from "typescript";
import {ExecUtil, PathUtil} from "@sabrejs/common";
import * as fs from "fs";
import * as path from "path";
import {Serialiser} from "./transformer/serialiser";
import {Instrument} from "./transformer/instrument";
import {Modifiers} from "./transformer/modifiers";

const output = [];
const outputMapper = {};

interface TransformerOptions {
    sourceDir: string;
}

const execUtil = new ExecUtil();
execUtil.onSystemExit(() => {
    fs.writeFileSync(PathUtil.resolve('dist/injection.meta.json'), JSON.stringify(output, null, 2));
    fs.writeFileSync(PathUtil.resolve('dist/injection.mapper.js'),
        "module.exports = " + JSON.stringify(outputMapper, null, 2).replace(/"/gmi, ""))
});

export default (checker: ts.TypeChecker, options: TransformerOptions): ts.TransformerFactory<any> => {
    if (!options || !options.sourceDir) {
        options = {sourceDir: 'src'};
    }
    return (ctx) => {
        return (sourceFile: ts.SourceFile) => {
            return processMetadata(sourceFile, checker, output, ctx, options);
        }
    }
}

function processMetadata(sourceFile: ts.SourceFile, checker: ts.TypeChecker, output: any[],
                         ctx: ts.TransformationContext, options: TransformerOptions) {
    const serialiser = new Serialiser(checker);
    const instrumenter = new Instrument(ctx, checker);
    const modifiers = new Modifiers();

    function addClassMapping(node: ts.ClassDeclaration) {
        const symbol: ts.Symbol = checker.getSymbolAtLocation(node.name!)!;
        const name = symbol.getName();
        const baseLoc = PathUtil.resolve(options.sourceDir);
        let pathLoc = path.relative(baseLoc, sourceFile.fileName);
        if (!pathLoc.startsWith("../") && !pathLoc.startsWith("..\\")) {
            pathLoc = "./" + pathLoc;
        }
        pathLoc = pathLoc.replace(".ts", ".js")
            .replace(".tsx", ".jsx");
        if (modifiers.isExport(node) && modifiers.isDefault(node)) {
            outputMapper[name] = `() => require('${pathLoc}')`;
        } else if (modifiers.isExport(node)) {
            outputMapper[name] = `() => require('${pathLoc}').${name}`;
        } else {
            throw new Error('Unable to parse injectable class: '
                + (pathLoc + "(" + name + ")") + " because it is not exported")
        }
    }

    const handleNode = (node: ts.Node) => {
        if (ts.isClassDeclaration(node) && node.name) {
            const symbol = checker.getSymbolAtLocation(node.name);
            const decs = ts.getDecorators(node);
            if (symbol && decs && decs.length > 0 && !modifiers.isAbstract(node)) {
                output.push(serialiser.serialiseClass(node))
                addClassMapping(node);
                const constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
                const constructorData = constructorType.getConstructSignatures()?.map(s => serialiser.serialiseSignature(s)) || [];
                return instrumenter.createJuicyInit(node, constructorData);
            }
        }

        if (ts.isCallExpression(node) && node.getText().includes("getInstance<") && node.arguments.length === 0) {
            return instrumenter.handleGetInstanceCall(node);
        }
        return ts.visitEachChild(node, handleNode, ctx);
    }
    return ts.visitEachChild(sourceFile, handleNode, ctx);
}