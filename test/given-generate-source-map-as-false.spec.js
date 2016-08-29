const assert = require('assert');
const TsBundler = require('../src/index');

context('given generate source map as false', () => {
    describe('when bundling modules', () => {
        var result;

        before(() => {
            var subject = new TsBundler();
            subject.add('source1', 'module FooBar {}');
            subject.add('source2', 'module FooBar {}');
            result = subject.createBundle('FooBar');
        });

        it('then does not include source-map in bundle', () => {
            assert.equal(result.sourceMap, null, 'Source-map was created even though generateSourceMap was not passed.');
        });
    });

});