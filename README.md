# ng-custom-transformers

Because Angular CLI does not support custom TypeScript transformers/plugins
(there is still an open [feature request](https://github.com/angular/angular/issues/22434), more than 4 years), custom transformers must be configured manually by tampering with the Webpack
configuration file.

## Compatibility

This package has one peer dependency which is `"@ngtools/webpack": ">=12.0.0"`. Which is generally Angular 12 and higher.

## Disclaimer

Since custom TypeScript transformers/plugins are not officially supported by the Angular CLI, this package rely on unexported private features. Currently, it works like a charm, without changing the
default behavior, but it may be broken by the future Angular updates so there can be no guarantee.

## Usage

1. Install this package.\
   `npm i ng-custom-transformers -D`
2. Add your transformer into the `tsconfig.json`. Format is the same like one defined by [ttypescript](https://github.com/cevek/ttypescript), but don't use `ttypescript`, Angular has own pipeline for
   transformers.

<dl><dd><dl><dd>

```json5
{
    "compilerOptions": {
        // ... your options ...

        // ADD THIS SECTION!
        "plugins": [
            {
                "transform": "tst-reflect-transformer"
            },
            // use transformer you want
        ]
    }
}
```

<i>Currently, only <code>transform</code> property is supported, which is a transformer package name or path to a transformer. Other options defined by <code>ttypescript</code> are not implemented
yet. Feel free to create PR!</i>
</dd></dl></dd></dl>

3. let function exported from this package modify Webpack config used by Angular. This can be done by  [ngx-build-plus](https://github.com/manfredsteyer/ngx-build-plus)
   or by [@angular-builders/custom-webpack](https://github.com/just-jeb/angular-builders/tree/master/packages/custom-webpack), which are packages that allows you to modify Angular's Webpack config.
   choose one and continue in corresponding section.

### @angular-builders/custom-webpack

1. `npm i @angular-builders/custom-webpack -D`
2. Create file `mod.webpack.config.js`.

<dl><dd><dl><dd>

```javascript
const {AngularCustomTransformers} = require("ng-custom-transformers");

module.exports = (config, options, targetOptions) => {
    // Your transformations of "config" ....

    // And the important part here: modifyConfig()
    return AngularCustomTransformers.modifyConfig(config);
};
```

or `.ts`

```typescript
import { AngularCustomTransformers } from "ng-custom-transformers";
import {
    CustomWebpackBrowserSchema,
    TargetOptions
}                                    from "@angular-builders/custom-webpack";
import * as webpack                  from "webpack";

export default function (
    config: webpack.Configuration,
    options: CustomWebpackBrowserSchema,
    targetOptions: TargetOptions
)
{
    // Your transformations of "config"...

    // And the important part here: modifyConfig()
    return AngularCustomTransformers.modifyConfig(config);
}
```

</dd></dl></dd></dl>

3. Modify `angular.json`.

<dl><dd><dl><dd>

```json5
{
    "architect": {
        // ...
        "build": {
            "builder": "@angular-builders/custom-webpack:browser",
            // use @angular-builders/custom-webpack builder
            "options": {
                "customWebpackConfig": {
                    "path": "./mod.webpack.config.js"
                }
                // ...
            }
        }
    }
}
```

</dd></dl></dd></dl>

4. `ng build` or `ng serve`

### ngx-build-plus

1. `ng add ngx-build-plus`
2. `ng build --plugin ng-custom-transformers` or `ng serve --plugin ng-custom-transformers`