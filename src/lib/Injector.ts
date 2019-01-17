import Collection from '@arcticzeroo/collection/dist';
import InjectionType from './enum/InjectorType';
import Class from './models/Class';
import ClassInjectable from './models/ClassInjectable';

export default class Injector {
    private static _globalInjector: Injector;
    private readonly _items: Collection<symbol, ClassInjectable<any>>;

    public static get global(): Injector {
        if (!Injector._globalInjector) {
            Injector._globalInjector = new Injector();
        }

        return Injector._globalInjector;
    }

    private static getSymbol<T>(item: Class<T>): symbol {
        return Symbol.for(item.name);
    }

    constructor() {
        this._items = new Collection<symbol, ClassInjectable<any>>();
    }

    private throwUnresolvable(message) {

    }

    public add<TBase, TInherited extends TBase>(base: Class<TBase>, inherited: Class<TInherited>, type: InjectionType): void {
        this._items.set(Injector.getSymbol(base), { create: inherited, type });
    }

    public addTransient<TBase, TInherited extends TBase>(base: Class<TBase>, inherited: Class<TInherited>): void {
        this.add(base, inherited, InjectionType.transient);
    }

    public addSingleton<TBase, TInherited extends TBase>(base: Class<TBase>, inherited: Class<TInherited>): void {
        this.add(base, inherited, InjectionType.singleton);
    }

    public resolve<T>(base: Class<T>): T | null {
        const identifier = Injector.getSymbol(base);

        if (!this._items.has(identifier)) {
            return null;
        }

        const item: ClassInjectable<T> | undefined = this._items.get(identifier);

        if (item == null) {
            return null;
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

        throw new TypeError(`Unexpected State: Injection type was ${item.type}`);
    }
}
