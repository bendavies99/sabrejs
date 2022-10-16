import {Sabre} from "./interfaces";
import {SabreImpl} from "./impl/Sabre";
import {SabreMetadataProcessorImpl} from "./impl/SabreMetadataProcessor";
import {SabreMetadataImpl} from "./impl/SabreMetadata";

class SabreFactoryImpl {
    public create(): Sabre {
        return new SabreImpl({}, new SabreMetadataProcessorImpl(), new SabreMetadataImpl());
    }
}


export const SabreFactory = new SabreFactoryImpl();