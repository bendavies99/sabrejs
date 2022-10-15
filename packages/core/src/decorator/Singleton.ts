import {InjectionPointHandler} from "./InjectionPointHandler";

/**
 * The singleton decorator will ensure that the
 * injectable class / interface will only have one lifetime
 *
 * @author ben.davies
 */
export const Singleton = (): CallableFunction => InjectionPointHandler({
   onInjection: (_item, name, container) => container.getInstance(name, true)
});