import {Condition} from "./Condition";

/**
 * The OnlyNodeEnv will check the process.env.NODE_ENV for the desired node env to match the interface
 *
 * @author ben.davies
 */
export const OnlyNodeEnv = (nodeEnv: string | "production" | "development" | "test"): CallableFunction =>
    Condition(() => process.env.NODE_ENV === nodeEnv);