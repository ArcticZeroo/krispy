import InjectionType from '../enum/InjectorType';
import Class from './Class';

export default interface ClassInjectable<T> {
    create: Class<T>;
    type: InjectionType;
    instance?: T;
}
