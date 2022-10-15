import {SabreContainer} from "../interfaces/internal/SabreContainer";
import {SabreConfiguration} from "../interfaces";
import {SabreMetadataProcessor} from "./SabreMetadataProcessor";
import {SabreMetadata} from "./SabreMetadata";
import {SabreRegistry} from "./SabreRegistry";

export class SabreImpl implements SabreContainer {
    private registry!: SabreRegistry;

    constructor(private readonly config: SabreConfiguration,
                private readonly metadataProcessor: SabreMetadataProcessor,
                private readonly metadata: SabreMetadata) {
        metadata.loadInjectionMetadata(config.metadataDirectory);
        this.registry = metadataProcessor.processMetadata(metadata);
    }

    getInstance<T>(_named: string | undefined): T {
        return undefined as T;
    }
}