"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[4998],{83195:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>o,default:()=>u,frontMatter:()=>c,metadata:()=>a,toc:()=>l});var i=t(85893),r=t(11151),s=t(52991);const c={},o="Signing and Encryption with CMS",a={id:"examples/signing-and-encryption-with-CMS/index",title:"Signing and Encryption with CMS",description:"",source:"@site/docs/examples/signing-and-encryption-with-CMS/index.md",sourceDirName:"examples/signing-and-encryption-with-CMS",slug:"/examples/signing-and-encryption-with-CMS/",permalink:"/docs/examples/signing-and-encryption-with-CMS/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"examples",previous:{title:"Working with PKCS#12 files",permalink:"/docs/examples/other/working-with-PKCS-12-files"},next:{title:"Working with CMS Certificate-based Encryption",permalink:"/docs/examples/signing-and-encryption-with-CMS/working-with-CMS-certificate-based-encryption"}},d={},l=[];function p(e){const n={h1:"h1",...(0,r.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h1,{id:"signing-and-encryption-with-cms",children:"Signing and Encryption with CMS"}),"\n",(0,i.jsx)(s.Z,{})]})}function u(e={}){const{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(p,{...e})}):p(e)}},52991:(e,n,t)=>{t.d(n,{Z:()=>x});t(67294);var i=t(36905),r=t(53438),s=t(33692),c=t(13919),o=t(95999),a=t(92503);const d={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var l=t(85893);function p(e){let{href:n,children:t}=e;return(0,l.jsx)(s.Z,{href:n,className:(0,i.Z)("card padding--lg",d.cardContainer),children:t})}function u(e){let{href:n,icon:t,title:r,description:s}=e;return(0,l.jsxs)(p,{href:n,children:[(0,l.jsxs)(a.Z,{as:"h2",className:(0,i.Z)("text--truncate",d.cardTitle),title:r,children:[t," ",r]}),s&&(0,l.jsx)("p",{className:(0,i.Z)("text--truncate",d.cardDescription),title:s,children:s})]})}function m(e){let{item:n}=e;const t=(0,r.LM)(n);return t?(0,l.jsx)(u,{href:t,icon:"\ud83d\uddc3\ufe0f",title:n.label,description:n.description??(0,o.I)({message:"{count} items",id:"theme.docs.DocCard.categoryDescription",description:"The default description for a category card in the generated index about how many items this category includes"},{count:n.items.length})}):null}function h(e){let{item:n}=e;const t=(0,c.Z)(n.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",i=(0,r.xz)(n.docId??void 0);return(0,l.jsx)(u,{href:n.href,icon:t,title:n.label,description:n.description??i?.description})}function f(e){let{item:n}=e;switch(n.type){case"link":return(0,l.jsx)(h,{item:n});case"category":return(0,l.jsx)(m,{item:n});default:throw new Error(`unknown item type ${JSON.stringify(n)}`)}}function g(e){let{className:n}=e;const t=(0,r.jA)();return(0,l.jsx)(x,{items:t.items,className:n})}function x(e){const{items:n,className:t}=e;if(!n)return(0,l.jsx)(g,{...e});const s=(0,r.MN)(n);return(0,l.jsx)("section",{className:(0,i.Z)("row",t),children:s.map(((e,n)=>(0,l.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,l.jsx)(f,{item:e})},n)))})}},11151:(e,n,t)=>{t.d(n,{Z:()=>o,a:()=>c});var i=t(67294);const r={},s=i.createContext(r);function c(e){const n=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),i.createElement(s.Provider,{value:n},e.children)}}}]);