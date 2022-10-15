// const sabre = SabreFactory.create();
import {Singleton} from "@sabrejs/core";

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

// const hWorld : HelloWorld = sabre.get<HelloWorld>();
// hWorld.hello();

