import { ILocateRequest, ILocateResponse, IStripRequest, IStripResponse, IWorkerEvent } from 'metadata-detector-worker';

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

const generateUniqueId = (set: Set<number>) => {
    let id = Math.round(Math.random() * MAX_SAFE_INTEGER);

    while (set.has(id)) {
        id = Math.round(Math.random() * MAX_SAFE_INTEGER);
    }

    return id;
};

export const load = (url: string) => {
    const worker = new Worker(url);

    const ongoingRecordingRequests: Set<number> = new Set();

    const locate = (arrayBuffer: ArrayBuffer): Promise<[ number, number ][]> => {
        return new Promise((resolve, reject) => {
            const id = generateUniqueId(ongoingRecordingRequests);

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
            const id = generateUniqueId(ongoingRecordingRequests);

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
