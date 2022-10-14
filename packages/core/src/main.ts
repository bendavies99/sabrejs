import transformer from "./transformer";

const Test = (): CallableFunction => {
    return function (_target: any, _propertyKey: string, _descriptor: PropertyDescriptor) {
        console.log('Test');
    };
};

@Test()
export class App {
    constructor(private readonly msg: string) {
    }
}

export default transformer;