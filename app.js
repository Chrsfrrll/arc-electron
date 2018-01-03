const ipc = require('electron').ipcRenderer;
/**
 * Class responsible for initializing the main ARC elements
 * and setup base options.
 * Also serves as a communication bridge etween main process and app window.
 */
class ArcInit {

  constructor() {
    this.created = false;
    this.workspaceScript = undefined;
    this.settingsScript = undefined;
  }

  get app() {
    return document.getElementById('app');
  }

  listen() {
    ipc.on('window-rendered', this.initApp.bind(this));
    ipc.on('set-workspace-file', this.setupWorkspaceFile.bind(this));
    ipc.on('set-settings-file', this.setupSettingsFile.bind(this));
    window.onbeforeunload = this.beforeUnloadWindow.bind(this);
    var updateHandler = this.updateEventHandler.bind(this);
    ipc.on('checking-for-update', updateHandler);
    ipc.on('update-available', updateHandler);
    ipc.on('update-not-available', updateHandler);
    ipc.on('autoupdate-error', updateHandler);
    ipc.on('download-progress', updateHandler);
    ipc.on('update-downloaded', updateHandler);
    ipc.on('command', this.commandHandler.bind(this));
  }

  initApp() {
    var app = document.createElement('arc-electron');
    app.id = 'app';
    this._setupApp(app);
    document.body.appendChild(app);
    this.created = true;
  }

  setupWorkspaceFile(e, message) {
    this.workspaceScript = message;
    if (!this.created) {
      return;
    }
    this.app.workspaceScript = message;
  }

  setupSettingsFile(e, message) {
    this.settingsScript = message;
    if (!this.created) {
      return;
    }
    this.app.settingsScript = message;
  }

  _setupApp(app) {
    if (this.workspaceScript) {
      app.workspaceScript = this.workspaceScript;
    }
    if (this.settingsScript) {
      app.settingsScript = this.settingsScript;
    }
    app.initApplication();
  }
  /**
   * Because window has to be setup from the main process
   * (setting app init values) the window sends reload
   * information to the main process so it can re-set the
   * window after it's reloaded.
   */
  beforeUnloadWindow() {
    ipc.send('window-reloading');
  }

  /**
   * Handles events related to the application auto-update action.
   */
  updateEventHandler(sender, message) {
    var app = this.app;
    app.updateState = message;
    if (message[0] === 'update-available') {
      app.hasAppUpdate = true;
    }
  }

  commandHandler(event, action) {
    var app = this.app;
    switch (action) {
      case 'show-settings': app.openSettings(); break;
      case 'about': app.openAbout(); break;
      case 'open-license': app.openLicense(); break;
      case 'import-data': app.openImport(); break;
      case 'export-data': app.openExport(); break;
      case 'open-saved': app.openSaved(); break;
      case 'open-history': app.openHistory(); break;
      case 'open-drive': app.openDrivePicker(); break;
      case 'find': app.handleFindOpen(); break;
      case 'open-messages': app.openInfoCenter(); break;
      case 'login-external-webservice': app.openWebUrl(); break;
      case 'open-cookie-manager': app.openCookieManager(); break;
      case 'open-hosts-editor': app.openHostRules(); break;
    }
  }
}

const initScript = new ArcInit();
initScript.listen();
