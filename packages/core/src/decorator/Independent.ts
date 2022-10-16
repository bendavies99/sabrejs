import {InjectionPointHandler} from "./InjectionPointHandler";
import {SabreContainer} from "../interfaces/internal/SabreContainer";

/**
 * The independent decorator will ensure that the
 * injectable class / interface will create a new instance on every injection point
 *
 * @author ben.davies
 */
export const Independent = (): CallableFunction => InjectionPointHandler({
   onInjection: (_item, name, container) =>
       (container as SabreContainer).constructNewInstance(name, true)
});