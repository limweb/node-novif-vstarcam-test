		import aaa from './onvifm.mjs';
		console.log('aaa===>', aaa);
		import Vue from 'https://unpkg.com/vue@2.6.10/dist/vue.esm.browser.min.js';
		import VueRouter from 'https://unpkg.com/vue-router@3.1.3/dist/vue-router.esm.browser.min.js';

		Vue.use(VueRouter);
		let routes = [];
		const router = new VueRouter({
		    mode: 'history',
		    routes
		});

		import Vuex from 'https://unpkg.com/vuex@3.1.1/dist/vuex.esm.browser.min.js';
		Vue.use(Vuex);
		const store = new Vuex.Store({
		    namespaced: true,
		    state: {},
		    mutations: {},
		    actions: {},
		    getters: {},

		});

		window.vm = new Vue({
		    store,
		    router,
		    mixins: [],
		    data() {
		        return {
		            msg: 'Hello world',
		            img: '',
		            imgx: '',
		            canvas: '',
		            ctx: '',
		            data: '',
		            interval: '',
		            showimg: true,
		            showptz: false,
		            showzoom: false,
		            checkface: false,
		            imglog: false,
		            members: [],
		            resultmembers: [],
		            callapi: false,
		            ipaddr: '192.168.4.40',
		            device_connect: false,
		            onvif: '',
		        }
		    },
		    el: '#app',
		    methods: {
		        connect() {
		            if (this.device_connect) {

		            } else {
		                this.onvif = new Onvif(this.ipaddr);
		                this.device_connect = this.onvif.device_connected;
		                console.log('----connect--click---');
		            }
		        },
		        logimg(data) {
		            if (this.imglog) {
		                console.log("%c ", "background-image: url('" + data + "'); background-repeat: no-repeat; background-size: 150px 50px; font-size: 100px");
		            }
		        },
		        loadmodels() {
		            Promise.all([
		                faceapi.loadTinyFaceDetectorModel('/models'),
		                faceapi.loadFaceLandmarkTinyModel('/models'),
		                faceapi.loadFaceRecognitionModel('/models'),
		                faceapi.nets.ageGenderNet.loadFromUri('/models')
		            ]).then(this.vdoplay)
		        },
		        vdoplay() {
		            console.log('-----vdoplay----------');
		            this.test();
		        },
		        test() {
		            this.img = document.getElementById('img');
		            this.imgx = document.getElementById('imgx');
		            this.canvas = document.createElement('canvas');
		            //this.canvas.width = this.img.width;
		            //this.canvas.height = this.img.height;
		            this.ctx = this.canvas.getContext('2d');
		            this.showimg = false;
		            this.interval = setInterval(() => {
		                if (this.checkface) {
		                    this.train();
		                }
		            }, 1000)
		        },
		        getData() {
		            this.ctx.drawImage(this.img, 0, 0);
		            this.data = this.canvas.toDataURL();
		            this.logimg(this.data);
		            this.imgx.src = this.data;
		            //console.log('--data---', this.data);
		        },
		        train() {
		            this.getData();
		            let inputSize = 512;
		            let scoreThreshold = 0.5;
		            let OPTION = new faceapi.TinyFaceDetectorOptions({
		                inputSize,
		                scoreThreshold
		            });
		            let useTinyModel = true;
		            this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
		            if (this.canvas.width > 0 && this.canvas.height) {
		                faceapi.detectAllFaces(this.img, OPTION)
		                    .withFaceLandmarks(useTinyModel)
		                    .withAgeAndGender()
		                    .withFaceDescriptors().then(detections => {
		                        console.log('-------Interval----', detections);
		                        const displaySize = {
		                            width: this.img.width,
		                            height: this.img.height
		                        }
		                        const resizedDetections = faceapi.resizeResults(detections, displaySize);
		                        detections.map(member => {
		                            this.testface(member);
		                        });

		                    });
		            }
		        },
		        testface(data) {
		            let url = 'https://face.eventpass.co/api/testface';
		            axios.post(url, {
		                gender: data.gender,
		                queryFace: data.descriptor
		            }).then(rs => {
		                console.log('-----api--retuen----', rs);
		                if (rs.data.length > 0) {
		                    this.updatedata(rs.data[0]);
		                    this.updatemember(rs.data[0]);
		                    data.member = rs.data[0];
		                    this.drawbox(data);
		                }
		            }).catch(err => console.error(err))

		        },
		    },
		    computed: {},
		    watch: {},
		    components: {},
		    // render : h => h(App),
		    beforeCreate() {
		        /* console.log('beforeCreate'); */
		    },
		    created() {
		        /* console.log('created'); */
		    },
		    beforeMount() {
		        /* console.log('beforeMount'); */
		    },
		    mounted() {
		        /* console.log('mounted'); */
		        this.loadmodels();

		    },
		    beforeUpdate() {
		        /* console.log('beforeUpdate'); */
		    },
		    updated() {
		        /* console.log('updated'); */
		    },
		    beforeDestroy() {
		        /* console.log('beforeDestroy'); */
		    },
		    destroyed() {
		        /* console.log('destroyed'); */
		    },
		})

		class Member {

		    constructor(member) {
		        this.created_at = new Date().valueOf();
		        this.updated_at = this.created_at;
		        this.member = member;
		        this.name = member.name;
		        console.log('---test---', this.created_at);
		        this.interval = setInterval(this.chktime.bind(this), 5000);
		    }

		    chktime() {
		        let a = new Date().valueOf();
		        console.log("---test--interval----", (+a - this.created_at));
		        if ((+a - this.updated_at) > 15000) {
		            this.savemember();
		        }
		    }
		    updatetime() {
		        this.updated_at = new Date().valueOf();
		    }

		    savemember() {
				console.log('----save--member---to---db----');
		        this.member.created_at = this.created_at;
		        this.member.updated_at = this.updated_at;
		        let url = "http://localhost/api/addmemassets";
		        // axios.post(url, JSON.stringify(this.member)).then(rs => {
		        //     console.log('---rs---add addmemassets---', rs);
		        //     this.destroy();
		        // }).catch(console.error);
		    }

		    destroy() {
		        clearInterval(this.interval);
		        let index = ars.indexOf(this);
		        ars.splice(index, 1);
		        console.log('----end----');
		    }
		}