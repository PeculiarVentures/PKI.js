"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[5992],{7180:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>a,default:()=>m,frontMatter:()=>c,metadata:()=>r,toc:()=>u});const r=JSON.parse('{"id":"examples/signing-and-encryption-with-CMS/index","title":"Signing and Encryption with CMS","description":"","source":"@site/docs/examples/signing-and-encryption-with-CMS/index.md","sourceDirName":"examples/signing-and-encryption-with-CMS","slug":"/examples/signing-and-encryption-with-CMS/","permalink":"/docs/examples/signing-and-encryption-with-CMS/","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"examples","previous":{"title":"Working with PKCS#12 files","permalink":"/docs/examples/other/working-with-PKCS-12-files"},"next":{"title":"Working with CMS Certificate-based Encryption","permalink":"/docs/examples/signing-and-encryption-with-CMS/working-with-CMS-certificate-based-encryption"}}');var i=t(74848),s=t(28453),o=t(17473);const c={},a="Signing and Encryption with CMS",l={},u=[];function d(e){const n={h1:"h1",header:"header",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"signing-and-encryption-with-cms",children:"Signing and Encryption with CMS"})}),"\n",(0,i.jsx)(o.A,{})]})}function m(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},17473:(e,n,t)=>{t.d(n,{A:()=>k});var r=t(96540),i=t(34164),s=t(93751),o=t(56289),c=t(40797);const a=["zero","one","two","few","many","other"];function l(e){return a.filter((n=>e.includes(n)))}const u={locale:"en",pluralForms:l(["one","other"]),select:e=>1===e?"one":"other"};function d(){const{i18n:{currentLocale:e}}=(0,c.A)();return(0,r.useMemo)((()=>{try{return function(e){const n=new Intl.PluralRules(e);return{locale:e,pluralForms:l(n.resolvedOptions().pluralCategories),select:e=>n.select(e)}}(e)}catch(n){return console.error(`Failed to use Intl.PluralRules for locale "${e}".\nDocusaurus will fallback to the default (English) implementation.\nError: ${n.message}\n`),u}}),[e])}function m(){const e=d();return{selectMessage:(n,t)=>function(e,n,t){const r=e.split("|");if(1===r.length)return r[0];r.length>t.pluralForms.length&&console.error(`For locale=${t.locale}, a maximum of ${t.pluralForms.length} plural forms are expected (${t.pluralForms.join(",")}), but the message contains ${r.length}: ${e}`);const i=t.select(n),s=t.pluralForms.indexOf(i);return r[Math.min(s,r.length-1)]}(t,n,e)}}var p=t(22887),h=t(50539),f=t(9303);const g={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var x=t(74848);function w(e){let{href:n,children:t}=e;return(0,x.jsx)(o.A,{href:n,className:(0,i.A)("card padding--lg",g.cardContainer),children:t})}function C(e){let{href:n,icon:t,title:r,description:s}=e;return(0,x.jsxs)(w,{href:n,children:[(0,x.jsxs)(f.A,{as:"h2",className:(0,i.A)("text--truncate",g.cardTitle),title:r,children:[t," ",r]}),s&&(0,x.jsx)("p",{className:(0,i.A)("text--truncate",g.cardDescription),title:s,children:s})]})}function y(e){let{item:n}=e;const t=(0,s.Nr)(n),r=function(){const{selectMessage:e}=m();return n=>e(n,(0,h.T)({message:"1 item|{count} items",id:"theme.docs.DocCard.categoryDescription.plurals",description:"The default description for a category card in the generated index about how many items this category includes"},{count:n}))}();return t?(0,x.jsx)(C,{href:t,icon:"\ud83d\uddc3\ufe0f",title:n.label,description:n.description??r(n.items.length)}):null}function j(e){let{item:n}=e;const t=(0,p.A)(n.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",r=(0,s.cC)(n.docId??void 0);return(0,x.jsx)(C,{href:n.href,icon:t,title:n.label,description:n.description??r?.description})}function S(e){let{item:n}=e;switch(n.type){case"link":return(0,x.jsx)(j,{item:n});case"category":return(0,x.jsx)(y,{item:n});default:throw new Error(`unknown item type ${JSON.stringify(n)}`)}}function M(e){let{className:n}=e;const t=(0,s.$S)();return(0,x.jsx)(k,{items:t.items,className:n})}function k(e){const{items:n,className:t}=e;if(!n)return(0,x.jsx)(M,{...e});const r=(0,s.d1)(n);return(0,x.jsx)("section",{className:(0,i.A)("row",t),children:r.map(((e,n)=>(0,x.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,x.jsx)(S,{item:e})},n)))})}},28453:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>c});var r=t(96540);const i={},s=r.createContext(i);function o(e){const n=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);