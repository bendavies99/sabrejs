import {RegistryItem} from "./FileRegistry";
import {SerialisedClass} from "../transformer/serialiser";
import * as fs from "fs";

export class MapperFileWriter {
    constructor(private readonly mapperFiles: RegistryItem) {
    }

    public write(items: any) {
        this._writeEsm(items);
        this._writeCjs(items);
    }

    private _writeEsm(items: any) {
        fs.writeFileSync(this.mapperFiles.esm,`var a232323_mapper = ${this._stringifyItems(items, true)};export{a232323_mapper as default};`);
    }

    private _writeCjs(items: any) {
        fs.writeFileSync(this.mapperFiles.cjs,`var a23232333_mapper = ${this._stringifyItems(items, false)};module.exports = {default: a23232333_mapper};`);
    }

    private _stringifyItems(items: any, isEsm: boolean) {
        return JSON.stringify(items, null, 2)
            .replace(/"/gmi, "")
            .replace(/\{\{REPLACE_FUNCTION}}/gm, isEsm ? '(await import' : 'require')
            .replace(/\{\{REPLACE_ESM_RESULT}}/gm, isEsm ? '.default' : '')
            .replace(/\{\{REPLACE_FUNC_END}}/gm, isEsm ? ')' : '')
    }
}