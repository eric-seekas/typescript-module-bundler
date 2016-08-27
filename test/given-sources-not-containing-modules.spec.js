const assert = require('assert');
const TsBundler = require('../src/index');

context('given sources not containing modules', () => {
    describe('when bundling modules', () => {
        var result;

        before(() => {
            var subject = new TsBundler();
            subject.add('source1', 'class Test {}');
            subject.add('source2', 'module FooBar {}');
            result = subject.createBundles();
        });

        it('then does not include contents from the sources without modules', () => {
            assert(!result.some(x => x.content.includes('class Test')), 'Failed not to include source without containing modules.');
        });

    });
});