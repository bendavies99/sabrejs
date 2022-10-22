export interface RegistryItem {
    esm: string;
    cjs: string;
}

export interface FileRegistry {
    meta: RegistryItem;
    mapper: RegistryItem;
}