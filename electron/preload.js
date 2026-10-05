const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: (options) => ipcRenderer.invoke('app:selectFile', options),
  saveFile: (options) => ipcRenderer.invoke('app:saveFile', options),
  isDesktop: true,
});
