# TypeScript Module Bundler

A pre-processor tool used to combine TypeScript modules that have been split across multiple files. 

## Motivation
The aim of the project is to help improve code organization in projects that wish to use modules namespaces to encapsulation units of code.
The current work flow forces projects to contain entire logic of each module in a single file which can have negative effect on readability as the module grows.
Solutions such as combining TypeScript files often result in complex build tools to fish out the right files to combine and also run into many other issues dealing with duplicate global code such as module imports.
Another side effect of simply combing module files is that TypeScript will still count each module enclosure as separate, wrapping each of them in there own nest of IIFEs, [doc/example-nested-side-effect.js](doc/example-nested-side-effect.js) is a good example of that.

## How does it work?
Simply put, it takes the body of each module then combines all the same modules to together wrapping the code in a single module wrap. It also ensures the global code from each module file is also included and removing any duplicate code that could cause any build errors.

## Examples

### Usage Example
```js
const TsModuleBundler = require('typescript-module-bundler');

var tsBundler = new TsModuleBundler();
tsBundler.add('file1.ts', 'module Example1 {...}');
tsBundler.add('file2.ts', 'module Example1 {...}');
tsBundler.add('file3.ts', 'module Example2 {...}');

var bundles = tsBundler.createBundles();

/*
    Example Result:
    bundles = [
        {
            name: 'Example1',
            content: 'module Example1 {...}',
            sources: ['file1.ts', 'file2.ts']
        },
        {
            name: 'Example2',
            content: 'module Example2 {...}',
            sources: ['file3.ts']
        }
    ]
*/
```

### Output Example
Example results after files have been piped through TsModuleBundler then transpiled by TypeScript.
```
├── src/
   ├── file1.ts ~ module Module1 {...}
   ├── file2.ts ~ module Module1 {...}
   ├── file3.ts ~ module Module2 {...}
   └── file4.ts ~ module Module2 {...}

├── dist/
   ├── Module1.js
   └── Module2.js
```

## API

#### new TsModuleBundler()
Initialize a new module bundler object.

#### add(filePath, content)
Adds source containing modules to later bundle.

Parameters:
- filePath: file path of the input file
- content: content (Buffer or string) of the input file

#### listModules()
Returns a list of module names found in any of the added sources.

#### createBundle(moduleName)
Returns a single bundle for that module.

Bundle:
- name: name of the module
- contents: combined body of modules
- sources: list of sources used to create this bundle 

#### createBundles()
Returns list of all module bundles found in provided sources.