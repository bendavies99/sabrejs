import {SabreFactory, Singleton} from "@sabrejs/core";

@Singleton()
export class DomAdder {
    putMessage(id: string, msg: string) {
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

const sabre = SabreFactory.create();
const hWorld = sabre.getInstance<HelloWorld>();
hWorld.hello();

