import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync,spawn} from 'node:child_process';
const root=resolve(import.meta.dirname,'../../..'),out=resolve(root,'docs/portfolio-assets');
const commit='594946947787a072082f193b0549b9942b05cba3';
// Fail closed if any recorded runtime file differs from the published main commit.
const files=['manifest.json','tools/brand-preview.mjs','docs/brand/desk/index.html','docs/brand/desk/form.html','docs/brand/desk/bridge.js','shared/schema.js','content/content.js','content/content.css','sidepanel/sidepanel.html','sidepanel/sidepanel.js','sidepanel/sidepanel.css','profile/profile.html','profile/profile.js','profile/profile.css','profile/resume-parser.js'];
const hashes={};for(const f of files){const expected=execFileSync('git',['show',`${commit}:${f}`],{cwd:root});const actual=await fs.readFile(resolve(root,f));const normalize=b=>b.toString().replace(/\r\n/g,'\n');if(normalize(expected)!==normalize(actual))throw Error('Source differs from pinned commit: '+f);hashes[f]=createHash('sha256').update(expected).digest('hex');}
const server=spawn(process.execPath,['tools/brand-preview.mjs','4199'],{cwd:root,stdio:'pipe'});
await new Promise((yes,no)=>{server.stdout.once('data',yes);server.once('error',no);server.once('exit',code=>no(Error('Server exited '+code)))});
let browser;
try{
browser=await chromium.launch({headless:true,channel:'msedge',args:['--allow-file-access-from-files']});
const page=await browser.newPage({viewport:{width:1360,height:1000},deviceScaleFactor:2});
await page.goto('http://127.0.0.1:4199/');
const panel=page.frameLocator('#panel');await panel.locator('#fillButton').waitFor();
await page.evaluate(()=>{__materialEvidence.memory.profile.basic.nameZh='示例同学';__materialEvidence.memory.profile.basic.phone='00000000000';__materialEvidence.memory.profile.basic.email='demo@example.invalid';__materialEvidence.memory.profile.education[0].school='示例大学'});
await panel.locator('#rescanButton').click();await page.waitForTimeout(1200);await panel.locator('#fillButton').click();
await panel.locator('#primaryMetricLabel').filter({hasText:'已填写字段'}).waitFor({timeout:60000});
await page.waitForFunction(()=>__materialEvidence.events.some(e=>e.type==='APPLYFLOW_FILL' && e.result),{},{timeout:60000});
const result=await page.evaluate(()=>({events:__materialEvidence.events,profile:__materialEvidence.memory.profile,stats:__materialEvidence.memory.usageStats,values:[...document.querySelector('#form').contentDocument.querySelectorAll('input,select')].map(e=>({name:e.name,value:e.value})),submitDisabled:document.querySelector('#form').contentDocument.querySelector('[type=submit]').disabled}));
if(!result.values.some(x=>x.value==='示例同学')||!result.submitDisabled)throw Error('Safety or fill verification failed');
await fs.writeFile(resolve(out,'source/run-result.json'),JSON.stringify(result,null,2)+'\n');
await page.locator('#form').screenshot({path:resolve(out,'captures/form.png')});await page.locator('#panel').screenshot({path:resolve(out,'captures/panel.png')});
const prof=await browser.newPage({viewport:{width:1280,height:850},deviceScaleFactor:2});await prof.addInitScript(profile=>{globalThis.chrome={storage:{local:{get:async()=>({profile}),set:async()=>{},remove:async()=>{}}}}},result.profile);await prof.goto(pathToFileURL(resolve(root,'profile/profile.html')).href);await prof.waitForFunction(()=>document.querySelector('[data-key=nameZh]')?.value==='示例同学');await prof.screenshot({path:resolve(out,'captures/profile.png')});
await fs.writeFile(resolve(out,'source/ui-version.json'),JSON.stringify({repository:'https://github.com/liaoyiming222-art/applyflow-campus-autofill',codeCommit:commit,codeUrl:`https://github.com/liaoyiming222-art/applyflow-campus-autofill/tree/${commit}`,version:'0.7.8',state:'Published main source, clean runtime files verified against Git objects; controlled synthetic demo, not store release',hashConvention:'SHA-256 of committed Git blob bytes (LF), not platform checkout CRLF',sha256:hashes,browser:await browser.version()},null,2)+'\n');
console.log('Pinned main code captured successfully');
}finally{await browser?.close();server.kill();}
