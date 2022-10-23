import {SabreFactory, Singleton} from "@sabrejs/core";

if (module.hot) {
    module.hot.accept(() => {});
}

@Singleton()
export class Namey {

}

@Singleton()
export class LoggerName {
    name() {
        return 'mainy';
    }
}

@Singleton()
export class Test {
    constructor(private readonly loggerName: LoggerName) {
    }

    log(msg: string) {
        console.log(`INFO [${this.loggerName.name()}]: ${msg}`);
    }
}

@Singleton()
export class DomAdder {
    constructor(private readonly test: Test) {
    }

    putMessage(id: string, msg: string) {
        this.test.log(msg);
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

