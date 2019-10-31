export default {
  data() {
    return {
      ws: null,
      user: "admin",
      pass: "123456789",
      selected_address: "192.168.4.40",
      device_connected: false,
    };
  },
  methods: {
    init() {
      this.initWebSocketConnection();
    },

    initWebSocketConnection() {
      this.ws = new WebSocket("ws://" + document.location.host);
      this.ws.onopen = () => {
        this.sendRequest("startDiscovery");
      };

      this.ws.onclose = event => {
        this.showlog("----ws--onclose-----");
        this.wsclose(event);
      };

      this.ws.onerror = error => {
        this.showlog("----ws--onerror----");
        this.showMessageModal("Error", "Failed to establish a WebSocket connection. Check if the server.js is running.");
      };
      this.ws.onmessage = res => {
        var data = JSON.parse(res.data);
        var id = data.id;
        this.showlog("----ws--onmessage---", id);
        if (id === "startDiscovery") {
          this.startDiscoveryCallback(data);
        } else if (id === "connect") {
          this.device_connected = true;
          this.connectCallback(data);
        } else if (id === "fetchSnapshot") {
          this.fetchSnapshotCallback(data);
        } else if (id === "ptzMove") {
          this.ptzMoveCallback(data);
        } else if (id === "ptzStop") {
          this.ptzStopCallback(data);
        } else if (id === "ptzHome") {
          this.ptzHomeCallback(data);
        }
      };
    },

    connect() {
      this.showlog('----connect--click---');
      this.pressedConnectButton();
    },

    sendRequest(method, params) {
      this.showlog("---sendRequest---", method, params);
      if (this.ws) {
        this.ws.send(
          JSON.stringify({
            method: method,
            params: params
          })
        );
      }
    },

    startDiscoveryCallback(data) {
      var devices = data.result;
      this.showlog('------------startDiscoveryCallback------------', devices);
    },

    showMessageModal(title, message) {
      alert(message);
    },

    connectCallback(data) {
      this.showlog("----connectCallback--data->");
      this.fetchSnapshot();
    },

    showConnectedDeviceInfo(address, data) {
      this.showlog("----showConnectedDeviceInfo----");
      this.fetchSnapshot();
    },

    fetchSnapshot() {
      this.showlog("-----fetchSnapshot----", this.selected_address);
      let device = {
        address: this.selected_address,
        user: this.user,
        pass: this.pass
      }
      this.sendRequest("fetchSnapshot", device);
    },

    fetchSnapshotCallback(data) {
      this.showlog("----fetchSnapshotCallback---");
      if (data.result) {
        this.base64img = data.result;
        window.setTimeout(() => {
          this.showlog('----set--time---out-----', this.device_connected);
          this.adjustSize();
          if (this.device_connected === true) {
            this.fetchSnapshot();
          }
        }, 100);
      } else if (data.error) {
        this.showlog('----data error------', data.error);
        this.wsclose(null);
      }
    },

    adjustSize() {
      // var div_dom_el = this.el["div_pnl"].get(0);
      // var rect = div_dom_el.getBoundingClientRect();
      // var x = rect.left + window.pageXOffset;
      // var y = rect.top + window.pageYOffset;
      // var w = rect.width;
      // var h = window.innerHeight - y - 10;
      // div_dom_el.style.height = h + "px";
      // var aspect_ratio = w / h;
      // var snapshot_aspect_ratio = this.snapshot_w / this.snapshot_h;
      // var img_dom_el = this.el["img_snp"].get(0);
      // if (snapshot_aspect_ratio > aspect_ratio) {
      //   img_w = w;
      //   img_h = w / snapshot_aspect_ratio;
      //   img_dom_el.style.width = img_w + "px";
      //   img_dom_el.style.height = img_h + "px";
      //   img_dom_el.style.left = "0px";
      //   img_dom_el.style.top = (h - img_h) / 2 + "px";
      // } else {
      //   img_h = h;
      //   img_w = h * snapshot_aspect_ratio;
      //   img_dom_el.style.height = img_h + "px";
      //   img_dom_el.style.width = img_w + "px";
      //   img_dom_el.style.left = (w - img_w) / 2 + "px";
      //   img_dom_el.style.top = "0px";
      // }
    },

    wsclose(event) {
      this.showlog("---------------connection closed.--------");
      this.connectDevice();
    },

    pressedConnectButton(event) {
      if (this.device_connected === true) {
        this.disconnectDevice();
      } else {
        this.connectDevice();
      }
    },

    connectDevice() {
      let device = {
        address: this.selected_address,
        user: this.user,
        pass: this.pass
      }
      this.showlog('----connect to device--->', device);
      this.sendRequest("connect", device);
    },

    disconnectDevice() {
      console.log('----disconnect---device-----');
      this.device_connected = false;
    },
    close() {
      this.ws.close();
    }
  }
};