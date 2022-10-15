import {ClassType} from "../defs";
import {ParamProvider, ParamProviderHandler} from "./param";
// import {Sabre} from "../Sabre";


class NamedParamProvider implements ParamProviderHandler {
    constructor(private data: { name: string }) {
    }

    handleParam<ReturnType>(_paramType: string, container: any): ReturnType {
        // @ts-ignore
        return container.getInstance<ReturnType>(this.data.name);
    }
}

/**
 * The named decorator will name the injection point to something other than the base Class Name
 * @author ben.davies
 */
export const Named = (name: string): CallableFunction => {
    return function (target: ClassType, _propertyKey: string, _descriptor: PropertyDescriptor | number) {
        Reflect.defineMetadata('injectionName', name, target);
        if (typeof _descriptor === "number") {
            ParamProvider(new NamedParamProvider({name}))(target, _propertyKey, _descriptor);
        }
    }
}