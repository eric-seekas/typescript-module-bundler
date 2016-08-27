'use strict';
const ts = require("typescript");

class TsModuleBundler {

    constructor() {
        this._modules = {};
    }

    add(filePath, content) {
        var sourceNode = ts.createSourceFile(filePath, content.toString(), ts.ScriptTarget.ES6, true);
        var nodes = sourceNode.getChildren()[0].getChildren();

        var globals = nodes
            .filter(node => node.kind !== ts.SyntaxKind.ModuleDeclaration)
            .map(node => {
                return {
                    text: node.getFullText(),
                    source: filePath
                };
            });

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
                module.contents.push({
                    text: innerNode.getFullText(),
                    source: filePath
                });
            });
    }

    _fetchModule(name) {
        if (this._modules[name] === undefined) {
            this._modules[name] = {
                globals: [],
                contents: [],
            };
        }
        return this._modules[name];
    }

    listModules() {
        return Object.keys(this._modules);
    }

    createBundle(moduleName) {
        var module = this._modules[moduleName];

        if(module == undefined) {
            throw new Error('Module "' + moduleName + '" was not be found in any of the sources.')
        }

        var moduleGlobals = module.globals.map(x => x.text).join('\n');
        var moduleBody = module.contents.map(x => x.text).join('\n');
        var output = `${moduleGlobals}module ${moduleName} {${moduleBody}}`;

        return {
            name: moduleName,
            content: output,
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

    createBundles() {
        return this.listModules()
            .map(moduleName => this.createBundle(moduleName));
    }
}

module.exports = TsModuleBundler;