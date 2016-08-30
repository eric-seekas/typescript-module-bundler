const assert = require('assert');
const TsBundler = require('../src/index');

context('given module output', () => {

    context('not passed', () => {
        describe('when bundling module', () => {
            var result;

            before(() => {
                var subject = new TsBundler();
                subject.add('source', 'module FooBar {class Apple {}}');
                result = subject.createBundle('FooBar');
            });

            it('then does not include source-map in bundle', () => {
                assert.equal(result.content, 'module FooBar {class Apple {}}');
            });
        });
    });

    context('passed as es6', () => {
        describe('when bundling module', () => {
            var result;

            before(() => {
                var subject = new TsBundler();
                subject.add('source', 'module FooBar {class Apple {} }');
                result = subject.createBundle('FooBar', 'es6');
            });

            it('then does not include source-map in bundle', () => {
                assert.equal(result.content, 'class Apple {}');
            });
        });
    });

    context('passed as export', () => {
        describe('when bundling module', () => {
            var result;

            before(() => {
                var subject = new TsBundler();
                subject.add('source', 'module FooBar {class Apple {} }');
                result = subject.createBundle('FooBar', 'export');
            });

            it('then does not include source-map in bundle', () => {
                assert.equal(result.content, 'module FooBar {class Apple {}} export = FooBar;');
            });
        });
    });

    context('passed as enclosed', () => {
        describe('when bundling module', () => {
            var result;

            before(() => {
                var subject = new TsBundler();
                subject.add('source', 'module FooBar {class Apple {} }');
                result = subject.createBundle('FooBar', 'enclosed');
            });

            it('then does not include source-map in bundle', () => {
                assert.equal(result.content, 'module FooBar {class Apple {}}');
            });
        });
    });
});