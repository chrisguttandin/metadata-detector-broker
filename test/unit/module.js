import { load } from '../../src/module';

describe('module', () => {

    let metadataDetector;

    afterEach((done) => {
        Worker.reset();

        // @todo This is a optimistic fix to prevent the famous 'Some of your tests did a full page reload!' error.
        setTimeout(done, 500);
    });

    beforeEach(() => {
        Worker = ((OriginalWorker) => { // eslint-disable-line no-global-assign
            const instances = [];

            return class ExtendedWorker extends OriginalWorker {

                constructor (url) {
                    super(url);

                    const addEventListener = this.addEventListener;

                    // This is an ugly hack to prevent the broker from handling mirrored events.
                    this.addEventListener = (index, ...args) => {
                        if (typeof index === 'number') {
                            return addEventListener.apply(this, args);
                        }
                    };

                    instances.push(this);
                }

                static addEventListener (index, ...args) {
                    return instances[index].addEventListener(index, ...args);
                }

                static get instances () {
                    return instances;
                }

                static reset () {
                    Worker = OriginalWorker; // eslint-disable-line no-global-assign
                }

            };
        })(Worker);

        const blob = new Blob([
            `self.addEventListener('message', ({ data }) => {
                self.postMessage(data);
            });`
        ], { type: 'application/javascript' });

        metadataDetector = load(URL.createObjectURL(blob));
    });

    describe('locate()', () => {

        let arrayBuffer;

        beforeEach(() => {
            arrayBuffer = new ArrayBuffer(1024);
        });

        it('should send the correct message', (done) => {
            Worker.addEventListener(0, 'message', ({ data }) => {
                expect(data.id).to.be.a('number');

                expect(data.params.arrayBuffer).to.be.an.instanceOf(ArrayBuffer);
                expect(data.params.arrayBuffer.byteLength).to.equal(1024);

                expect(data).to.deep.equal({
                    id: data.id,
                    method: 'locate',
                    params: {
                        arrayBuffer: data.params.arrayBuffer
                    }
                });

                done();
            });

            metadataDetector.locate(arrayBuffer);
        });

    });

    describe('strip()', () => {

        let arrayBuffer;

        beforeEach(() => {
            arrayBuffer = new ArrayBuffer(1024);
        });

        it('should send the correct message', (done) => {
            Worker.addEventListener(0, 'message', ({ data }) => {
                expect(data.id).to.be.a('number');

                expect(data.params.arrayBuffer).to.be.an.instanceOf(ArrayBuffer);
                expect(data.params.arrayBuffer.byteLength).to.equal(1024);

                expect(data).to.deep.equal({
                    id: data.id,
                    method: 'strip',
                    params: {
                        arrayBuffer: data.params.arrayBuffer
                    }
                });

                done();
            });

            metadataDetector.strip(arrayBuffer);
        });

    });

});
