const assert = require('assert');
const TsBundler = require('../src/index');

context('given sources containing modules', () => {
    describe('when bundling modules', () => {
        var result;

        before(() => {
            var subject = new TsBundler();
            subject.add('source1', 'module FooBar { class Orange {} }');
            subject.add('source2', 'module FooBar { function Banana(){} {} }');
            subject.add('source3', 'module Test { interface Kiwi {} } module Test { class Blueberry {} }');
            subject.add('source4', 'module Example { var Pineapple = "Mango"; } module Test { class Cherry {} }');
            subject.add('source5', 'module Test { class Apple {} }');

            result = subject.createBundles();
        });

        it('then then combines the contents of each module', () => {
            assert(result.find(x => x.name == 'FooBar').content.includes('class Orange'), 'Missing contents from module.');
            assert(result.find(x => x.name == 'FooBar').content.includes('function Banana(){}'), 'Missing contents from module.');

            assert(result.find(x => x.name == 'Test').content.includes('interface Kiwi'), 'Missing contents from module.');
            assert(result.find(x => x.name == 'Test').content.includes('class Blueberry'), 'Missing contents from module.');
            assert(result.find(x => x.name == 'Test').content.includes('class Cherry'), 'Missing contents from module.');

            assert(result.find(x => x.name == 'Example').content.includes('var Pineapple = "Mango";'), 'Missing contents from module.');
        });

        it('then only includes single module wrapper for each bundle', () => {
            assert.notEqual(result.find(x => x.name == 'FooBar').content.match(/module FooBar/g), null, 'Missing module wrapper.');
            assert.equal(result.find(x => x.name == 'FooBar').content.match(/module FooBar/g).length, 1, 'Included more than one module wrapper.');

            assert.notEqual(result.find(x => x.name == 'Test').content.match(/module Test/g), null, 'Missing module wrapper.');
            assert.equal(result.find(x => x.name == 'Test').content.match(/module Test/g).length, 1, 'Included more than one module wrapper.');

            assert.notEqual(result.find(x => x.name == 'Example').content.match(/module Example/g), null, 'Missing module wrapper.');
            assert.equal(result.find(x => x.name == 'Example').content.match(/module Example/g).length, 1, 'Included more than one module wrapper.');
        });

        it('then returns the sources used for each bundle', () => {
            assert.deepEqual(result.find(x => x.name == 'FooBar').sources, ['source1', 'source2'], 'Incorrect sources return from bundle.');
            assert.deepEqual(result.find(x => x.name == 'Test').sources, ['source3', 'source4', 'source5'], 'Incorrect sources return from bundle.');
        });
    });
});
