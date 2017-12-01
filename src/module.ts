import { addUniqueNumber } from 'fast-unique-numbers';
import { ILocateRequest, ILocateResponse, IStripRequest, IStripResponse, IWorkerEvent } from 'metadata-detector-worker';

export const load = (url: string) => {
    const worker = new Worker(url);

    const ongoingRecordingRequests: Set<number> = new Set();

    const locate = (arrayBuffer: ArrayBuffer): Promise<[ number, number ][]> => {
        return new Promise((resolve, reject) => {
            const id = addUniqueNumber(ongoingRecordingRequests);

            const onMessage = ({ data }: IWorkerEvent) => {
                if (data.id === id) {
                    ongoingRecordingRequests.delete(id);

                    worker.removeEventListener('message', onMessage);

                    if (data.error === null) {
                        resolve((<ILocateResponse> data).result.locations);
                    } else {
                        reject(new Error(data.error.message));
                    }
                }
            };

            worker.addEventListener('message', onMessage);

            worker.postMessage(<ILocateRequest> { id, method: 'locate', params: { arrayBuffer } }, [ arrayBuffer ]);
        });
    };

    const strip = (arrayBuffer: ArrayBuffer): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
            const id = addUniqueNumber(ongoingRecordingRequests);

            const onMessage = ({ data }: IWorkerEvent) => {
                if (data.id === id) {
                    ongoingRecordingRequests.delete(id);

                    worker.removeEventListener('message', onMessage);

                    if (data.error === null) {
                        resolve((<IStripResponse> data).result.arrayBuffer);
                    } else {
                        reject(new Error(data.error.message));
                    }
                }
            };

            worker.addEventListener('message', onMessage);

            worker.postMessage(<IStripRequest> { id, method: 'strip', params: { arrayBuffer } }, [ arrayBuffer ]);
        });
    };

    return {
        locate,
        strip
    };
};
