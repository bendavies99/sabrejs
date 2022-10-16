import {InjectionPointHandler} from "./InjectionPointHandler";
import {SabreContainer} from "../interfaces/internal/SabreContainer";

/**
 * The singleton decorator will ensure that the
 * injectable class / interface will only have one lifetime
 *
 * @author ben.davies
 */
export const Singleton = (): CallableFunction => InjectionPointHandler({
   onInjection: <ReturnType>(_item, name, container): ReturnType => {
      const containerInst: SabreContainer = container as SabreContainer;
      const key = `singleton__inst::${name}`;
      if (containerInst.hasData(key)) {
         return containerInst.getData<ReturnType>(key)!;
      }
      const inst = containerInst.constructNewInstance<ReturnType>(name, true);
      containerInst.setData(key, inst);
      return inst;
   }
});