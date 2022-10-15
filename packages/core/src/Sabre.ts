import 'reflect-metadata'
import {ClassType, InjectionMapper, InjectionMeta, InjectionPointHandlerOptions, TsConfigOptions} from "./defs";
import {PathUtil} from "@sabrejs/common";
import * as path from "path";
import {ParamProviderHandler} from "./decorator";

interface ConstructorParam {
    name: string;
    type: string;
    index: number;
}

export interface RegistryItem {
    readonly name: string;
    readonly injectionPointHandler: InjectionPointHandlerOptions;
    readonly implementationClass: ClassType;
    readonly constructor: ConstructorParam[];
}

interface SabreRegistry {
    [key: string]: RegistryItem
}

interface SabreDependencyGraph {
    [key: string]: string[]
}

interface SabreInterface {
    impls: string[];
}

interface SabreInterfaces {
    [key: string]: SabreInterface
}

export interface Sabre {
    getInstance: <T>(named?: string, createOnNoInstances?: boolean) => T;
    setInstance: <T>(named: string, inst: T) => void;
    constructNewInstance: <T>(named: string, initToo?: boolean) => T;
}

class SabreImpl implements Sabre {
    private registry: SabreRegistry = {};
    private depGraph: SabreDependencyGraph = {};
    private interfaces: SabreInterfaces = {};
    private instances = {};
    private currentInstance: any = undefined;
    private currentRoot: string | undefined = undefined;
    private currentInstances = {};

    constructor(_config: SabreConfiguration) {
        const outDir = PathUtil.requireFile<TsConfigOptions>('tsconfig.json').compilerOptions.outDir || './dist';

        const injectionMetaPath = path.resolve(outDir, 'injection.meta.json');
        const injectionMapperPath = path.resolve(outDir, 'injection.mapper.js');

        if (!PathUtil.exists(injectionMetaPath)) {
            throw new Error('Please add the injection transformer to your tsconfig.json');
        }

        const injectionMeta = PathUtil.requireFile<InjectionMeta>(injectionMetaPath);
        const injectionMapper = PathUtil.requireFile<InjectionMapper>(injectionMapperPath);

        injectionMeta.forEach(mi => {
            if (mi.constructors.length > 1) {
                throw new Error(`Unable to parse ${mi.name} because it has more than one constructor and is too ambiguous`);
            }
            this.registry[mi.name] = {
                name: mi.name,
                injectionPointHandler: Reflect.getMetadata('injectionPointHandler',
                    (injectionMapper[mi.name]!())) as InjectionPointHandlerOptions,
                implementationClass: (injectionMapper[mi.name]!()),
                constructor: mi.constructors[0]?.parameters.map((param, idx) => ({
                    index: idx,
                    name: param.name,
                    type: param.type
                })) || []
            }

            mi.interfaces.forEach(i => {
                if (!this.interfaces[i.name]) {
                    this.interfaces[i.name] = {impls: []}
                }
                if (!this.interfaces[i.name]!.impls.find(im => im === mi.name)) {
                    this.interfaces[i.name]!.impls.push(mi.name);
                }
            });
        });

        injectionMeta.forEach(mi => {
            const deps: string[] = [];
            mi.constructors.forEach(value => {
                value.parameters.forEach(p => {
                    if (this.registry[p.type]) {
                        deps.push(p.type);
                    }
                })
            })
            this.depGraph[mi.name] = deps;
        });

        Object.keys(this.interfaces).forEach(inter => {
            const correct = this.findInterfaceCorrectImpl(this.interfaces[inter]!);
            this.registry[inter] = this.registry[correct]!;
        });
        Object.keys(this.registry).forEach(reg => {
            const item: RegistryItem = this.registry[reg]!;
            const injectionName = Reflect.getMetadata('injectionName', item.implementationClass);
            if (injectionName) {
                this.registry[injectionName] = item;
            }
        });
    }

    public getInstance<T>(named?: string, createOnNoInstances: boolean = false): T {
        if (!named) {
            throw Error('Likely you are not using the transformer');
        }

        if (this.instances[named]) {
            return this.instances[named];
        } else if (createOnNoInstances) {
            this.instances[named] = this.constructNewInstance(named);
            this.initializeInstance(this.instances[named], named);
            return this.instances[named];
        }

        if (named === this.currentRoot && this.currentInstance) {
            return this.currentInstance;
        }

        let setTheInst = false;
        if (!this.currentRoot) {
            this.currentRoot = named;
            this.currentInstances = {};
            setTheInst = true;
        }

        if (this.currentInstances[named] && !setTheInst) {
            return this.currentInstances[named];
        }
        const inst: T = this.registry[named]!.injectionPointHandler.onInjection(this.registry[named]!, named, this);
        if (setTheInst) {
            this.currentInstance = inst;
        }
        this.currentInstances[named] = inst;
        this.initializeInstance(inst, named);
        if (this.currentRoot === named) {
            this.currentRoot = undefined;
            this.currentInstances = {};
            this.currentInstance = null;
        }
        return inst;
    }

    public setInstance<T>(named: string, inst: T) {
        this.instances[named] = inst;
    }

    public constructNewInstance<T>(named: string, initToo: boolean = false): T {
        const registryItem = this.registry[named]!;
        if (initToo) {
            if (this.currentRoot && this.currentInstances[named]) {
                return this.currentInstances[named];
            }
            const inst = new registryItem.implementationClass();
            if (this.currentRoot) {
                this.currentInstances[named] = inst;
            }
            this.initializeInstance(inst, named);
            return inst;
        }
        return new registryItem.implementationClass();
    }

    private initializeInstance(inst: any, named: string) {
        const registryItem = this.registry[named]!;
        const args: any[] = [];
        if (registryItem.constructor.length) {
            registryItem.constructor.forEach(cp => {
                const paramProvider: ParamProviderHandler = Reflect.getMetadata('paramProvider',
                    inst, "index:" + cp.index);
                if (this.registry[cp.type] && !paramProvider) {
                    const obj = this.getInstance(cp.type);
                    args.push(obj);
                } else if (paramProvider) {
                    args.push(paramProvider.handleParam(cp.type, this));
                } else {
                    throw new Error(`Unable to create a new instance of ${named} unable to determine
                    ${JSON.stringify(cp, null, 2)}`)
                }
            });
        }
        inst.__juicyInit__(...args);
    }

    private findInterfaceCorrectImpl(inter: SabreInterface) {
        let nameFound = '';
        inter.impls.forEach(impl => {
            const registryItem = this.registry[impl]!;
            if (Reflect.getMetadata('defaultCond', registryItem.implementationClass) && !nameFound) {
                nameFound = impl;
            } else {
                const conds: (() => boolean)[] =
                    Reflect.getMetadata('injectionPointConds', registryItem.implementationClass);
                if (conds) {
                    const booleans: boolean[] = [];
                    conds.forEach(cond => {
                        booleans.push(cond())
                    });
                    const isValid = booleans.every(b => b);
                    if (isValid) {
                        nameFound = impl;
                    }
                }
            }
        });

        return nameFound;
    }
}

interface SabreConfiguration {
    manualMode: boolean;
    compiledDirectory: string;

}