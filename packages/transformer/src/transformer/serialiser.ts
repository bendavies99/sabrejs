import ts, {ObjectFlags, ObjectType} from "typescript";

/**
 * The type for the json formatted symbol
 *
 * @author ben.davies
 */
export interface SerialisedSymbol {
    readonly name: string;
    readonly documentation: string;
    readonly type: string;
}

/**
 * The type for the json formatted signature
 *
 * @author ben.davies
 */
export interface SerialisedSignature {
    readonly parameters: SerialisedSymbol[];
    readonly returnType: string;
    readonly documentation: string;
}

/**
 * The type for a json formatted typescript class
 *
 * @author ben.davies
 */
export interface SerialisedClass extends SerialisedSymbol {
    constructors: SerialisedSignature[];
    decorators: SerialisedSymbol[];
    interfaces: SerialisedSymbol[];
}

/**
 * Serialisation class for converting typescript definitions into a json format
 *
 * @author ben.davies
 */
export class Serialiser {
    constructor(private readonly checker: ts.TypeChecker) {
    }

    /**
     * Serialise a typescript symbol to json
     *
     * @param symbol the typescript symbol
     * @returns SerialisedSymbol
     */
    serialiseSymbol(symbol: ts.Symbol): SerialisedSymbol {
        return {
            name: symbol.getName(),
            documentation: ts.displayPartsToString(symbol.getDocumentationComment(this.checker)),
            type: this.checker.typeToString(this.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!))
        };
    }

    /**
     * Serialise a typescript decorator into a json format
     *
     * @param decorator the typescript decorator
     * @returns SerialisedSymbol
     */
    serialiseDecorator(decorator: ts.Decorator): SerialisedSymbol {
        const symbol = this.checker.getSymbolAtLocation(decorator.expression.getFirstToken()!)!;
        return this.serialiseSymbol(symbol);
    }

    /**
     * Serialise a typescript interface into a json format
     *
     * @param type The typescript interface
     * @returns SerialisedSymbol
     */
    serialiseInterface(type: ts.ExpressionWithTypeArguments): SerialisedSymbol {
        const symbol = this.checker.getSymbolAtLocation(type.getFirstToken()!)!;
        return this.serialiseSymbol(symbol);
    }

    /**
     * Serialise a typescript signature into a json format
     *
     * @param signature the typescript signature
     * @returns SerialisedSignature
     */
    serialiseSignature(signature: ts.Signature): SerialisedSignature {
        return {
            parameters: signature.parameters.filter(s => s !== undefined).map(s => this.serialiseSymbol(s)),
            returnType: this.checker.typeToString(signature.getReturnType()),
            documentation: ts.displayPartsToString(signature.getDocumentationComment(this.checker))
        };
    }

    /**
     * Serialise a typescript class into a json format
     *
     * @param node the typescript class
     * @returns SerialisedClass
     */
    serialiseClass(node: ts.ClassDeclaration): SerialisedClass {
        const symbol: ts.Symbol = this.checker.getSymbolAtLocation(node.name!)!;
        const constructorType = this.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
        const constructorData = constructorType.getConstructSignatures()?.map(s => this.serialiseSignature(s)) || [];
        return {
            ...this.serialiseSymbol(symbol),
            constructors: constructorData,
            decorators: ts.getDecorators(node)?.map(d => this.serialiseDecorator(d)) || [],
            interfaces: node.heritageClauses?.flatMap(hc => hc.types)
                .filter(type => {
                    const typeVal = this.checker.getTypeAtLocation(type.getFirstToken()!);
                    const objectType = typeVal as ObjectType;
                    return objectType.objectFlags === ObjectFlags.Interface
                        || objectType.objectFlags === (ObjectFlags.Interface | ObjectFlags.Reference);
                })
                .map(i => this.serialiseInterface(i)) || []
        };
    }
}
