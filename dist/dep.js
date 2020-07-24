let guid = 0;
export default class Dep {
    constructor() {
        this.subs = [];
        this.uid = guid++;
    }
    addSub(sub) {
        this.subs.push(sub);
    }
    depend() {
        Dep.target.addDep(this);
    }
    notify() {
        this.subs.forEach(sub => {
            sub.update();
        });
    }
}
Dep.target = null;
Dep.target = null;
