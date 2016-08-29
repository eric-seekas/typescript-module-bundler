const assert = require('assert');
const TsBundler = require('../src/index');

context('given sources include global code', () => {
    describe('when bundling modules', () => {
        var result;

        before(() => {
            var subject = new TsBundler();
            subject.add('source1', 'alert("before1"); module FooBar {} alert("after1");');
            subject.add('source2', 'alert("before2"); module FooBar {} alert("after2");');
            result = subject.createBundle('FooBar');
        });

        it('then includes the global code for each module', () => {
            assert(result.content.includes('alert("before1");'), 'Missing global code before module.');
            assert(result.content.includes('alert("after1");'), 'Missing global code after module.');
            assert(result.content.includes('alert("before1");'), 'Missing global code before module.');
            assert(result.content.includes('alert("after2");'), 'Missing global code after module.');
        });
    });

    context('with lines of the same code used in other sources', () => {
        var result;

        before(() => {
            var subject = new TsBundler();
            subject.add('source1', 'alert("same"); module FooBar {}');
            subject.add('source2', 'alert("same"); module FooBar {}');
            subject.add('source3', 'alert("notthesame"); module FooBar {}');
            result = subject.createBundle('FooBar');
        });

        it('then removes any duplicate global code that could cause typescript errors', () => {
            assert.equal(result.content.match(/alert\("same"\);/g).length, 1, 'Failed to remove duplicate global code.');
        });
    });

    context('with sources containing multiple modules', () => {
        var result;

        before(() => {
            var subject = new TsBundler();
            subject.add('source1', 'alert("hello"); module FooBar {} module Test {} module Example {}');
            result = subject.createBundles();
        });

        it('then includes the global code for each module', () => {
            result.forEach(bundle => {
                assert(bundle.content.includes('alert("hello");'), 'Failed to include global code for each module.');
            });
        });
    });

});