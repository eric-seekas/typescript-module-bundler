"use strict";
const assert = require('assert');
const TsBundler = require('../src/index');
const SourceMapGenerator = require('source-map').SourceMapGenerator;
const SourceMapConsumer = require('source-map').SourceMapConsumer;

context('given a source map without mappings is included', () => {
    describe('when bundling module', () => {
        var result;
        var source1 = `module FooBar {
                class HelloWorld {
                    say() {
                        alert("Hello World");
                    }
                }
            }`;
        var source2 = `module FooBar {
                class Test {
                    example() {
                        return true;
                    }
                }
            }`;

        before(() => {
            var subject = new TsBundler(true);
            subject.add('source1', source1, new SourceMapGenerator({ file: 'source1' }));
            subject.add('source2', source2, new SourceMapGenerator({ file: 'source2' }));

            result = subject.createBundle('FooBar');
        });

        it('then maps each generated line of code to the original files line of code', () => {
            var source1Lines = source1.split('\n');
            var source2Lines = source2.split('\n');
            var generatedLines = result.content.split('\n');
            var sourceMapReader = new SourceMapConsumer(result.sourceMap.toString());

            sourceMapReader.eachMapping((mapping) => {
                var generatedLine = generatedLines[mapping.generatedLine - 1];

                if(mapping.source == 'source1') {
                    if(mapping.originalLine <= 1 || mapping.originalLine >= source1Lines.length - 1) return;
                    var source1Line = source1Lines[mapping.originalLine - 1];
                    assert.equal(generatedLine, source1Line, `Failed to align source maps.\n\t Generated Line ${mapping.generatedLine - 1}:${generatedLine} \n\t Source Line ${mapping.originalLine - 1}:${source1Line}`);
                }
                if(mapping.source == 'source2') {
                    if(mapping.originalLine <= 1 || mapping.originalLine >= source2Lines.length - 1) return;
                    var source2Line = source2Lines[mapping.originalLine - 1];
                    assert.equal(generatedLine, source2Line, `Failed to align source maps.\n\t Generated Line ${mapping.generatedLine - 1}:${generatedLine} \n\t Source Line ${mapping.originalLine - 1}:${source1Line}`);
                }
            });
        });

    });
});