# Changelog

## v2.0.0

- Base classes are now stored using a `WeakMap` instead of a regular `Map`, which allows us to directly insert the objects as keys (since `WeakMap` actually requires that) without garbage collection fears.
    - This has no impact on you unless you rely on the name behavior, e.g. were passing some hacky `{name: 'test'}` instead of a class, or had intentional conflicting names.
    - It is now impossible to accidentally override injections from 3rd-party modules if your classes have the same name. You would need to intentionally import the class and register  it.
- Since symbols are no longer used for map keys, `InjectorUtil.getSymbol` no longer exists.
- There is now only a single generic on all methods that previously had two (the second was not necessary) -- just remove it if you have it.

## v1.0.0

- Initial release