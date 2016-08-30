const assert = require('assert');
const TsBundler = require('../src/index');
const SourceMapGenerator = require('source-map').SourceMapGenerator;
const SourceMapConsumer = require('source-map').SourceMapConsumer;

context('given a source map with mappings is included', () => {
    describe('when bundling module', () => {
        var result;
        var source = `module FooBar {
                class HelloWorld {
                    say() {
                        alert("Hello World");
                    }
                }
            }`;

        before(() => {
            var subject = new TsBundler(true);
            var sourceMap = new SourceMapGenerator({ file: 'source' });
            var sourceLines = source.split('\n');

            for (var i = 1; i <= sourceLines.length; i++) {
                sourceMap.addMapping({
                    generated: { line: i * 2, column: 0 },
                    original: { line: i, column: 0 },
                    source: 'source'
                });
            }
            sourceMap.setSourceContent('source', source);
            source = '\n' + sourceLines.join('\n\n');

            subject.add('source', source, sourceMap);

            result = subject.createBundle('FooBar');
        });

        it('then maps each generated line of code taking gin account of existing source mappings to the original files line of code', () => {
            var generatedLines = result.content.split('\n');
            var sourceLines = source.split('\n');

            var sourceMapReader = new SourceMapConsumer(result.sourceMap.toString());

            sourceMapReader.eachMapping((mapping) => {
                if(mapping.originalLine <= 1 || mapping.originalLine >= sourceLines.length - 2) return;
                var generatedLine = generatedLines[mapping.generatedLine - 1];
                var sourceLine = sourceLines[mapping.originalLine - 1];
                assert.equal(generatedLine, sourceLine, `Failed to align source maps.\n\t Generated Line ${mapping.generatedLine - 1}:${generatedLine} \n\t Source Line ${mapping.originalLine - 1}:${sourceLine}`);
            });
        });

    });
});