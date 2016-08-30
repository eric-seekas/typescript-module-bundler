# TypeScript Module Bundler

A pre-processor tool used to combine TypeScript modules that have been split across multiple files. 

## Motivation
The aim of the project is to help improve code organisation in projects that wish to use module namespaces to encapsulation units of code. The current workflow forces TypeScript projects to contain the entire logic of each module in a single file. This can have negative effects on readability as the module grows. Solutions such as combining TypeScript files often result in complex build tools in order to fish out the right files to combine. A side effect of this is duplicate global code, such as module imports. Another byproduct of simply combining module files is that TypeScript will still count each module enclosure as a separate entity, wrapping each of them in their own nest of IIFEs, [doc/example-nested-side-effect.js](doc/example-nested-side-effect.js) is a good example of that.

## How does it work?
Simply put, it takes the body of each module then combines all the code for the modules together, wrapping the code in a single module wrap. It also ensures the global code from each module file is also included, removing any duplicate code that could cause any build errors.

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

### Build tool example using the [Gulp Plugin](https://github.com/techmatt101/gulp-typescript-module-bundler)
```js
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const tsModuleBundler = require('gulp-typescript-module-bundler');

gulp.task('scripts', () => {
    return gulp.src('src/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsModuleBundler())
        .pipe(ts({
            module: 'commonjs'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});
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

#### new TsModuleBundler(generateSourceMap?)
Initialize a new module bundler object.

Parameters:
- generateSourceMap: flag to generate source-maps for each bundle

#### add(filePath, content, sourceMap?)
Adds a file containing modules to later bundle.

Parameters:
- filePath: file path of the input file
- content: content (Buffer or string) of the input file
- sourceMap: optional parameter to pass files source-map

#### listModules()
Returns a list of module names found in any of the added files.

#### createBundle(moduleName, moduleOutput?)
Returns a single bundle for that module.

Parameters:
- moduleName: name of module found in sources to bundle
- moduleOutput: optional string parameter to set module output.
    - 'enclosed' (default): wraps the module contents in a module enclosure. 
    - 'export': wraps the module contents in a exported module enclosure.
    - 'traditionalExport': wraps the module contents in a module enclosure and exports module for traditional CommonJS and AMD workflow.
    - 'es6' / 'none': does not wrap the module contents.

Bundle:
- name: name of the module
- contents: combined body of modules
- sourceMap: generated source-mappings for contents
- sources: list of files used to create this bundle 

#### createBundles(moduleOutput?)
Returns list of all module bundles found in provided files.
