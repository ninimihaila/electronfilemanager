const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

let mainWindow, backgroundWindow;

function createWindow() {
  backgroundWindow = new BrowserWindow({ "show": false })
  backgroundWindow.loadURL('file://' + __dirname + '/background.html')
  backgroundWindow.on('closed', () => {
    console.log('background window closed')
    backgroundWindow = null
  });

  mainWindow = new BrowserWindow({
    width: 800, height: 600,
    titleBarStyle: 'hidden',
    // webPreferences: {
    //   nodeIntegration: false
    // },
    /* frame: false */
})
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  // uncomment this line in order to open DevTools
  // mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => {
    mainWindow = null;
    backgroundWindow.close()
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
