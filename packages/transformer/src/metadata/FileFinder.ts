import {FileRegistry, RegistryItem} from "./FileRegistry";
import * as path from "path";
import * as fs from "fs";

export class FileFinder {
    public findMetadataFiles(): FileRegistry {
        const distDir = path.dirname(require.resolve('@sabrejs/core'));
        return {mapper: this._handleMapperFiles(distDir), meta: this._handleMetaFiles(distDir)};
    }

    private _handleMetaFiles(distDir: string): RegistryItem {
        const item = {cjs: "", esm: ""} as RegistryItem;
        fs.readdirSync(distDir).filter(fn => fn.includes('meta') && fn.includes(".js") && !fn.includes(".map"))
            .map(f => path.join(distDir, f))
            .forEach(f => {
                const data = fs.readFileSync(f).toString('utf8');
                if (data.includes("exports.default") || data.includes('module.exports = ')) {
                    item.cjs = f;
                } else {
                    item.esm = f;
                }
            });

        return item;
    }

    private _handleMapperFiles(distDir: string): RegistryItem {
        const item = {cjs: "", esm: ""} as RegistryItem;
        fs.readdirSync(distDir).filter(fn => fn.includes('mapper') && fn.includes(".js") && !fn.includes(".map"))
            .map(f => path.join(distDir, f))
            .forEach(f => {
                const data = fs.readFileSync(f).toString('utf8');
                if (data.includes("exports.default") || data.includes('module.exports = ')) {
                    item.cjs = f;
                } else {
                    item.esm = f;
                }
            });

        return item;
    }
}