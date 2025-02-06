import { createBroker } from 'broker-factory';
import { TMetadataDetectorWorkerDefinition } from 'metadata-detector-worker';
import { IMetadataDetectorBrokerDefinition } from './interfaces';
import { TMetadataDetectorBrokerLoader, TMetadataDetectorBrokerWrapper } from './types';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

export const wrap: TMetadataDetectorBrokerWrapper = createBroker<IMetadataDetectorBrokerDefinition, TMetadataDetectorWorkerDefinition>({
    locate: ({ call }) => {
        return (arrayBuffer: ArrayBuffer) => call('locate', { arrayBuffer }, [arrayBuffer]);
    },
    strip: ({ call }) => {
        return (arrayBuffer: ArrayBuffer) => call('strip', { arrayBuffer }, [arrayBuffer]);
    }
});

export const load: TMetadataDetectorBrokerLoader = (url: string) => {
    const worker = new Worker(url);

    return wrap(worker);
};
