"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[4472],{53268:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>l,contentTitle:()=>o,default:()=>h,frontMatter:()=>r,metadata:()=>c,toc:()=>d});var t=i(74848),s=i(28453);const r={},o="ITimeStampReq",c={id:"api/interfaces/ITimeStampReq",title:"ITimeStampReq",description:"Properties",source:"@site/docs/api/interfaces/ITimeStampReq.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/ITimeStampReq",permalink:"/docs/api/interfaces/ITimeStampReq",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"docs",previous:{title:"ITime",permalink:"/docs/api/interfaces/ITime"},next:{title:"ITimeStampResp",permalink:"/docs/api/interfaces/ITimeStampResp"}},l={},d=[{value:"Properties",id:"properties",level:2},{value:"certReq?",id:"certreq",level:3},{value:"extensions?",id:"extensions",level:3},{value:"messageImprint",id:"messageimprint",level:3},{value:"nonce?",id:"nonce",level:3},{value:"reqPolicy?",id:"reqpolicy",level:3},{value:"version",id:"version",level:3}];function a(e){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",hr:"hr",p:"p",strong:"strong",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"itimestampreq",children:"ITimeStampReq"})}),"\n",(0,t.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,t.jsx)(n.h3,{id:"certreq",children:"certReq?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"certReq"}),": ",(0,t.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"If the certReq field is present and set to true, the TSA's public key\ncertificate that is referenced by the ESSCertID identifier inside a\nSigningCertificate attribute in the response MUST be provided by the\nTSA in the certificates field from the SignedData structure in that\nresponse. That field may also contain other certificates."}),"\n",(0,t.jsx)(n.p,{children:"If the certReq field is missing or if the certReq field is present\nand set to false then the certificates field from the SignedData\nstructure MUST not be present in the response."}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"extensions",children:"extensions?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"extensions"}),": ",(0,t.jsx)(n.a,{href:"/docs/api/classes/Extension",children:(0,t.jsx)(n.code,{children:"Extension"})}),"[]"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The extensions field is a generic way to add additional information\nto the request in the future."}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"messageimprint",children:"messageImprint"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"messageImprint"}),": ",(0,t.jsx)(n.a,{href:"/docs/api/classes/MessageImprint",children:(0,t.jsx)(n.code,{children:"MessageImprint"})})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Contains the hash of the datum to be time-stamped"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"nonce",children:"nonce?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"nonce"}),": ",(0,t.jsx)(n.code,{children:"Integer"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The nonce, if included, allows the client to verify the timeliness of\nthe response when no local clock is available. The nonce is a large\nrandom number with a high probability that the client generates it\nonly once."}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"reqpolicy",children:"reqPolicy?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"reqPolicy"}),": ",(0,t.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Indicates the TSA policy under which the TimeStampToken SHOULD be provided."}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"version",children:"version"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"version"}),": ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Version of the Time-Stamp request. Should be version 1."})]})}function h(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(a,{...e})}):a(e)}},28453:(e,n,i)=>{i.d(n,{R:()=>o,x:()=>c});var t=i(96540);const s={},r=t.createContext(s);function o(e){const n=t.useContext(r);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),t.createElement(r.Provider,{value:n},e.children)}}}]);