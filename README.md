[![Build Status](https://travis-ci.com/ArcticZeroo/krispy.svg?branch=master)](https://travis-ci.com/ArcticZeroo/krispy)

# krispy

A pretty simple dependency injector.

It works pretty ok.

## Features

- Optional global instance shared across all usages
- Inheritance checking
- Transient and Singleton resolution
- Requires very little setup (1 line to register a base/subclass, 1 line to resolve)
- Zero production dependencies

## Basic Usage (TypeScript):

```typescript
import Injector from 'krispy';

abstract class IBaseClass {
    abstract doSomeAction(): void;   
}

class ImplementedClass extends IBaseClass {
    doSomeAction(): void {
        console.log('Hello World!');
    }
}

// Optionally, you can add the generics for <IBaseClass, ImplementedClass>
Injector.global.addSingleton(IBaseClass, ImplementedClass);

const impl: IBaseClass = Injector.global.resolve(IBaseClass);

// logs 'Hello World!'
impl.doSomeAction();
```

## Advanced Usage/Information

### Abstract Classes

Because TypeScript types and interfaces do not exist at runtime, you MUST use an abstract class to register or resolve dependencies. Otherwise the injector literally gets nothing since interfaces just do not exist. If you are dead-set on interfaces, some editors like WebStorm will generate the abstract members for you from an interface.

If you're using vanilla JS, non abstract classes will work fine of course, but the fact that you can't enforce any kind of implementation contract makes this pretty useless to install.

### Type Resolution

Again, since there are no real types in TypeScript we unfortunately cannot use fancy reflection or anything like you can in Java/C#/etc. Instead, it just uses the .name of the abstract class you pass, e.g. `class MyClass` has a `.name` of `MyClass`.

Name your classes well, I guess. It's more important when you are using a global injector.

I considered using prototypes to match types, but that seems really cumbersome and probably not performant. Plus I'm pretty sure typescript gets rid of abstract stuff when compiling.

### Duplicate entries

If you register a dependency twice, it will just overwrite the last one.

### Injection Type

To inject, you can call `addTransient`, `addSingleton`, or `add` (but you have to provide the injection type after the base and inherited class)

The difference is simple:

- Transient is instantiated each time its type is resolved with `injector.resolve`
- Singleton is only instantiated the first time its type is resolved, and then that instance is cached and returned.

### Instantiation

#### global

If you don't want to deal with instantiating an Injector and passing it around, you can use the `global` static getter on `Injector`. If you don't use `global` the instance is never instantiated, so nothing is just sitting around in memory.

#### instantiated

Injector has no constructor parameters, so if you want to make a local injector...

```typescript
import Injector from 'krispy';

const injector = new Injector();
```

#### global vs instantiated

Because types are resolved by name, using global can be dangerous in some cases if your abstract classes are named really generically (such as "Logger" or "Debug" or "Database", etc.). Since duplicates just overwrite each other, you may not end up with the same type as you expect from the global injector.

I expect exactly 0 people to be using this module so go nuts with global.

### Exceptions / Errors

I can't promise any expectations of functionality if you are not using typescript. Unless it is a legitimate bug that happens with TS too, any errors from bad types or values being passed to methods is _not my concern_.

#### Registration

- Make sure your base class is actually the base class of the inherited class when you register a dependency, or you'll get a `CannotRegisterDependencyException`

#### Resolution

- If you try to resolve an unregistered dependency, you'll get an `UnresolvableDependencyException`
- If something went horribly wrong and the internal data for a dependency is null, you'll get an `UnresolvableDependencyException`. 
- If something went horribly wrong and the injection type is invalid, you'll get an `UnexpectedStateException`