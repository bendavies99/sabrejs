import ts, {SyntaxKind} from "typescript";

export class Modifiers {
    /**
     * is the class declaration abstract
     *
     * @param node the class declaration
     * @returns boolean
     */
    isAbstract(node: ts.ClassDeclaration): boolean {
        return !!node.modifiers && !!node.modifiers.length && !!node.modifiers.find(m => {
            return m.kind === SyntaxKind.AbstractKeyword;
        });
    }

    /**
     * is the class declaration exported
     *
     * @param node the class declaration
     * @returns boolean
     */
    isExport(node: ts.ClassDeclaration): boolean {
        return !!node.modifiers && !!node.modifiers.length && !!node.modifiers.find(m => {
            return m.kind === SyntaxKind.ExportKeyword;
        });
    }

    /**
     * is the class declaration a default export
     *
     * @param node the class declaration
     * @returns boolean
     */
     isDefault(node: ts.ClassDeclaration): boolean {
        return !!node.modifiers && !!node.modifiers.length && !!node.modifiers.find(m => {
            return m.kind === SyntaxKind.DefaultKeyword;
        });
    }
}