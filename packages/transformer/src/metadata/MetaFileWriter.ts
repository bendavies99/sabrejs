import {RegistryItem} from "./FileRegistry";
import {SerialisedClass} from "../transformer/serialiser";
import * as fs from "fs";

export class MetaFileWriter {
    constructor(private readonly metaFiles: RegistryItem) {
    }

    public write(items: SerialisedClass[]) {
        this._writeEsm(items);
        this._writeCjs(items);
    }

    private _writeEsm(items: SerialisedClass[]) {
        fs.writeFileSync(this.metaFiles.esm,`var a232323_meta = {items:${JSON.stringify(items)}};export{a232323_meta as default};`);
    }

    private _writeCjs(items: SerialisedClass[]) {
        fs.writeFileSync(this.metaFiles.cjs,`var a23232333_meta = {items:${JSON.stringify(items)}};module.exports = {default: a23232333_meta};`);
    }
}