import {InjectionPointHandler} from "./InjectionPointHandler";

/**
 * The independent decorator will ensure that the
 * injectable class / interface will create a new instance on every injection point
 *
 * @author ben.davies
 */
export const Independent = (): CallableFunction => InjectionPointHandler({
   onInjection: (_item, name, container) => container.constructNewInstance(name, true)
});