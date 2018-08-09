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
      // go(path.dirname(process.cwd()))
      ls(process.cwd())
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

async function ls(location) {
  const response = await fetch(`http://localhost:9999/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({location: location})
  })
  const details = await response.json()
  return details
}

async function go(currentPath, vueApp) {
  const details = await ls(currentPath)
  console.log(currentPath)
  console.log(details)
  let appInstance = vueApp || app

  appInstance.fileContent = details.fileContent
  appInstance.image = details.image
  if (details.isDir) {
    appInstance.location = currentPath
    appInstance.files = details.files
  }
}
