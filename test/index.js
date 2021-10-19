const Docker = require('dockerode')
const streams = require('stream')

const docker = new Docker({socketPath: '/var/run/docker.sock'})
const outStream = new streams.PassThrough();
//outStream.on('data', (chunk) => {
    //if (chunk.toString() != '') {
        //console.log('[OUT]' + chunk.toString())
    //}
//})
let i = 0;
(async () => {
    for await (const chunk of outStream) {
        console.log(chunk.toString('utf-8'));
        console.log('counter: ', i++)
    };
})();

const errStream = new streams.PassThrough()
errStream.on('data', (chunk) => {
    if (chunk.toString() != '') {
        console.log('[ERR]' + chunk.toString())
    }
})

const testContainer = docker.getContainer('df67962cbe66')
testContainer.inspect().then(_container => console.log(_container))
testContainer.attach({stream: true, stdout: true, stderr: true})
    .then(stream => {
        testContainer.modem.demuxStream(stream, outStream, errStream);
    })
    .catch(exception => console.log(exception));
