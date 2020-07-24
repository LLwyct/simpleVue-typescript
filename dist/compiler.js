import Watcher from './watcher.js';
export default class Compiler {
    constructor(el, vm) {
        this.$el = document.querySelector(el);
        this.initUpdaters();
        this.initCompileUtil();
        if (this.$el) {
            this.$vm = vm;
            this.$fragment = this.node2Fragment(this.$el);
            this.compileHTML(this.$fragment);
            this.$el.appendChild(this.$fragment);
        }
    }
    node2Fragment(node) {
        let fragment = document.createDocumentFragment();
        let child;
        while (child = node.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    }
    /**
     * 1、childNodes：获取节点，不同浏览器表现不同；

          IE：只获取元素节点；

          非IE：获取元素节点与文本节点；

          解决方案：if(childNode.nodeName=="#text") continue 或者 if(childNode.nodeType != '3') continue

        2、children：获取元素节点，浏览器表现相同。

          因此建议使用children。

        3、firstChild与firstElementChild

          相同点：获取父节点下的第一个节点对象；

          不同点：1、firstchild：IE6,7,8：第一个元素节点；

                       非IE6,7,8：第一个节点，文本节点或者元素节点；

      2、firstElementChild：IE6,7,8：不支持；

                  非IE6,7,8：第一个元素节点；
     *
     */
    compileHTML(vNode) {
        let exp = ''; // 表达式
        let dir = ''; // 指令
        const reg = /\{\{(.*)\}\}/;
        vNode.childNodes.forEach((node) => {
            if (this.isElementNode(node)) {
                /**
                 * 有很多数据类型是'类数组'类型，不具备forEach的迭代功能，需要用Array.from
                 * 来转换一下，在es5中可以使用[].slice.call(node.attributes)实现
                 */
                Array.from(node.attributes).forEach(attr => {
                    exp = attr.value;
                    dir = attr.name;
                    if (this.isDirective(dir)) {
                        if (this.isEventDirective(dir)) {
                            this.eventHandler(node, dir.substring(5), exp);
                        }
                        else if (this.isNormalDirective()) {
                            dir = dir.substring(2);
                            this.$compileUtil[dir] && this.$compileUtil[dir](node, exp);
                        }
                    }
                    node.removeAttribute(dir);
                });
            }
            else if (this.isTextNode(node) && reg.test(node.textContent)) {
                this.compileText(node, RegExp.$1.trim());
            }
            if (node.hasChildNodes()) {
                this.compileHTML(node);
            }
        });
    }
    compileText(node, exp) {
        this.$compileUtil.text(node, exp);
    }
    /**
     *
     * @param node 待绑定事件的节点
     * @param eventType 事件类型，e.g. click
     * @param methodName 函数名
     */
    eventHandler(node, eventType, methodName) {
        // 从vm中拿取同名的函数，并为node创建一个事件监听，并把执行的回调函数绑定到vm.data上
        const callback = this.$vm.$methods && this.$vm.$methods[methodName];
        callback && node.addEventListener(eventType, callback.bind(this.$vm.$data));
    }
    getDeepValue(exp) {
        let data = this.$vm.$data;
        exp.split(".").forEach(key => {
            data = data[key];
        });
        return data;
    }
    setDeepValue(exp, newValue) {
        let data = this.$vm.$data;
        const exps = exp.split(".");
        exps.forEach((key, i) => {
            if (i < exps.length - 1) {
                data = data[key];
            }
            else {
                data[key] = newValue;
            }
        });
    }
    initCompileUtil() {
        const that = this;
        this.$compileUtil = {
            model(node, exp) {
                that.bindWatcherAndDep(node, exp, "model");
                let value = that.getDeepValue(exp);
                node.addEventListener("input", (e) => {
                    if (value === e.target.value) {
                        return;
                    }
                    else {
                        that.setDeepValue(exp, e.target.value);
                    }
                });
            },
            text(node, exp) {
                that.bindWatcherAndDep(node, exp, "text");
            }
        };
    }
    initUpdaters() {
        this.Updaters = {
            modelUpdater(node, value) {
                node.value = value;
            },
            textUpdater(node, value) {
                node.textContent = value;
            }
        };
    }
    /**
     * 把watcher绑定到对应的dep上
     * @param node 当数据改变时，watcher发布更新，该数据对应所要更新的HTML节点
     * @param exp 更新的数据的表达式，例如number.big
     * @param dir substring后指令名，例如model，text
     */
    bindWatcherAndDep(node, exp, dir) {
        let updateFn = this.Updaters[dir + "Updater"];
        // 初始化model层 -> View层的数据
        updateFn && updateFn(node, this.getDeepValue(exp));
        new Watcher(this.$vm, exp, (value) => {
            updateFn && updateFn(node, value);
        });
    }
    // 是否是元素节点
    isElementNode(n) {
        if (n.nodeType === 1)
            return true;
        else
            return false;
    }
    isTextNode(n) {
        if (n.nodeType === 3)
            return true;
        else
            return false;
    }
    // 是否是指令
    isDirective(dir) {
        if (dir.indexOf('v-') === 0) {
            return true;
        }
        else
            return false;
    }
    isNormalDirective(dir) {
        return true;
    }
    // 是否是事件指令
    isEventDirective(dir) {
        return dir.indexOf('v-on:') === 0;
    }
}
