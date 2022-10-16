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
    readonly constructorParams: ConstructorParam[];
}

interface ClassRegistry {
    [key: string]: RegistryClassItem;
}

interface SabreDependencyGraph {
    [key: string]: string[]
}


export interface SabreInterface {
    impls: string[];
}

interface SabreInterfaces {
    [key: string]: SabreInterface
}

export interface SabreRegistry {
    readonly classes: ClassRegistry;
    readonly dependencyGraph: SabreDependencyGraph;
    readonly interfaces: SabreInterfaces;

    addClassItem(name: string, item: RegistryClassItem): void;
    linkClassItem(name: string, toName: string): void;
    getClassItem(name: string): RegistryClassItem | undefined;
    addInterfaceImplementation(interfaceName: string, className: string): void;
    getInterfaceImplementations(interfaceName: string): string[];
    addToDependencyGraph(name: string, item: string | string[]): void;
}

export class SabreRegistryImpl implements SabreRegistry {
    private _classes: ClassRegistry = {};
    private _depGraph: SabreDependencyGraph = {};
    private _interfaces: SabreInterfaces = {};

    public addClassItem(name: string, item: RegistryClassItem): void {
        if (this._classes[name]) return;

        this._classes[name] = item;
    }

    public getClassItem(name: string): RegistryClassItem | undefined {
        return this._classes[name];
    }

    public linkClassItem(name: string, toName: string): void {
        if (!this.getClassItem(toName)) {
            throw new Error('Cannot link to a class that doesn\'t exist: ' + toName + " -- new name: " + name);
        }

        this._classes[name] = this._classes[toName]!;
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

    public addInterfaceImplementation(interfaceName: string, className: string): void {
        if (!this._interfaces[interfaceName]) {
            this._interfaces[interfaceName] = {impls: []};
        }

        if (this.getClassItem(className)) {
            const impls = this._interfaces[interfaceName]!.impls;
            if (!impls.find(i => i === className)) {
                impls.push(className);
            }
        }
    }

    public getInterfaceImplementations(interfaceName: string): string[] {
        if (!this._interfaces[interfaceName]) {
            return [];
        }

        return this._interfaces[interfaceName]!.impls;
    }

    public get classes() {
        return this._classes;
    }

    public get dependencyGraph() {
        return this._depGraph;
    }

    public get interfaces() {
        return this._interfaces;
    }
}