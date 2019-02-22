import InjectionType from './enum/InjectorType';
import Class from './models/Class';
import ClassInjectable from './models/ClassInjectable';
import UnresolvableDependencyException from './exception/UnresolvableDependencyException';
import CannotRegisterDependencyException from './exception/CannotRegisterDependencyException';
import UnexpectedStateException from './exception/UnexpectedStateException';
import InjectorUtil from './util/InjectorUtil';

export default class Injector {
    private static _globalInjector: Injector;
    private readonly _items: WeakMap<any, ClassInjectable<any>>;

    public static get global(): Injector {
        if (!Injector._globalInjector) {
            Injector._globalInjector = new Injector();
        }

        return Injector._globalInjector;
    }

    constructor() {
        this._items = new WeakMap<any, ClassInjectable<any>>();
    }

    public add<TBase>(base: TBase, inherited: Class<TBase>, type: InjectionType): void {
        if (!InjectorUtil.isInheritedFrom(base, inherited)) {
            throw new CannotRegisterDependencyException(`Class ${inherited} does not inherit from ${base}`);
        }

        this._items.set(base, { create: inherited, type });
    }

    public addTransient<TBase>(base: TBase, inherited: Class<TBase>): void {

        this.add(base, inherited, InjectionType.transient);
    }

    public addSingleton<TBase>(base: TBase, inherited: Class<TBase>): void {
        this.add(base, inherited, InjectionType.singleton);
    }

    public resolve<T>(base: T): T {
        if (!this._items.has(base)) {
            throw new UnresolvableDependencyException(`Dependency ${base} is not registered`);
        }

        const item: ClassInjectable<T> | undefined = this._items.get(base);

        if (item == null) {
            throw new UnresolvableDependencyException(`Registered dependency ${base} is null`);
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
