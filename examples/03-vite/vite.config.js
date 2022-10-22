import ttypescript from 'ttypescript'
import {defineConfig} from "vite";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
    plugins: [
        typescript({
            typescript: ttypescript
        })
    ],
})