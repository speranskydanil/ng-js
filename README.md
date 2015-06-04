# ng-js

Angular JS micro version (for learning).

It's developed for fun and to learn internals of the AngularJS framework.<br>
And also to have a light version of it to train other people,<br>
because it's much more easier to explain something about 400 lines of code, then about 10 000 loc.

It's not for production, it's not tested well, and there was no effort to optimize performance, so it's slow.

## What's implemented

Only really basic features are implemented.<br>
And they are implemented in a simplified form.<br>
Also APIs may be different.<br>
The list:

- predefined directives
- API for custom directives (`priority`, `link`, `terminal` and `scope` properties are available)
- controllers (slightly different syntax), nested controllers
- services (called factories in AngularJS) and values (shortcut)
- dependency injection and resolver (but only services and values could be injected)
- scopes, nested scopes
- watchers
- expressions and parser (unlike in AngularJS it's implemented with `eval` to simplify implementation)
- compilation (tree traversal) and applying directives
- dirty checking and digest cycle

Next directives are predefined:

- ng-render (one-time binding)
- ng-bind
- ng-model
- ng-controller
- ng-init
- ng-repeat (just recompiling, no optimizations)
- ng-click
- ng-change
- ng-show
- ng-hide
- ng-class

## What's not implemented

There are many features not implemented, mainly to not complicate the code.<br>
It's simple actually to implement them within the built structure.<br>
But it was decided it's superfluous when expressing the concept.<br>
The list:

- modules and multiple ng-app
- `config` and `run` methods
- `ng-include`
- routing
- `$http`, `$resource`, `$q`, `$timeout`, `$interval`
- events
- validations
- filters

## Code statistics

The numbers are indicated without empty lines and included underscore methods.

What            | How much
--------------- | -------------
the core        | 250 loc
with directives | 400 loc

**JSHint stats:**

There are 92 functions in this file.<br>
Function with the largest signature take 3 arguments, while the median is 1.<br>
Largest function has 8 statements in it, while the median is 2.<br>
The most complex function has a cyclomatic complexity value of 6 while the median is 1.<br>

*So I hope it's easy to learn*.

**Author (Speransky Danil):**
[Personal Page](http://dsperansky.info) |
[LinkedIn](http://ru.linkedin.com/in/speranskydanil/en) |
[GitHub](https://github.com/speranskydanil?tab=repositories) |
[StackOverflow](http://stackoverflow.com/users/1550807/speransky-danil)

