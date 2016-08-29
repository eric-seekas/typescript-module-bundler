const fs = require('fs');
const path = require('path');
const assert = require('assert');
const TsBundler = require('../src/index');
const cases = __dirname + '/cases/';

describe('highlevel test', () => {
    var result;

    before(() => {
        var subject = new TsBundler();

        var files = fs.readdirSync(path.join(cases, 'source'));
        files.forEach(fileName => {
            var fileContents = fs.readFileSync(path.join(cases, 'source', fileName), 'utf8');
            subject.add(cases + fileName, fileContents);
        });

        result = subject.createBundles();
    });

    it('then matches exactly', () => {
        assert.equal(result.length, 2);
        assert.equal(result.find(x => x.name == 'Drink').content.replace(/\r?\n|\r/g, '\n'), fs.readFileSync(path.join(cases, 'generated', 'drink.ts'), 'utf8').replace(/\r?\n|\r/g, '\n'));
        assert.equal(result.find(x => x.name == 'Fruit').content.replace(/\r?\n|\r/g, '\n'), fs.readFileSync(path.join(cases, 'generated', 'fruit.ts'), 'utf8').replace(/\r?\n|\r/g, '\n'));
    });

});
