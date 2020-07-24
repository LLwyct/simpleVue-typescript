import Dep from './dep.js';
import Compiler from './compiler.js';
export default class Vue {
    constructor(options = {}) {
        this.$dps = [];
        this.$options = options;
        this.$el = options.el;
        this.$data = options.data;
        this.$methods = options.methods;
        this.observe(this.$data);
        new Compiler(this.$el, this);
    }
    observe(data) {
        if (!data || typeof data !== "object") {
            return;
        }
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key]);
        });
    }
    defineReactive(data, key, value) {
        this.observe(value);
        let dep = new Dep();
        this.$dps.push(dep);
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get() {
                // 由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除
                if (Dep.target)
                    // dep.addSub(Dep.target);
                    dep.depend();
                /**
                 * dep.depend();
                 * 两种写法一致
                 */
                return value;
            },
            set(newVal) {
                // console.log(`change ${value}`);
                if (newVal !== value) {
                    value = newVal;
                    // 通知订阅者
                    console.log(data, key, newVal);
                    dep.notify();
                }
            }
        });
    }
}
