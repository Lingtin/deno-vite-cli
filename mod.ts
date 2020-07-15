#!/usr/bin/env deno
import { Select, Input } from 'https://deno.land/x/cliffy/prompt.ts';
import { download } from "https://deno.land/x/download/mod.ts";

const createDir:string = await Input.prompt( `Create template name?` );
const templateType: string = await Select.prompt( {
    message: `Select the type of template created？`,
    options: [
        { name: 'vue', value: 'template-vue/'},
        { name: 'react', value: 'template-react/' },
        { name: 'react-ts', value: 'template-react-ts/' },
        { name: 'reason-react', value: 'template-reason-react/' }
    ]
});

export class Init{ 
    createDir='';
    Rooturl = 'https://sourcegraph.com/github.com/vitejs/create-vite-app@master/-/raw/'
    downurl = 'https://raw.githubusercontent.com/vitejs/create-vite-app/master/template-vue/'
    constructor (templateType:string, createDir:string) {
        this.Rooturl = this.Rooturl+templateType
        this.createDir = createDir
    }

    async init() {
        if (!(await this.isDir('./',this.createDir))) {
            await Deno.mkdir(`./${this.createDir}`)
        }
        let startTime= new Date().getTime()
        await this.createDown()
        let endTime= new Date().getTime()-startTime
        console.log(`Time:`+endTime/1000+'s');
        console.log('✅ Successfully installed vite!');
    }

    async readDir(afurl:string="") { 
        const res = await fetch(this.Rooturl+afurl) // 读取目标路径
        const text = await res.text() // 文件读取
        const dir = text.split('\n')  // 获取目录
        return {dir, readurl:afurl}
    }

    async createDown(url: string = '') {
        return new Promise(async (resolve) => {
            const { dir, readurl } = await this.readDir(url)
            for (let key of dir) { 
                if (/\/$/.test(key)) {
                    await this.createDown(readurl+key)
                } else { 
                    await this.downinit(key,readurl)
                }
            } 
            resolve()
        })
    }

    async downinit(name: string, url = '') {
        return new Promise(async (resolve) => { 
            if (url && !(await this.isDir(`./${ this.createDir }/${ url }`, name))) {
                try{await Deno.mkdir(`./${ this.createDir}/${url}`) }catch(err){}
            }
            const destination = {
                dir:`./${this.createDir}/${url}`
            }
            console.log(`download ${ name }..`);
            try { 
                await download(this.downurl + url + name, destination);
            } catch (err) { 
                // console.log(`download error ${ this.Rooturl + url + name }..`);
            }
            if (name === '_gitignore') {
                try {await Deno.rename(`${this.createDir}/_gitignore`, `${this.createDir}/.gitignore`);} catch (error) {}
            }
            resolve()
        })
        
    }

    async isDir(dir:string,filename:string) { 
        let flag = false
        try {
            for await (const dirEntry of Deno.readDir(`./${ dir }`)) {
                if(dirEntry.name === filename) flag=true
            }
        } finally{
            return flag
        }
    }
}

const start = new Init(templateType, createDir)
await start.init()