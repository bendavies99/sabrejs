import {SabreMetadata} from "./SabreMetadata";
import {RegistryClassItem, SabreRegistry, SabreRegistryImpl} from "./SabreRegistry";
import {InjectionMetaItem, InjectionPointHandlerOptions} from "../defs";

export interface SabreMetadataProcessor {
    processMetadata(metadata: SabreMetadata): Promise<SabreRegistry>;
}

export class SabreMetadataProcessorImpl implements SabreMetadataProcessor {
    async processMetadata(metadata: SabreMetadata): Promise<SabreRegistry> {
        const registry = new SabreRegistryImpl();
        for (const classItem of metadata.injectionMeta) {
            if (classItem.constructors.length > 1) {
                throw new Error(`Unable to parse ${classItem.name} because it has more than one constructor and is too ambiguous`);
            }
            registry.addClassItem(classItem.name, (await SabreMetadataProcessorImpl.generateRegistryClassItem(classItem, metadata)));

            classItem.interfaces.forEach(i => {
               registry.addInterfaceImplementation(i.name, classItem.name);
            });
        }

        this.createDependencyGraph(metadata, registry);
        this.matchInterfacesToImplementations(registry);
        this.matchRegistryItemsByNamedDecorator(registry);

        return registry;
    }

    private createDependencyGraph(metadata: SabreMetadata, registry: SabreRegistry): void {
        metadata.injectionMeta.forEach(classItem => {
            const deps: string[] = [];
            classItem.constructors.forEach(value => {
                value.parameters.forEach(p => {
                    if (registry.getClassItem(p.type)) {
                        deps.push(p.type);
                    }
                })
            })
            registry.addToDependencyGraph(classItem.name, deps);
        });
    }

    private static async generateRegistryClassItem(classItem: InjectionMetaItem, metadata: SabreMetadata): Promise<RegistryClassItem> {
        const name = classItem.name;
        const classDef = await metadata.injectionMapper[name]!();
        const handler = Reflect.getMetadata('injectionPointHandler', classDef) as InjectionPointHandlerOptions;
        const constructorParams = classItem.constructors[0]!.parameters.map((param, idx) => ({
            index: idx,
            name: param.name,
            type: param.type
        }));
        return {
            name,
            injectionPointHandler: handler,
            implementationClass: classDef,
            constructorParams
        }
    }

    private matchInterfacesToImplementations(registry: SabreRegistryImpl) {
        Object.keys(registry.interfaces).forEach(inter => {
            const correct = this.findInterfaceCorrectImpl(registry, registry.getInterfaceImplementations(inter));
            registry.linkClassItem(inter, correct);
        });
    }

    private findInterfaceCorrectImpl(registry: SabreRegistry, impls: string[]) {
        let nameFound = '';
        impls.forEach(impl => {
            const registryItem = registry.classes[impl]!;
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

    private matchRegistryItemsByNamedDecorator(registry: SabreRegistry) {
        Object.keys(registry.classes).forEach(reg => {
            const item: RegistryClassItem = registry.getClassItem(reg)!;
            const injectionName = Reflect.getMetadata('injectionName', item.implementationClass);
            if (injectionName) {
                registry.linkClassItem(injectionName, reg);
            }
        })
    }
}