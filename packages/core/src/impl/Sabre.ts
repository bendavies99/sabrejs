import {SabreContainer} from "../interfaces/internal/SabreContainer";
import {SabreConfiguration} from "../interfaces";
import {SabreMetadataProcessor} from "./SabreMetadataProcessor";
import {SabreMetadata} from "./SabreMetadata";
import {SabreRegistry} from "./SabreRegistry";
import {SabreInjector, SabreInjectorImpl} from "./SabreInjector";

export class SabreImpl implements SabreContainer {
    private readonly registry!: SabreRegistry;
    private injector!: SabreInjector;
    private _data: Record<string, any> = {};

    constructor(private readonly config: SabreConfiguration,
                private readonly metadataProcessor: SabreMetadataProcessor,
                private readonly metadata: SabreMetadata) {
        metadata.loadInjectionMetadata(config.metadataDirectory);
        this.registry = metadataProcessor.processMetadata(metadata);
        this.injector = new SabreInjectorImpl(this.registry, this);
    }



    getInstance<T>(named?: string): T {
        if (!named) {
            throw Error('Likely you are not using the transformer');
        }

        return this.injector.getInstance(named);
    }

    getData<T>(name: string): T | undefined {
        if (this._data[name]) return this._data[name] as T;
        return undefined;
    }

    hasData(name: string): boolean {
        return !!this._data[name];
    }

    setData(name: string, value: any): void {
        this._data[name] = value;
    }

    constructNewInstance<T>(named: string, initToo: boolean = false): T {
        return this.injector.constructNewInstance(named, initToo);
    }
}