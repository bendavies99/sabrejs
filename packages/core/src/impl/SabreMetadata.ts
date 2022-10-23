import {InjectionMapper, InjectionMeta} from "../defs";

export interface SabreMetadata {
    loadInjectionMetadata(): Promise<void>;
    injectionMapper: InjectionMapper;
    injectionMeta: InjectionMeta;
}

export class SabreMetadataImpl implements SabreMetadata {
    private _injectionMapper: InjectionMapper = {};
    private _injectionMeta: InjectionMeta = [];

    public async loadInjectionMetadata() {
        this._injectionMeta = (await import('../meta/meta')).default.items as InjectionMeta;
        this._injectionMapper = (await import('../meta/mapper')).default as InjectionMapper;

    }

    public get injectionMapper() {
        return this._injectionMapper;
    }

    public get injectionMeta() {
        return this._injectionMeta;
    }
}