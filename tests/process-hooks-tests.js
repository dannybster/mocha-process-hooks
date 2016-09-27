const should = require('should');
const ps = require('ps-node');

const program = {
    command: process.env.PROGRAM,
    args: process.env.PROGRAM_ARGUMENTS.split(' '),
    successOutput: process.env.SUCCESS_OUTPUT,
    errorOutput: process.env.ERROR_OUTPUT,
    timeout: process.env.PROGRAM_TIMEOUT || 2000,
    logLevel: process.env.LOG_LEVEL
};

const programQuery = {
    command: process.env.PROGRAM,
    arguments: process.env.PROGRAM_ARGUMENTS.split(' '),
    psargs: 'aux'
};

function testProcessIsRunning(done) {
    ps.lookup(programQuery, (err, result) => {
        should.not.exist(err);
        result.length.should.eql(1);
        done();
    });
}

function testProcessIsNotRunning(done) {
    ps.lookup(programQuery, (err, result) => {
        should.not.exist(err);
        result.length.should.eql(0);
        done();
    });
}

describe('The process hooks', function () {
    describe('Before requiring the process hooks', function () {
        it('the process should not be running.', testProcessIsNotRunning);
    });

    describe('After requiring the process hooks', function () {
        // Add the after each here so that it runs after the hooks inside
        // require('../src/process-hooks')(program).start() that way we can
        // be sure that we are testing that the process is still running 
        // after the hooks under test.
        afterEach('the process should be running.', testProcessIsRunning);

        require('../src/process-hooks')(program).start();
        it('the process should be running.', testProcessIsRunning);
    });

    describe('After all the tests have run', function () {
        it('the process should not be running.', testProcessIsNotRunning);
    });
});

describe('Calling the start and kill methods explicitly', function () {
    describe('After a call to #startProcess', function () {
        const sut = require('../src/process-hooks')(program);
        beforeEach(sut.startProcess);
        it('the process should be running', testProcessIsRunning);
        afterEach(sut.killProcess);
    });
});

describe('When a test is performed inside #pause', function () {
    const sut = require('../src/process-hooks')(program);
    sut.start();
    beforeEach(testProcessIsRunning);
    sut.pause('the process should not be running', testProcessIsNotRunning);
    afterEach(testProcessIsRunning);
});