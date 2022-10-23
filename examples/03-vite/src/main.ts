import {SabreFactory, Singleton} from "@sabrejs/core";

@Singleton()
export class LevelProvider {

    getLevelName() {
        return 'INFO: ';
    }
}

@Singleton()
export class Logger {
    constructor(private readonly levelProvider: LevelProvider) {
    }

    log(msg: string) {
        console.log(this.levelProvider.getLevelName() + msg);
    }
}

@Singleton()
export class DomAdder {
    constructor(private readonly logger: Logger) {
    }

    putMessage(id: string, msg: string) {
        this.logger.log(msg);
        document.getElementById(id)!.textContent = msg;
    }

    bind(inputId, otherId) {
        const input = document.getElementById(inputId)! as HTMLInputElement;

        input.oninput = (_e) => {
            this.putMessage(otherId, input.value);
        };
    }
}

@Singleton()
export class HelloWorld {
    constructor(private readonly domAdder: DomAdder) {
    }

    hello() {
        this.domAdder.bind('test', 'test2');
    }
}

(async () => {
    const sabre = await SabreFactory.create();
    const hWorld = sabre.getInstance<HelloWorld>();
    hWorld.hello();
})();

