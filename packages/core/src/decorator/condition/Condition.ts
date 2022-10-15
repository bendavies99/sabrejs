import {ClassType} from "../../defs";

/**
 * The named decorator will name the injection point to something other than the base Class Name
 * @author ben.davies
 */
export const Condition = (cb: (target: ClassType) => boolean): CallableFunction => {
    return function (target: ClassType, _propertyKey: string, _descriptor: PropertyDescriptor) {
        const conditions = Reflect.getMetadata('injectionPointConds', target) || [];
        conditions.push(() => cb(target));
        Reflect.defineMetadata('injectionPointConds', conditions, target);
    }
}