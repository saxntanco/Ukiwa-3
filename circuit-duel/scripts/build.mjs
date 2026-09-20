import {existsSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const tsc=existsSync('node_modules/typescript/bin/tsc')?'node_modules/typescript/bin/tsc':'vendor/package/bin/tsc';
const check=process.argv.includes('--check');
if(!check)rmSync('dist',{recursive:true,force:true});
const p=spawnSync(process.execPath,[tsc,'-p','tsconfig.json',...(check?['--noEmit']:[])],{stdio:'inherit'});if(p.status!==0)process.exit(p.status??1);
if(!check){mkdirSync('dist',{recursive:true});for(const f of ['index.html','style.css'])copyFileSync('src/'+f,'dist/'+f);console.log('Built dist — no runtime dependencies.');}
