import {ClassType} from "../../defs";
import {Sabre} from "../../interfaces";

export interface ParamProviderHandler {
    handleParam: (paramType: string, container: Sabre) => any;
}

/**
 * The named decorator will name the injection point to something other than the base Class Name
 * @author ben.davies
 */
export const ParamProvider = (handler: ParamProviderHandler): CallableFunction => {
    return function (target: ClassType, _propertyKey: string, _index: number) {
        Reflect.defineMetadata('paramProvider', handler, target, "index:" + _index);
    }
}
