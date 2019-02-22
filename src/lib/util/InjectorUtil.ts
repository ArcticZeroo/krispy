import Class from '../models/Class';

export default abstract class InjectorUtil {
    public static isInheritedFrom<TBase>(base: Function, inherited: Class<TBase>): boolean {
        let proto = Object.getPrototypeOf(inherited);

        while (proto && proto !== Function.prototype) {
            if (proto === base) {
                return true;
            }

            proto = Object.getPrototypeOf(proto);
        }

        return false;
    }
}