import * as ts from "typescript";
import {Serialiser} from "./transformer/serialiser";
import {Instrument} from "./transformer/instrument";
import {Modifiers} from "./transformer/modifiers";
import {Metadata} from "./metadata/metadata";

export interface TransformerOptions {
    sourceDir: string;
    usesBundler?:boolean;
}

const metadata = new Metadata();
export default (checker: ts.TypeChecker, options: TransformerOptions): ts.TransformerFactory<any> => {
    if (!options || !options.sourceDir) {
        options = Object.assign(options || {}, {sourceDir: 'src'});
    }
    return (ctx) => {
        return (sourceFile: ts.SourceFile) => {
            return processMetadata(sourceFile, checker, ctx, metadata, options);
        }
    }
}

function processMetadata(sourceFile: ts.SourceFile, checker: ts.TypeChecker,
                         ctx: ts.TransformationContext, metadata: Metadata, options:TransformerOptions) {
    const serialiser = new Serialiser(checker);
    const instrumenter = new Instrument(ctx, checker);
    const modifiers = new Modifiers();

    const handleNode = (node: ts.Node) => {
        if (ts.isClassDeclaration(node) && node.name) {
            const symbol = checker.getSymbolAtLocation(node.name);
            const decs = ts.getDecorators(node);
            if (symbol && decs && decs.length > 0 && !modifiers.isAbstract(node)) {
                metadata.addClassMetadata(serialiser.serialiseClass(node));
                metadata.addClassMapping(node, checker, sourceFile, options);
                const constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
                const constructorData = constructorType.getConstructSignatures()?.map(s => serialiser.serialiseSignature(s)) || [];
                return instrumenter.createJuicyInit(node, constructorData);
            }
        }

        if (ts.isCallExpression(node) && node.getText().includes("getInstance<") && node.getText().split("\n").length == 1 && node.arguments.length === 0) {
            return instrumenter.handleGetInstanceCall(node);
        }
        return ts.visitEachChild(node, handleNode, ctx);
    }
    return ts.visitEachChild(sourceFile, handleNode, ctx);
}