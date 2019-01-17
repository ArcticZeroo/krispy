import Injector from '..';

interface IBase {

}

class IBaseClass extends IBase {

}

class TestClass {
    private base: IBase = Injector.global.resolve(IBaseClass);
}