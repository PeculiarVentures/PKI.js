"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[1903],{22761:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>m,frontMatter:()=>c,metadata:()=>a,toc:()=>d});var r=n(74848),i=n(28453),s=n(3514);const c={},o="Other",a={id:"examples/other/index",title:"Other",description:"",source:"@site/docs/examples/other/index.md",sourceDirName:"examples/other",slug:"/examples/other/",permalink:"/docs/examples/other/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"examples",previous:{title:"Working with certificate requests",permalink:"/docs/examples/certificates-and-revocation/working-with-certificate-requests"},next:{title:"S/MIME signature encryption",permalink:"/docs/examples/other/S-MIME-signature-encryption"}},l={},d=[];function u(e){const t={h1:"h1",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.h1,{id:"other",children:"Other"}),"\n",(0,r.jsx)(s.A,{})]})}function m(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(u,{...e})}):u(e)}},3514:(e,t,n)=>{n.d(t,{A:()=>g});n(96540);var r=n(18215),i=n(84142),s=n(28774),c=n(16654),o=n(21312),a=n(51107);const l={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var d=n(74848);function u(e){let{href:t,children:n}=e;return(0,d.jsx)(s.A,{href:t,className:(0,r.A)("card padding--lg",l.cardContainer),children:n})}function m(e){let{href:t,icon:n,title:i,description:s}=e;return(0,d.jsxs)(u,{href:t,children:[(0,d.jsxs)(a.A,{as:"h2",className:(0,r.A)("text--truncate",l.cardTitle),title:i,children:[n," ",i]}),s&&(0,d.jsx)("p",{className:(0,r.A)("text--truncate",l.cardDescription),title:s,children:s})]})}function h(e){let{item:t}=e;const n=(0,i.Nr)(t);return n?(0,d.jsx)(m,{href:n,icon:"\ud83d\uddc3\ufe0f",title:t.label,description:t.description??(0,o.T)({message:"{count} items",id:"theme.docs.DocCard.categoryDescription",description:"The default description for a category card in the generated index about how many items this category includes"},{count:t.items.length})}):null}function p(e){let{item:t}=e;const n=(0,c.A)(t.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",r=(0,i.cC)(t.docId??void 0);return(0,d.jsx)(m,{href:t.href,icon:n,title:t.label,description:t.description??r?.description})}function f(e){let{item:t}=e;switch(t.type){case"link":return(0,d.jsx)(p,{item:t});case"category":return(0,d.jsx)(h,{item:t});default:throw new Error(`unknown item type ${JSON.stringify(t)}`)}}function x(e){let{className:t}=e;const n=(0,i.$S)();return(0,d.jsx)(g,{items:n.items,className:t})}function g(e){const{items:t,className:n}=e;if(!t)return(0,d.jsx)(x,{...e});const s=(0,i.d1)(t);return(0,d.jsx)("section",{className:(0,r.A)("row",n),children:s.map(((e,t)=>(0,d.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,d.jsx)(f,{item:e})},t)))})}},28453:(e,t,n)=>{n.d(t,{R:()=>c,x:()=>o});var r=n(96540);const i={},s=r.createContext(i);function c(e){const t=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:c(e.components),r.createElement(s.Provider,{value:t},e.children)}}}]);