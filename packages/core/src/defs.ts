import {CompilerOptions} from "typescript";
import {RegistryClassItem} from "./impl/SabreRegistry";
import {Sabre} from "./interfaces";

export type InjectionMeta = InjectionMetaItem[];

export interface InjectionMapper {
    [key: string]: () => ClassType;
}


export interface InjectionPointHandlerOptions {
    onInjection: <T>(item: RegistryClassItem, name: string, container: Sabre) => T;
}

interface MetaSignature {
    name: string;
    documentation: string;
    type: string;
}

interface MetaConstructorItem {
    parameters: MetaSignature[];
    returnType: string;
    documentation: string;
}


export interface TsConfigOptions {
    include: string[];
    compilerOptions: CompilerOptions;
}

export interface InjectionMetaItem extends MetaSignature {
    readonly constructors: MetaConstructorItem[];
    readonly decorators: MetaSignature[];
    readonly interfaces: MetaSignature[];
}

export type ClassType = { new(...args: any[]): any }
