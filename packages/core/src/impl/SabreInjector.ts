import {RegistryClassItem, SabreRegistry} from "./SabreRegistry";
import {ParamProviderHandler} from "../decorator";
import {Sabre} from "../interfaces";

export interface SabreInjector {
    /**
     * Get an instance from the sabre registry
     *
     * @param [named] The name inside the Sabre Registry if empty it will use T to pick the return value
     */
    getInstance<T>(named?: string): T;
    constructNewInstance<T>(named: string, initToo?: boolean): T;
}

export class SabreInjectorImpl implements SabreInjector {
    private currentInstance: any = undefined;
    private currentRoot: string | undefined = undefined;
    private currentInstances = {};

    constructor(private readonly registry: SabreRegistry, private readonly container: Sabre) {
    }

    getInstance<T>(named: string): T {
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
        const inst: T = this.registry.getClassItem(named)!.injectionPointHandler.onInjection(this.registry[named]!,
            named, this.container);
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

    public constructNewInstance<T>(named: string, initToo: boolean = false): T {
        const registryItem = this.registry.getClassItem(named)!;
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

    private initializeInstance(instance: any, name: string) {
        const registryItem: RegistryClassItem = this.registry.getClassItem(name)!;
        const args: any[] = [];
        if (registryItem.constructorParams.length) {
            registryItem.constructorParams.forEach(cp => {
                const paramProvider: ParamProviderHandler = Reflect.getMetadata('paramProvider',
                    instance, "index:" + cp.index);
                if (this.registry.getClassItem(cp.type) && !paramProvider) {
                    const obj = this.getInstance(cp.type);
                    args.push(obj);
                } else if (paramProvider) {
                    args.push(paramProvider.handleParam(cp.type, this));
                } else {
                    throw new Error(`Unable to create a new instance of ${name} unable to determine
                    ${JSON.stringify(cp, null, 2)}`)
                }
            });
        }
        instance.__juicyInit__(...args);
    }
}