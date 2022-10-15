import {Condition} from "./Condition";

/**
 * The OnlyEnv will check the process.env object for the desired key and value
 * if value is not present then if key is present then it will meet the condition
 *
 * @author ben.davies
 */
export const OnlyEnv = (key: string, value?: string): CallableFunction =>
    Condition(() => {
        if (!value) return process.env[key] !== undefined && process.env[key] !== null;
        return process.env[key] === value;
    });