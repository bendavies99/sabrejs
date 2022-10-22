import {Sabre} from "../Sabre";

/**
 * Sabre Container methods for internal use only!
 */
export interface SabreContainer extends Sabre {
    getData<T>(name: string): T | undefined;
    hasData(name: string): boolean;
    setData(name: string, value: any): void;
    constructNewInstance<T>(named: string, initToo?: boolean): T;
    init(): Promise<void>;
}