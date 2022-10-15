import {ClassType, InjectionPointHandlerOptions} from "../defs";

/**
 * The independent decorator will ensure that the
 * injectable class / interface will create a new instance on every injection point
 *
 * @author ben.davies
 */
export const InjectionPointHandler = (opts: InjectionPointHandlerOptions): CallableFunction => {
    return function (_target: ClassType, _propertyKey: string, _descriptor: PropertyDescriptor) {
        Reflect.defineMetadata('injectionPointHandler', opts, _target);
    }
}
