import {SabreMetadata} from "./SabreMetadata";
import {RegistryClassItem, SabreRegistry, SabreRegistryImpl} from "./SabreRegistry";
import {InjectionMetaItem, InjectionPointHandlerOptions} from "../defs";

export interface SabreMetadataProcessor {
    processMetadata(metadata: SabreMetadata): SabreRegistry;
}

export class SabreMetadataProcessorImpl implements SabreMetadataProcessor {
    processMetadata(metadata: SabreMetadata): SabreRegistry {
        const registry = new SabreRegistryImpl();
        metadata.injectionMeta.forEach(classItem => {
            if (classItem.constructors.length > 1) {
                throw new Error(`Unable to parse ${classItem.name} because it has more than one constructor and is too ambiguous`);
            }
            registry.addClassItem(classItem.name, SabreMetadataProcessorImpl.generateRegistryClassItem(classItem, metadata));
        });
        return registry;
    }

    private static generateRegistryClassItem(classItem: InjectionMetaItem, metadata: SabreMetadata): RegistryClassItem {
        const name = classItem.name;
        const classDef = metadata.injectionMapper[name]!();
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
            constructor: constructorParams
        }
    }
}