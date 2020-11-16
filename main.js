const electron = require("electron"),
  app = electron.app,
  BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {

  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1920,
    height: 1080,
    icon: __dirname + '/logo.png',
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.openDevTools();
  mainWindow.on("close", () => {
    mainWindow.webContents.send("stop-server");
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);
app.on("browser-window-created", function(e, window) {
  window.setMenu(null);
});

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", function() {
  if (mainWindow === null) {
    createWindow();
  }
});
