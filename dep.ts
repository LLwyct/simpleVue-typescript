let guid = 0;

export default class Dep {
    static target: any = null;
    subs: Array<any>;
    uid: number;
    constructor() {
        this.subs = [];
        this.uid = guid ++;
    }

    addSub(sub) {
        this.subs.push(sub);
    }

    depend () {
        Dep.target.addDep(this);
    }

    notify() {
        this.subs.forEach(sub => {
            sub.update();
        })
    }
}

Dep.target = null;

