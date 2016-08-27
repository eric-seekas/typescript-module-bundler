const assert = require('assert');
const TsBundler = require('../src/index');

context('given a source containing syntax error', () => {
    describe('when bundling modules', () => {

        it('then ignores source', () => {
            var subject = new TsBundler();
            subject.add('source1', 'module Invalid Code { ---;;@Crazy {');
            var result = subject.createBundles();

            assert.equal(result.length, 0, 'Module was still created from invalid source code.');
        });

    });
});