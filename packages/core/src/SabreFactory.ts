import {Sabre} from "./interfaces";
import {SabreImpl} from "./impl/Sabre";
import {SabreMetadataProcessorImpl} from "./impl/SabreMetadataProcessor";
import {SabreMetadataImpl} from "./impl/SabreMetadata";

class SabreFactoryImpl {
    public async create(): Promise<Sabre> {
        const inst = new SabreImpl({}, new SabreMetadataProcessorImpl(), new SabreMetadataImpl());
        await inst.init();
        return inst;
    }
}


export const SabreFactory = new SabreFactoryImpl();