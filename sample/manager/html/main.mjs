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

		import onvifmixin from './onvifm.mjs';

		window.vm = new Vue({
			store,
			router,
			mixins: [onvifmixin],
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
					resultmembers: [{
						count: 1,
						name: 'Test Test',
						data: {
							gender: 'male'
						},
						t: new Date().valueOf()
					}],
					callapi: false,
					ipaddr: '192.168.4.40',
					device_connect: false,
					base64img: '',
					accessdoor: 'ประตู่ 1',
					count: 1,
					isdebug: false,
				}
			},
			el: '#app',
			methods: {
				updateallapi() {
					window.callapi = this.callapi;
				},
				showlog(msg) {
					if (this.isdebug) {
						console.log(...arguments);
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
					this.init();
					this.test();
				},
				test() {
					this.img = document.getElementById('imgx');
					this.imgx = document.getElementById('img');
					this.canvas = document.createElement('canvas');
					//this.canvas.width = this.img.width;
					//this.canvas.height = this.img.height;
					this.ctx = this.canvas.getContext('2d');
					this.showimg = false;
					this.interval = setInterval(() => {
						if (this.checkface && this.device_connected) {
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
				async train() {
					await this.fetchSnapshot();
					// await this.getData();
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
							// data.member = rs.data[0];
							// this.drawbox(data);
						}
					}).catch(err => console.error(err))

				},
				updatemember(member) {
					console.log('------xxxxxx update----member- xxxxxxxx----', member);
					if (member.name) {
						let m = this.members.find(m => m.name == member.name);
						if (m) {
							console.log('------update----member-----', m);
							m.updatetime();
							console.log('---members---', this.members);
						} else {
							member.access = this.accessdoor;
							let a = new Member(member);
							console.log('-----add---new member---', a);
							this.members.push(a)
						}
					} else {
						console.log('-----unknown---name---');
					}
				},
				updatedata(data) {
					if (this.resultmembers.length > 35) {
						this.resultmembers.pop();
					}
					this.count++;
					let obj = {
						count: this.count,
						data: data,
						t: new Date().valueOf(),
						name: data.name ? data.name : 'Unkonwn'
					}
					this.resultmembers.unshift(obj);
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
				console.log('----vue is mounted----');
				window.ars = this.members;
				window.callapi = this.callapi;
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