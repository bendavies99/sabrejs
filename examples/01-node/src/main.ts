import {SabreFactory, Singleton} from "@sabrejs/core";

@Singleton()
export class Logger {
    logMessage(msg: string) {
        console.log(msg);
    }
}

@Singleton()
export class HelloWorld {
    constructor(private readonly logger: Logger) {
    }

    hello() {
        this.logger.logMessage('Hello World!');
    }
}

const sabre = SabreFactory.create();
const hWorld = sabre.getInstance<HelloWorld>();
hWorld.hello();

