import { expect } from 'chai';
import Injector from '../lib/Injector';
import UnresolvableDependencyException from '../lib/exception/UnresolvableDependencyException';
import CannotRegisterDependencyException from '../lib/exception/CannotRegisterDependencyException';
import ClassInjectable from '../lib/models/ClassInjectable';
import UnexpectedStateException from '../lib/exception/UnexpectedStateException';
import InjectorUtil from '../lib/util/InjectorUtil';

function getInjectorData(injector: Injector): WeakMap<any, ClassInjectable<any>> {
    return injector['_items'];
}

describe('InjectorUtil', function () {
    describe('isInheritedFrom', function () {
        it('returns false when the classes are not descended from one another', function () {
            class ClassA {}
            class ClassB {}

            expect(InjectorUtil.isInheritedFrom(ClassA, ClassB)).to.be.false;
        });

        it('returns true when the inherited class is a direct descendant', function () {
            class Base {}
            class Inherited extends Base {}

            expect(InjectorUtil.isInheritedFrom(Base, Inherited)).to.be.true;
        });

        it('returns true when the inherited class is a second-level descendant', function () {
            class BaseA {}
            class BaseB extends BaseA {}
            class Inherited extends BaseB {}

            expect(InjectorUtil.isInheritedFrom(BaseB, Inherited)).to.be.true;
            expect(InjectorUtil.isInheritedFrom(BaseA, Inherited)).to.be.true;
        });

        it('returns false when the prototype of the inherited is null', function () {
            class Base {}
            class Inherited extends Base {}

            Reflect.setPrototypeOf(Inherited, null);

            expect(InjectorUtil.isInheritedFrom(Base, Inherited)).to.be.false;
        });
    });
});

describe('Injector', function () {
    let injector: Injector;

    beforeEach(function () {
        injector = new Injector();
    });

    describe('global', function () {
        it('does not instantiate global upon module loading', function () {
            expect(Injector['_globalInjector'] == null, 'global injector was instantiated already').to.be.true;
        });

        it('returns an instance of the Injector upon first call', function () {
            expect(Injector.global).to.be.an.instanceOf(Injector);
        });

        it('always returns the same global instance', function () {
            expect(Injector.global).to.equal(Injector.global);
        });
    });

    describe('add', function () {
        it('adds to data when registering dependency', function () {
            class Base {}
            class Sub extends Base {}

            injector.addSingleton(Base, Sub);

            const injectorData = getInjectorData(injector);

            expect(injectorData.has(Base), 'Injector data did not add dependency to data').to.be.true;
        });

        it('throws CannotRegisterDependencyException when subclass does not inherit from base class', function () {
            class Base {}
            class Sub {}

            expect(() => injector.addSingleton(Base, Sub)).to.throw(CannotRegisterDependencyException);
        });
    });

    describe('resolve', function () {
        it('Successfully resolves a registered instance', function () {
             class Base {}
             class Sub extends Base {}

             injector.addSingleton(Base, Sub);

             const sub: Base = injector.resolve(Base);

             expect(sub).to.be.an.instanceOf(Base);
             expect(sub).to.be.an.instanceOf(Sub);
        });

        it('Only constructs singletons once', function () {
            class Base {}

            let constructCount: number = 0;

            class Singleton extends Base {
                constructor() {
                    super();
                    constructCount++;
                }
            }

            injector.addSingleton(Base, Singleton);

            for (let i = 0; i < 5; ++i) {
                const instance = injector.resolve(Base);

                expect(instance).to.be.an.instanceOf(Base);
                expect(instance).to.be.an.instanceOf(Singleton);
            }

            expect(constructCount).to.equal(1);
        });

        it('Constructs transient every single time', function () {
            class Base {}

            let constructCount: number = 0;

            class Transient extends Base {
                constructor() {
                    super();
                    constructCount++;
                }
            }

            injector.addTransient(Base, Transient);

            const resolveCount = 5;
            for (let i = 0; i < resolveCount; ++i) {
                const instance = injector.resolve(Base);

                expect(instance).to.be.an.instanceOf(Base);
                expect(instance).to.be.an.instanceOf(Transient);
            }

            expect(constructCount).to.equal(resolveCount);
        });

        it('throws UnresolvableDependencyException when dependency is not registered', function () {
            class Base {}

            expect(() => injector.resolve(Base)).to.throw(UnresolvableDependencyException);
        });

        it('throws UnresolvableDependencyInjection when dependency data is null' , function () {
            class Base {}

            const injectorData = getInjectorData(injector);

            // @ts-ignore - We know null is not a valid type to be setting, but this is the test
            injectorData.set(Base, null);

            expect(() => injector.resolve(Base)).to.throw(UnresolvableDependencyException);
        });

        it('throws UnexpectedStateException when the injector type is unknown', function () {
            class Base {}
            class Sub extends Base {}

            injector.addSingleton(Base, Sub);

            const injectorData = getInjectorData(injector);

            // @ts-ignore - Don't care if it can be null, other tests should have checked for that
            injectorData.get(Base).type = -1;

            expect(() => injector.resolve(Base)).to.throw(UnexpectedStateException);
        });
    });
});