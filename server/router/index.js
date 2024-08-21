
class Routes {
    constructor(app) {
      this.app = app;
    }
  
    routesConfig() {
      this.app.use(require("../router/auth"));
      this.app.use(require("../router/postAuth"));
      this.app.use(require("../router/message"));
    }
  }
  
  module.exports = Routes;
  