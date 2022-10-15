import {CompilerOptions} from "typescript";
import {Sabre, RegistryItem} from "./Sabre";

export type InjectionMeta = InjectionMetaItem[];

export interface InjectionMapper {
    [key: string]: () => ClassType;
}


export interface InjectionPointHandlerOptions {
    onInjection: <T>(item: RegistryItem, name: string, container: Sabre) => T;
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
