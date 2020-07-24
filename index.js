import Vue from "./myVue.js";

window.myapp = new Vue({
    el: "#app",
    data: {
        number: {
            big: 999
        },
    },
    methods: {
        increment () {
            this.number.big ++;
        },
    }
});
