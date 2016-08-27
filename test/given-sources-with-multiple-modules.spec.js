const assert = require('assert');
const TsBundler = require('../src/index');

context('given a source with multiple modules', () => {
    describe('when bundling modules', () => {
        var result;

        before(() => {
            var subject = new TsBundler();
            subject.add('source1', 'module FooBar {} module Test {}');
            subject.add('source2', 'module Example {} module Test {} module Example {}');
            result = subject.createBundles();
        });

        it('then merges all modules across sources', () => {
            assert.deepEqual(result.map(x => x.name), ['FooBar', 'Test', 'Example'], 'Failed to merge multiple modules in the same source.');
        });

    });
});