'use strict';
const should = require('should');
const spawn = require('child_process').spawn;

const debug = '20';

const processManager = (programOptions) => {

    const debugLog = (entry) => {
        if (programOptions.logLevel === debug) {
            console.log(entry);
        }
    }

    let program;
    function startProcess(callback) {
        this.timeout(programOptions.timeout || 2000);
        should.not.exist(program);

        debugLog(`Starting process ${programOptions.command} ${programOptions.args.join(' ')}`);
        program = spawn(programOptions.command, programOptions.args);

        let consoleOut = '';
        const isProcessStarted = (data) => {
            consoleOut += data;
            debugLog(data.toString());
            if (consoleOut.indexOf(programOptions.successOutput) !== -1) {
                program.stdout.removeListener('data', isProcessStarted);
                consoleOut = '';
                callback();
            }
        };

        program.stdout.on('data', isProcessStarted);
    }

    function killProcess(callback) {
        this.timeout(programOptions.timeout || 2000);
        should.exist(program);

        program.on('exit', (code, signal) => {
            program = null;
            callback();
        });

        program.kill();
    }

    return {
        debugLog,
        startProcess,
        killProcess,
        start: function startProcessBefore() {
            before(startProcess);
            after(killProcess);
        },
        pause: function pause(description, test) {
            describe('=== pausing process ===', function () {
                beforeEach(killProcess);
                it(description, test);
                afterEach(startProcess);
            });
        }
    };
};

module.exports = processManager;