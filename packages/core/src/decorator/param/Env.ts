import {ParamProvider, ParamProviderHandler} from "./ParamProvider";
import {Sabre} from "../../interfaces";


class EnvParamProvider implements ParamProviderHandler {
    constructor(private data: { key: string, defaultValue?: string }) {
    }

    handleParam(_paramType: string, _container: Sabre): string | undefined {
        return process.env[this.data.key] || this.data.defaultValue;
    }
}

/**
 * The named decorator will name the injection point to something other than the base Class Name
 * @author ben.davies
 */
export const Env = (key: string, defaultValue?: string): CallableFunction =>
    ParamProvider(new EnvParamProvider({key, defaultValue}))