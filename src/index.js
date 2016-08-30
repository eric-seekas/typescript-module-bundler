'use strict';
const ts = require("typescript");
const SourceMapGenerator = require('source-map').SourceMapGenerator;
const SourceMapConsumer = require('source-map').SourceMapConsumer;

class TsModuleBundler {

    constructor(generateSourceMap) {
        this._modules = {};
        this._generateSourceMap = generateSourceMap;
    }

    add(filePath, content, sourceMap) {
        var sourceNode = ts.createSourceFile(filePath, content.toString(), ts.ScriptTarget.ES6, true);
        var nodes = sourceNode.getChildren()[0].getChildren();

        var globals = nodes
            .filter(node => node.kind !== ts.SyntaxKind.ModuleDeclaration)
            .map(node => TsModuleBundler._mapSourceNodes(node, filePath, sourceMap));

        nodes.filter(node => node.kind === ts.SyntaxKind.ModuleDeclaration)
            .forEach(node => {
                var innerNode = node.body.getChildren()[1];
                if(!innerNode) return;
                var module = this._fetchModule(node.name.text);

                for(var global of globals) {
                    if (!module.globals.some(x => global.text === x.text)) {
                        module.globals.push(global);
                    }
                }
                module.contents.push(TsModuleBundler._mapSourceNodes(innerNode, filePath, sourceMap));
            });
    }

    _fetchModule(name) {
        if (this._modules[name] === undefined) {
            this._modules[name] = {
                globals: [],
                contents: [],
                sourceMap: this._generateSourceMap ? new SourceMapGenerator({ file: name + '.ts' }) : null
            };
        }
        return this._modules[name];
    }

    static _mapSourceNodes(node, source, sourceMap) {
        var offset = node.getSourceFile().getLineAndCharacterOfPosition(node.pos);
        var text = node.getFullText();

        return {
            text: text,
            source: source,
            lineOffset: offset.line + 1,
            lines: text.split('\n').length,
            sourceMap: sourceMap
        };
    }
    static _addSourceMapping(item, sourceMap, generatedLineOffset) {
        if (item.sourceMap && item.sourceMap.mappings && item.sourceMap.mappings.length > 0) {
            var sourceMapReader = new SourceMapConsumer(item.sourceMap);

            sourceMapReader.eachMapping((mapping) => {
                var line = mapping.generatedLine - item.lineOffset;
                if(!mapping.source || line < 0 || line >= item.lines) return;

                sourceMap.addMapping({
                    generated: {
                        line: generatedLineOffset + mapping.generatedLine - item.lineOffset,
                        column: mapping.generatedColumn
                    },
                    original: {
                        line: mapping.originalLine,
                        column: mapping.originalColumn
                    },
                    source: mapping.source,
                    name: mapping.name
                });
            });

            if (sourceMapReader.sourcesContent) {
                sourceMapReader.sourcesContent.forEach((sourceContent, i) => {
                    sourceMap.setSourceContent(sourceMapReader.sources[i], sourceContent);
                });
            }
        } else {
            for (var i = 0; i < item.lines; i++) {
                sourceMap.addMapping({
                    generated: {
                        line: generatedLineOffset + i,
                        column: 0
                    },
                    original: {
                        line: item.lineOffset + i,
                        column: 0
                    },
                    source: item.source
                });
            }

            if (item.sourceMap && item.sourceMap.sourcesContent) {
                sourceMap.setSourceContent(item.source, item.sourceMap.sourcesContent[0]);
            }
        }
    }

    listModules() {
        return Object.keys(this._modules);
    }

    createBundle(moduleName, moduleOutput) {
        var module = this._modules[moduleName];

        if(module == undefined) {
            throw new Error('Module "' + moduleName + '" was not be found in any of the sources.')
        }

        if(this._generateSourceMap) {
            var generatedLineOffset = 1;

            for(var global of module.globals) {
                TsModuleBundler._addSourceMapping(global, module.sourceMap, generatedLineOffset);
                generatedLineOffset += global.lines;
            }

            for(var content of module.contents) {
                TsModuleBundler._addSourceMapping(content, module.sourceMap, generatedLineOffset);
                generatedLineOffset += content.lines;
            }
        }

        var moduleGlobals = module.globals.map(x => x.text).join('\n');
        if(module.globals.length > 0) {
            moduleGlobals += '\n';
        }
        var moduleBody = module.contents.map(x => x.text).join('\n');
        var output;

        switch(moduleOutput) {
            case 'export':
                output = `${moduleGlobals}module ${moduleName} {${moduleBody}} export = ${moduleName};`;
                break;

            case 'es6':
            case 'none':
                output = `${moduleGlobals}${moduleBody}`;
                break;

            case 'enclosed':
            case 'wrapped':
            default:
                output = `${moduleGlobals}module ${moduleName} {${moduleBody}}`;
                break;
        }

        return {
            name: moduleName,
            content: output,
            sourceMap: module.sourceMap,
            sources: []
                .concat(module.globals.map(x => x.source))
                .concat(module.contents.map(x => x.source))
                .reduce((uniques, item) => {
                    if (uniques.indexOf(item) === -1) {
                        uniques.push(item);
                    }
                    return uniques;
                }, [])
        };
    }

    createBundles(moduleOutput) {
        return this.listModules()
            .map(moduleName => this.createBundle(moduleName, moduleOutput));
    }
}

module.exports = TsModuleBundler;