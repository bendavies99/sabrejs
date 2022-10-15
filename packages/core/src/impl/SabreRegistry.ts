import {ClassType, InjectionPointHandlerOptions} from "../defs";


interface ConstructorParam {
    name: string;
    type: string;
    index: number;
}

export interface RegistryClassItem {
    readonly name: string;
    readonly injectionPointHandler: InjectionPointHandlerOptions;
    readonly implementationClass: ClassType;
    readonly constructor: ConstructorParam[];
}

interface ClassRegistry {
    [key: string]: RegistryClassItem;
}

interface SabreDependencyGraph {
    [key: string]: string[]
}

export interface SabreRegistry {
    readonly classes: ClassRegistry;
    readonly dependencyGraph: SabreDependencyGraph;

    addClassItem(name: string, item: RegistryClassItem): void;
    getClassItem(name: string): RegistryClassItem | undefined;
    addToDependencyGraph(name: string, item: string | string[]): void;
}

export class SabreRegistryImpl implements SabreRegistry {
    private _classes: ClassRegistry = {};
    private _depGraph: SabreDependencyGraph = {};

    public addClassItem(name: string, item: RegistryClassItem): void {
        if (this._classes[name]) return;

        this._classes[name] = item;
    }

    public getClassItem(name: string): RegistryClassItem | undefined {
        return this._classes[name];
    }

    public addToDependencyGraph(name: string, item: string | string[]): void {
        if (!this.getClassItem(name)) return;

        if (!this._depGraph[name]) {
            this._depGraph[name] = [];
        }

        if (Array.isArray(item)) {
            this._depGraph[name]!.push(...item);
        } else {
            this._depGraph[name]!.push(item);
        }
    }

    public get classes() {
        return this._classes;
    }

    public get dependencyGraph() {
        return this._depGraph;
    }
}