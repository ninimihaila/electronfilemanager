const path = require('path')
const util = require('util')
const fs = require('fs')

const lstat = util.promisify(fs.lstat)
const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)

Vue.component('listing', {
  props: ['item'],
  template: `<span @click="clicked(item.name)"><span class="icon" v-bind:class="item.class"></span>{{ item.name }}</span>`,
  methods: {
    clicked(name) {
      go(path.format({ dir: app.location, base: name }))
    }
  }
})

const app = new Vue({
  el: '#app',
  data: {
    location: process.cwd(),
    files: [],
    tmpFiles: [],
    image: null,
    fileContent: null,
    filter: ''
  },
  methods: {
    up() {
      go(path.dirname(this.location))
    },
    home() {
      go(path.dirname(process.cwd()))
    }
  },
  computed: {
    filteredFiles : function(){
      if(this.filter == ''){
        return this.files;
      }
      return this.files.filter(file => file.name.indexOf(this.filter) >= 0);
    }
  },
  mounted() {
    go(path.dirname(process.cwd()), this)
  }
})

async function go(currentPath, vueApp) {
  let appInstance = vueApp || app;
  if (['bmp', 'png', 'gif', 'jpg'].some(ext => currentPath.endsWith(`.${ext}`))) {
    appInstance.image = 'file://' + currentPath
    appInstance.fileContent = null
  } else {
    appInstance.image = null
    appInstance.fileContent = null

    try {
      const stat = await lstat(currentPath)

      if (stat.isDirectory()) {
        appInstance.location = currentPath
        appInstance.files = []

        const files = await readdir(appInstance.location)
        for (let i = 0; i < files.length; i++) {
          const fstat = await lstat(`${currentPath}/${files[i]}`)
          appInstance.files.push({ id: i, name: files[i], class: fstat.isDirectory() ? 'icon-folder' : 'icon-doc' })
        }
      } else if (['txt', 'html', 'js', 'py'].some(ext => currentPath.endsWith(`.${ext}`))) {
        appInstance.fileContent = await readFile(currentPath, 'utf8')
      } else {
        appInstance.fileContent = null
      }
    } catch (e) {
      console.log(e)
    }
  }
}
