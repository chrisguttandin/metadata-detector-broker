import { IBrokerDefinition } from 'broker-factory';

export interface IMetadataDetectorBrokerDefinition extends IBrokerDefinition {
    locate(arrayBuffer: ArrayBuffer): Promise<[number, number][]>;

    strip(arrayBuffer: ArrayBuffer): Promise<ArrayBuffer>;
}
