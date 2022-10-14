import fs from "fs";
import path from "path";
import {CoreProperties} from "@schemastore/package";

const baseAppDir = fs.realpathSync(process.cwd());
const resolve = (dir: string): string => path.resolve(baseAppDir, dir);
const exists = (dir: string): boolean => fs.existsSync(resolve(dir));
const requireFile = <T = any>(loc: string): T => require(resolve(loc)) as T;
const packageJson = requireFile<CoreProperties>('package.json');

class PathUtilImpl {
    getPackageJson() {
        return packageJson;
    }

    getBaseAppDir() {
        return baseAppDir
    }

    public requireFile<T = any>(file: string): T {
        return requireFile<T>(file)
    }

    public exists(file: string): boolean {
        return exists(file)
    }

    public resolve(dir: string): string {
        return resolve(dir)
    }
}

export const PathUtil = new PathUtilImpl();