import {SabreFactory, Singleton} from "@sabrejs/core";

@Singleton()
export class Test {
    log(msg: string) {
        console.log(msg);
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

