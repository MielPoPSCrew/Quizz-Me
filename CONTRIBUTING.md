# Cordova android integration / Project eolienne

## Getting start

This project uses static HTML / js / CSS to render a webview in android, the followings tools are used to generate and develop those static files.
- [gulp](https://github.com/gulpjs/gulp/tree/4.0) (version 4)
- [es6](http://es6-features.org)
- [webpack](https://webpack.js.org/)
- [sass](http://sass-lang.com/) full integration with vendors dynamic dependecies
- [Materialize](http://materializecss.com/) (sass integrated)
- [font Awesome](http://fontawesome.io/) (sass integrated)
- [eslint](http://eslint.org/)
- [jsdoc](http://usejsdoc.org/)

### Init

Run those commands to build and launch the app.

```
npm install gulpjs/gulp-cli -g
npm install
gulp init
```

### Architecture

To add a library, run `npm install myLib --save` file.

Do not forget to run `gulp buildJs` or `npm run build` to compile the new *main.js* file.

All js vendors files are in `node_modules` directory.

All scss vendors files are imported in `public/sass/vendors` directory.

All fonts vendors files are imported in `public/fonts` directory.

### Gulp integration

Gulp is used to automatize tasks, using nodeJs to process files.

Gulp tasks:

- Init
    - **init** *(Init the app by downloading / moving all dependencies and build js / css)*
- Vendors npm requirements
    - **vendorsDownload** *(Download vendors dependencies in node_modules directory)*
    - **vendorsMoveSass** *(Move sass vendors files into public/vendor directory)*
    - **vendorsMoveFonts** *(Move fonts vendors files into public/fonts directory)*
    - **vendorsClean** *(Clean vendors dependencies fonts and sass source files (not in node_modules))*
    - **vendors** *(Wrapper for vendorsDownload then vendorsClean then vendorsMoveSass and vendorsMoveFonts)*
- Sass / js build
    - **sassDev** *(Compile sass files and generate map in .css result file)*
    - **sassProd** *(Compile sass files in a .css file)*
    - **buildJs** *(Build the js source files into public/js/main.js and public/js/vendor.js)*
- Watchers
    - **watch** *(Monitor changes in js and sass src and run sassDev or buildJs on files changed)*
- Linter
    - **eslint** *(Lint js files with eslint linter)*
- jsDoc
    - **jsdoc** *(Generate the jsdoc in storage/app/public/jsDoc)*
    
All sass dependencies must be listed in `paths` const declaration.

### Sass

The sass integration is pretty simple here. A main `public/sass/app.scss` is used to required all sass dependencies.

This file is compiled using sass pre-processor and generate a unique `public/css/style.css` file for all you app with the command `gulp sassDev` or `gulp sassProd` (without sources map).

You can add as much custom .scss files as you want in `public/sass` directory, be sure to add those files in the main `public/sass/app.scss` file.

### Eslint

Natively `eslint:all` is set in the `.eslintrc.json` file which can be edited to add / remove js lint rules.

### Jsdoc (not implemented)

The jsdoc is automaticaly generated in `public/jsDoc` directory with the commande `gulp jsdoc`.

[ink-docstrap](https://github.com/docstrap/docstrap) theme is used to generate the documentation.

Jsdoc parameters can be edited in `jsdocConfig.json` file.
