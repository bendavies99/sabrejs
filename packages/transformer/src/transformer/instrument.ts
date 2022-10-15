import ts, {SyntaxKind} from "typescript";
import {SerialisedSignature} from "./serialiser";

/**
 * Class for instrumenting the current typescript code and adding / modifying the code
 *
 * @author ben.davies
 */
export class Instrument {
    constructor(private readonly ctx: ts.TransformationContext, private readonly checker: ts.TypeChecker) {
    }

    private createExpression(identifier: string) {
        const factory = this.ctx.factory;
        return factory.createExpressionStatement(factory.createBinaryExpression(
            factory.createPropertyAccessExpression(
                factory.createThis(),
                factory.createIdentifier(identifier)
            ),
            factory.createToken(ts.SyntaxKind.EqualsToken),
            factory.createIdentifier(identifier)
        ));
    }

    /**
     * Update a getInstance call to pass in the name of the class as a parameter instead of the types
     *
     * @param node the getInstance call
     * @returns ts.CallExpression
     */
    handleGetInstanceCall(node: ts.CallExpression): ts.CallExpression {
        const typeType = this.checker.getTypeAtLocation(node.typeArguments![0]!);
        const typeName = typeType.symbol.getName();
        return this.ctx.factory.updateCallExpression(node, node.expression, node.typeArguments, [
            this.ctx.factory.createStringLiteral(typeName, false)
        ]);
    }

    /**
     * Create the __juicyInit__ function inside the classes for injection
     *
     * @param node the class to instrument
     * @param _constructorData the constructor data of the class
     * @returns ts.ClassDeclaration the new instrumented class
     */
    createJuicyInit(node: ts.ClassDeclaration, _constructorData: SerialisedSignature[]): ts.ClassDeclaration {
        const constr: ts.ConstructorDeclaration =
            node.members.find(ce => ce.kind === SyntaxKind.Constructor)! as unknown as any;
        const factory = this.ctx.factory;
        const method = this.ctx.factory.createMethodDeclaration(undefined, undefined,
            this.ctx.factory.createIdentifier('__juicyInit__'),
            undefined, undefined,
            constr?.parameters || [],
            undefined,
            this.ctx.factory.createBlock(_constructorData[0]!.parameters.map(p => this.createExpression(p.name)), true)
        );
        const members: ts.ClassElement[] = [];
        if (constr) {
            members.push(factory.updateConstructorDeclaration(constr, constr?.modifiers || [], [], constr.body))
        }
        return this.ctx.factory.updateClassDeclaration(node, node.modifiers,
            node.name, node.typeParameters,
            node.heritageClauses,
            [
                ...members,
                method,
                ...node.members.filter(m => m.kind === SyntaxKind.Constructor)
            ]);
    }
}