import InjectionType from './enum/InjectorType';
import Class from './models/Class';
import ClassInjectable from './models/ClassInjectable';
import UnresolvableDependencyException from './exception/UnresolvableDependencyException';
import CannotRegisterDependencyException from './exception/CannotRegisterDependencyException';
import UnexpectedStateException from './exception/UnexpectedStateException';
import InjectorUtil from './util/InjectorUtil';

export default class Injector {
    private static _globalInjector: Injector;
    private readonly _items: Map<symbol, ClassInjectable<any>>;

    public static get global(): Injector {
        if (!Injector._globalInjector) {
            Injector._globalInjector = new Injector();
        }

        return Injector._globalInjector;
    }

    constructor() {
        this._items = new Map<symbol, ClassInjectable<any>>();
    }

    public add<TBase, TInherited extends TBase>(base: Function, inherited: Class<TInherited>, type: InjectionType): void {
        if (!InjectorUtil.isInheritedFrom(base, inherited)) {
            throw new CannotRegisterDependencyException(`Class ${inherited.name} does not inherit from ${base.name}`);
        }

        this._items.set(InjectorUtil.getSymbol(base), { create: inherited, type });
    }

    public addTransient<TBase, TInherited extends TBase>(base: Function, inherited: Class<TInherited>): void {

        this.add(base, inherited, InjectionType.transient);
    }

    public addSingleton<TBase, TInherited extends TBase>(base: Function, inherited: Class<TInherited>): void {
        this.add(base, inherited, InjectionType.singleton);
    }

    public resolve<T>(base: Function): T {
        const identifier = InjectorUtil.getSymbol(base);

        if (!this._items.has(identifier)) {
            throw new UnresolvableDependencyException(`Dependency ${base.name} is not registered`);
        }

        const item: ClassInjectable<T> | undefined = this._items.get(identifier);

        if (item == null) {
            throw new UnresolvableDependencyException(`Registered dependency ${base.name} is null`);
        }

        if (item.type === InjectionType.transient) {
            return new item.create();
        }

        if (item.type === InjectionType.singleton) {
            if (item.instance) {
                return item.instance;
            }

            const instance: T = new item.create();

            item.instance = instance;

            return instance;
        }

        throw new UnexpectedStateException(`Unexpected State: Injection type was ${item.type}`);
    }
}
