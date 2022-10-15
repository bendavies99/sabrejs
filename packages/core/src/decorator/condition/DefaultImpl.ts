import {Condition} from "./Condition";

/**
 * The DefaultImpl will be used if no other implementations having all matching conditions
 *
 * @author ben.davies
 */
export const DefaultImpl = (): CallableFunction => Condition((target) => {
    Reflect.defineMetadata('defaultCond', true, target);
    return true
})