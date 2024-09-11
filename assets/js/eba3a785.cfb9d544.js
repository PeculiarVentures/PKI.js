"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[9787],{24454:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>c,default:()=>d,frontMatter:()=>o,metadata:()=>a,toc:()=>m});var r=n(74848),s=n(28453),i=n(5871);const o={},c="Timestamping",a={id:"examples/timestamping/index",title:"Timestamping",description:"",source:"@site/docs/examples/timestamping/index.md",sourceDirName:"examples/timestamping",slug:"/examples/timestamping/",permalink:"/docs/examples/timestamping/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"examples",previous:{title:"Working with PKCS#7 Certificate bags (P7B)",permalink:"/docs/examples/signing-and-encryption-with-CMS/working-with-PKCS-7-certificate-bags-P7B"},next:{title:"Creating a Timestamp request",permalink:"/docs/examples/timestamping/creating-a-timestamp-request"}},l={},m=[];function u(e){const t={h1:"h1",header:"header",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.header,{children:(0,r.jsx)(t.h1,{id:"timestamping",children:"Timestamping"})}),"\n",(0,r.jsx)(i.A,{})]})}function d(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(u,{...e})}):u(e)}},5871:(e,t,n)=>{n.d(t,{A:()=>v});var r=n(96540),s=n(34164),i=n(26972),o=n(28774),c=n(44586);const a=["zero","one","two","few","many","other"];function l(e){return a.filter((t=>e.includes(t)))}const m={locale:"en",pluralForms:l(["one","other"]),select:e=>1===e?"one":"other"};function u(){const{i18n:{currentLocale:e}}=(0,c.A)();return(0,r.useMemo)((()=>{try{return function(e){const t=new Intl.PluralRules(e);return{locale:e,pluralForms:l(t.resolvedOptions().pluralCategories),select:e=>t.select(e)}}(e)}catch(t){return console.error(`Failed to use Intl.PluralRules for locale "${e}".\nDocusaurus will fallback to the default (English) implementation.\nError: ${t.message}\n`),m}}),[e])}function d(){const e=u();return{selectMessage:(t,n)=>function(e,t,n){const r=e.split("|");if(1===r.length)return r[0];r.length>n.pluralForms.length&&console.error(`For locale=${n.locale}, a maximum of ${n.pluralForms.length} plural forms are expected (${n.pluralForms.join(",")}), but the message contains ${r.length}: ${e}`);const s=n.select(t),i=n.pluralForms.indexOf(s);return r[Math.min(i,r.length-1)]}(n,t,e)}}var p=n(16654),h=n(21312),f=n(51107);const g={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var x=n(74848);function j(e){let{href:t,children:n}=e;return(0,x.jsx)(o.A,{href:t,className:(0,s.A)("card padding--lg",g.cardContainer),children:n})}function w(e){let{href:t,icon:n,title:r,description:i}=e;return(0,x.jsxs)(j,{href:t,children:[(0,x.jsxs)(f.A,{as:"h2",className:(0,s.A)("text--truncate",g.cardTitle),title:r,children:[n," ",r]}),i&&(0,x.jsx)("p",{className:(0,s.A)("text--truncate",g.cardDescription),title:i,children:i})]})}function C(e){let{item:t}=e;const n=(0,i.Nr)(t),r=function(){const{selectMessage:e}=d();return t=>e(t,(0,h.T)({message:"1 item|{count} items",id:"theme.docs.DocCard.categoryDescription.plurals",description:"The default description for a category card in the generated index about how many items this category includes"},{count:t}))}();return n?(0,x.jsx)(w,{href:n,icon:"\ud83d\uddc3\ufe0f",title:t.label,description:t.description??r(t.items.length)}):null}function b(e){let{item:t}=e;const n=(0,p.A)(t.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",r=(0,i.cC)(t.docId??void 0);return(0,x.jsx)(w,{href:t.href,icon:n,title:t.label,description:t.description??r?.description})}function k(e){let{item:t}=e;switch(t.type){case"link":return(0,x.jsx)(b,{item:t});case"category":return(0,x.jsx)(C,{item:t});default:throw new Error(`unknown item type ${JSON.stringify(t)}`)}}function y(e){let{className:t}=e;const n=(0,i.$S)();return(0,x.jsx)(v,{items:n.items,className:t})}function v(e){const{items:t,className:n}=e;if(!t)return(0,x.jsx)(y,{...e});const r=(0,i.d1)(t);return(0,x.jsx)("section",{className:(0,s.A)("row",n),children:r.map(((e,t)=>(0,x.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,x.jsx)(k,{item:e})},t)))})}},28453:(e,t,n)=>{n.d(t,{R:()=>o,x:()=>c});var r=n(96540);const s={},i=r.createContext(s);function o(e){const t=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),r.createElement(i.Provider,{value:t},e.children)}}}]);