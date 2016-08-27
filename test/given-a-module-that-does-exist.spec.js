const assert = require('assert');
const TsBundler = require('../src/index');

context('given a module that does exist', () => {
    describe('when bundling a single module', () => {

        it('then it throws an error telling the user that the module can not be found', () => {
            var subject = new TsBundler();
            subject.add('source1', 'module Example {}');

            assert.throws(() => {
                subject.createBundle('NonExistingModule');
            }, /NonExistingModule/);
        });

    });
});