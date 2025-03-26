# Err

## Install

	npm install @leonardoraele/err

## Usage

```js
import { Err } from '@leonardoraele/err';
```
```js
new Err('This is an error')
	.with({ context: 'Add JSON data this way' }) // Use `.with()` to add content information tot he error
	.causes('Another error')                     // Use `.causes()` to create a new error that has `this` error as a
	                                             //   cause. When the new error is stringified (e.g. in the console),
												 //   the cause will be displayed in a separated.
	.throw();                                    // Use `throw()` to throw the error in an expression instead of
	                                             //   requiring a dedicated statement.
```

Output in Node 23:

```
Uncaught:
Err [Error]: Another error
    at ... {
  details: undefined,
  [cause]: Err [Error]: This is an error
      at ... {
    details: { context: 'Add JSON data this way' }
  }
}
```
