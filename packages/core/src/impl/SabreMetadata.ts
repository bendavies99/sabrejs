import {InjectionMapper, InjectionMeta, TsConfigOptions} from "../defs";
import {PathUtil} from "@sabrejs/common";
import path from "path";

export interface SabreMetadata {
    loadInjectionMetadata(dir?: string): void;
    injectionMapper: InjectionMapper;
    injectionMeta: InjectionMeta;
}

export class SabreMetadataImpl implements SabreMetadata {
    private _injectionMapper: InjectionMapper = {};
    private _injectionMeta: InjectionMeta = [];

    private static getMetadataDirectory(dir?: string): string {
        if (dir) {
            return dir;
        }

        return PathUtil.requireFile<TsConfigOptions>('tsconfig.json').compilerOptions.outDir || './dist';
    }

    public loadInjectionMetadata(dir?: string) {
        const metadataDirectory = SabreMetadataImpl.getMetadataDirectory(dir);
        const injectionMetaPath = path.resolve(metadataDirectory, 'injection.meta.json');
        const injectionMapperPath = path.resolve(metadataDirectory, 'injection.mapper.js');

        if (!PathUtil.exists(injectionMetaPath)) {
            throw new Error('Please add the injection transformer to your tsconfig.json');
        }

        this._injectionMeta = PathUtil.requireFile<InjectionMeta>(injectionMetaPath);
        this._injectionMapper = PathUtil.requireFile<InjectionMapper>(injectionMapperPath);
    }

    public get injectionMapper() {
        return this._injectionMapper;
    }

    public get injectionMeta() {
        return this._injectionMeta;
    }
}