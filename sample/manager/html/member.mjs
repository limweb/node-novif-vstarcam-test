export default {
    data: {

    },
    methods: {
        addmember(member) {
            this.created_at = new Date().valueOf();
            this.updated_at = this.created_at;
            this.member = member;
            this.name = member.name;
            console.log('---test---', this.created_at);
            this.interval = setInterval(this.chktime.bind(this), 5000);
        },

        chktime() {
            let a = new Date().valueOf();
            console.log("---test--interval----", (+a - this.created_at));
            if ((+a - this.updated_at) > 15000) {
                this.savemember();
            }
        },
        updatetime() {
            this.updated_at = new Date().valueOf();
        },

        savemember() {
            this.member.created_at = this.created_at;
            this.member.updated_at = this.updated_at;
            let url = "http://localhost/api/addmemassets";
            axios.post(url, JSON.stringify(this.member)).then(rs => {
                console.log('---rs---add addmemassets---', rs);
                this.destroymember();
            }).catch(console.error);
        },

        destroymember() {
            clearInterval(this.interval);
            let index = ars.indexOf(this);
            ars.splice(index, 1);
            console.log('----end----');
        },
    }
}