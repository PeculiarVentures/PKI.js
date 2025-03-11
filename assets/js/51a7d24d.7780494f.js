"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[3759],{3356:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>a,contentTitle:()=>c,default:()=>o,frontMatter:()=>d,metadata:()=>s,toc:()=>h});const s=JSON.parse('{"id":"api/classes/SignerInfo","title":"SignerInfo","description":"Represents the SignerInfo structure described in RFC5652","source":"@site/docs/api/classes/SignerInfo.md","sourceDirName":"api/classes","slug":"/api/classes/SignerInfo","permalink":"/docs/api/classes/SignerInfo","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"SignedDataVerifyError","permalink":"/docs/api/classes/SignedDataVerifyError"},"next":{"title":"SingleResponse","permalink":"/docs/api/classes/SingleResponse"}}');var i=r(74848),l=r(28453);const d={},c="SignerInfo",a={},h=[{value:"Extends",id:"extends",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new SignerInfo()",id:"new-signerinfo",level:3},{value:"Parameters",id:"parameters",level:4},{value:"parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Properties",id:"properties",level:2},{value:"digestAlgorithm",id:"digestalgorithm",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"sid",id:"sid",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"signature",id:"signature",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"signatureAlgorithm",id:"signaturealgorithm",level:3},{value:"Implementation of",id:"implementation-of-3",level:4},{value:"signedAttrs?",id:"signedattrs",level:3},{value:"Implementation of",id:"implementation-of-4",level:4},{value:"unsignedAttrs?",id:"unsignedattrs",level:3},{value:"Implementation of",id:"implementation-of-5",level:4},{value:"version",id:"version",level:3},{value:"Implementation of",id:"implementation-of-6",level:4},{value:"CLASS_NAME",id:"class_name",level:3},{value:"Overrides",id:"overrides-1",level:4},{value:"Accessors",id:"accessors",level:2},{value:"className",id:"classname",level:3},{value:"Get Signature",id:"get-signature",level:4},{value:"Returns",id:"returns-1",level:5},{value:"Inherited from",id:"inherited-from",level:4},{value:"Methods",id:"methods",level:2},{value:"fromSchema()",id:"fromschema",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"schema",id:"schema",level:5},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"toJSON()",id:"tojson",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"toSchema()",id:"toschema",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"toString()",id:"tostring",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"encoding",id:"encoding",level:5},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"blockName()",id:"blockname",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"compareWithDefault()",id:"comparewithdefault",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"memberName",id:"membername",level:5},{value:"memberValue",id:"membervalue",level:5},{value:"Returns",id:"returns-7",level:4},{value:"defaultValues()",id:"defaultvalues",level:3},{value:"Call Signature",id:"call-signature",level:4},{value:"Parameters",id:"parameters-5",level:5},{value:"memberName",id:"membername-1",level:6},{value:"Returns",id:"returns-8",level:5},{value:"Overrides",id:"overrides-5",level:5},{value:"Call Signature",id:"call-signature-1",level:4},{value:"Parameters",id:"parameters-6",level:5},{value:"memberName",id:"membername-2",level:6},{value:"Returns",id:"returns-9",level:5},{value:"Overrides",id:"overrides-6",level:5},{value:"Call Signature",id:"call-signature-2",level:4},{value:"Parameters",id:"parameters-7",level:5},{value:"memberName",id:"membername-3",level:6},{value:"Returns",id:"returns-10",level:5},{value:"Overrides",id:"overrides-7",level:5},{value:"Call Signature",id:"call-signature-3",level:4},{value:"Parameters",id:"parameters-8",level:5},{value:"memberName",id:"membername-4",level:6},{value:"Returns",id:"returns-11",level:5},{value:"Overrides",id:"overrides-8",level:5},{value:"Call Signature",id:"call-signature-4",level:4},{value:"Parameters",id:"parameters-9",level:5},{value:"memberName",id:"membername-5",level:6},{value:"Returns",id:"returns-12",level:5},{value:"Overrides",id:"overrides-9",level:5},{value:"Call Signature",id:"call-signature-5",level:4},{value:"Parameters",id:"parameters-10",level:5},{value:"memberName",id:"membername-6",level:6},{value:"Returns",id:"returns-13",level:5},{value:"Overrides",id:"overrides-10",level:5},{value:"Call Signature",id:"call-signature-6",level:4},{value:"Parameters",id:"parameters-11",level:5},{value:"memberName",id:"membername-7",level:6},{value:"Returns",id:"returns-14",level:5},{value:"Overrides",id:"overrides-11",level:5},{value:"fromBER()",id:"fromber",level:3},{value:"Type Parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-12",level:4},{value:"this",id:"this",level:5},{value:"raw",id:"raw",level:5},{value:"Returns",id:"returns-15",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"schema()",id:"schema-1",level:3},{value:"Parameters",id:"parameters-13",level:4},{value:"parameters",id:"parameters-14",level:5},{value:"Returns",id:"returns-16",level:4},{value:"Overrides",id:"overrides-12",level:4}];function t(e){const n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",h6:"h6",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,l.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"signerinfo",children:"SignerInfo"})}),"\n",(0,i.jsxs)(n.p,{children:["Represents the SignerInfo structure described in ",(0,i.jsx)(n.a,{href:"https://datatracker.ietf.org/doc/html/rfc5652",children:"RFC5652"})]}),"\n",(0,i.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})})}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"implements",children:"Implements"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo",children:(0,i.jsx)(n.code,{children:"ISignerInfo"})})}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(n.h3,{id:"new-signerinfo",children:"new SignerInfo()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"new SignerInfo"}),"(",(0,i.jsx)(n.code,{children:"parameters"}),"): ",(0,i.jsx)(n.a,{href:"/docs/api/classes/SignerInfo",children:(0,i.jsx)(n.code,{children:"SignerInfo"})})]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["Initializes a new instance of the ",(0,i.jsx)(n.a,{href:"/docs/api/classes/SignerInfo",children:"SignerInfo"})," class"]}),"\n",(0,i.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n",(0,i.jsx)(n.h5,{id:"parameters-1",children:"parameters"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/globals#signerinfoparameters",children:(0,i.jsx)(n.code,{children:"SignerInfoParameters"})})," = ",(0,i.jsx)(n.code,{children:"{}"})]}),"\n",(0,i.jsx)(n.p,{children:"Initialization parameters"}),"\n",(0,i.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/docs/api/classes/SignerInfo",children:(0,i.jsx)(n.code,{children:"SignerInfo"})})}),"\n",(0,i.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject#constructors",children:(0,i.jsx)(n.code,{children:"constructor"})})]}),"\n",(0,i.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(n.h3,{id:"digestalgorithm",children:"digestAlgorithm"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"digestAlgorithm"}),": ",(0,i.jsx)(n.a,{href:"/docs/api/classes/AlgorithmIdentifier",children:(0,i.jsx)(n.code,{children:"AlgorithmIdentifier"})})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo",children:(0,i.jsx)(n.code,{children:"ISignerInfo"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo#digestalgorithm",children:(0,i.jsx)(n.code,{children:"digestAlgorithm"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"sid",children:"sid"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"sid"}),": ",(0,i.jsx)(n.code,{children:"any"})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo",children:(0,i.jsx)(n.code,{children:"ISignerInfo"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo#sid",children:(0,i.jsx)(n.code,{children:"sid"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"signature",children:"signature"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"signature"}),": ",(0,i.jsx)(n.code,{children:"OctetString"})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"implementation-of-2",children:"Implementation of"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo",children:(0,i.jsx)(n.code,{children:"ISignerInfo"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo#signature",children:(0,i.jsx)(n.code,{children:"signature"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"signaturealgorithm",children:"signatureAlgorithm"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"signatureAlgorithm"}),": ",(0,i.jsx)(n.a,{href:"/docs/api/classes/AlgorithmIdentifier",children:(0,i.jsx)(n.code,{children:"AlgorithmIdentifier"})})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"implementation-of-3",children:"Implementation of"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo",children:(0,i.jsx)(n.code,{children:"ISignerInfo"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo#signaturealgorithm",children:(0,i.jsx)(n.code,{children:"signatureAlgorithm"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"signedattrs",children:"signedAttrs?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"signedAttrs"}),": ",(0,i.jsx)(n.a,{href:"/docs/api/classes/SignedAndUnsignedAttributes",children:(0,i.jsx)(n.code,{children:"SignedAndUnsignedAttributes"})})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"implementation-of-4",children:"Implementation of"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo",children:(0,i.jsx)(n.code,{children:"ISignerInfo"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo#signedattrs",children:(0,i.jsx)(n.code,{children:"signedAttrs"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"unsignedattrs",children:"unsignedAttrs?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"unsignedAttrs"}),": ",(0,i.jsx)(n.a,{href:"/docs/api/classes/SignedAndUnsignedAttributes",children:(0,i.jsx)(n.code,{children:"SignedAndUnsignedAttributes"})})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"implementation-of-5",children:"Implementation of"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo",children:(0,i.jsx)(n.code,{children:"ISignerInfo"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo#unsignedattrs",children:(0,i.jsx)(n.code,{children:"unsignedAttrs"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"version",children:"version"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"version"}),": ",(0,i.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"implementation-of-6",children:"Implementation of"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo",children:(0,i.jsx)(n.code,{children:"ISignerInfo"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/interfaces/ISignerInfo#version",children:(0,i.jsx)(n.code,{children:"version"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"class_name",children:"CLASS_NAME"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"CLASS_NAME"}),": ",(0,i.jsx)(n.code,{children:"string"})," = ",(0,i.jsx)(n.code,{children:'"SignerInfo"'})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Name of the class"}),"\n",(0,i.jsx)(n.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject#class_name",children:(0,i.jsx)(n.code,{children:"CLASS_NAME"})})]}),"\n",(0,i.jsx)(n.h2,{id:"accessors",children:"Accessors"}),"\n",(0,i.jsx)(n.h3,{id:"classname",children:"className"}),"\n",(0,i.jsx)(n.h4,{id:"get-signature",children:"Get Signature"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"get"})," ",(0,i.jsx)(n.strong,{children:"className"}),"(): ",(0,i.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,i.jsx)(n.h5,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"string"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject#classname",children:(0,i.jsx)(n.code,{children:"className"})})]}),"\n",(0,i.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(n.h3,{id:"fromschema",children:"fromSchema()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"fromSchema"}),"(",(0,i.jsx)(n.code,{children:"schema"}),"): ",(0,i.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Converts parsed ASN.1 object into current class"}),"\n",(0,i.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n",(0,i.jsx)(n.h5,{id:"schema",children:"schema"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"any"})}),"\n",(0,i.jsx)(n.p,{children:"ASN.1 schema"}),"\n",(0,i.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"void"})}),"\n",(0,i.jsx)(n.h4,{id:"overrides-2",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject#fromschema",children:(0,i.jsx)(n.code,{children:"fromSchema"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"tojson",children:"toJSON()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"toJSON"}),"(): ",(0,i.jsx)(n.a,{href:"/docs/api/interfaces/SignerInfoJson",children:(0,i.jsx)(n.code,{children:"SignerInfoJson"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Converts the class to JSON object"}),"\n",(0,i.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/docs/api/interfaces/SignerInfoJson",children:(0,i.jsx)(n.code,{children:"SignerInfoJson"})})}),"\n",(0,i.jsx)(n.p,{children:"JSON object"}),"\n",(0,i.jsx)(n.h4,{id:"overrides-3",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject#tojson",children:(0,i.jsx)(n.code,{children:"toJSON"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"toschema",children:"toSchema()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"toSchema"}),"(): ",(0,i.jsx)(n.code,{children:"Sequence"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Converts current object to ASN.1 object and sets correct values"}),"\n",(0,i.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"Sequence"})}),"\n",(0,i.jsx)(n.p,{children:"ASN.1 object"}),"\n",(0,i.jsx)(n.h4,{id:"overrides-4",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject#toschema",children:(0,i.jsx)(n.code,{children:"toSchema"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"tostring",children:"toString()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"toString"}),"(",(0,i.jsx)(n.code,{children:"encoding"}),"): ",(0,i.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n",(0,i.jsx)(n.h5,{id:"encoding",children:"encoding"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:'"base64"'})," | ",(0,i.jsx)(n.code,{children:'"base64url"'})," | ",(0,i.jsx)(n.code,{children:'"hex"'})]}),"\n",(0,i.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"string"})}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject#tostring",children:(0,i.jsx)(n.code,{children:"toString"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"blockname",children:"blockName()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"blockName"}),"(): ",(0,i.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Returns block name"}),"\n",(0,i.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"string"})}),"\n",(0,i.jsx)(n.p,{children:"Returns string block name"}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject#blockname",children:(0,i.jsx)(n.code,{children:"blockName"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"comparewithdefault",children:"compareWithDefault()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"compareWithDefault"}),"(",(0,i.jsx)(n.code,{children:"memberName"}),", ",(0,i.jsx)(n.code,{children:"memberValue"}),"): ",(0,i.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Compare values with default values for all class members"}),"\n",(0,i.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n",(0,i.jsx)(n.h5,{id:"membername",children:"memberName"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"string"})}),"\n",(0,i.jsx)(n.p,{children:"String name for a class member"}),"\n",(0,i.jsx)(n.h5,{id:"membervalue",children:"memberValue"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"any"})}),"\n",(0,i.jsx)(n.p,{children:"Value to compare with default value"}),"\n",(0,i.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"boolean"})}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"defaultvalues",children:"defaultValues()"}),"\n",(0,i.jsx)(n.h4,{id:"call-signature",children:"Call Signature"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"defaultValues"}),"(",(0,i.jsx)(n.code,{children:"memberName"}),"): ",(0,i.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Returns default values for all class members"}),"\n",(0,i.jsx)(n.h5,{id:"parameters-5",children:"Parameters"}),"\n",(0,i.jsx)(n.h6,{id:"membername-1",children:"memberName"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:'"version"'})}),"\n",(0,i.jsx)(n.p,{children:"String name for a class member"}),"\n",(0,i.jsx)(n.h5,{id:"returns-8",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"number"})}),"\n",(0,i.jsx)(n.p,{children:"Default value"}),"\n",(0,i.jsx)(n.h5,{id:"overrides-5",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject#defaultvalues",children:(0,i.jsx)(n.code,{children:"defaultValues"})})]}),"\n",(0,i.jsx)(n.h4,{id:"call-signature-1",children:"Call Signature"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"defaultValues"}),"(",(0,i.jsx)(n.code,{children:"memberName"}),"): ",(0,i.jsx)(n.code,{children:"any"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Returns default values for all class members"}),"\n",(0,i.jsx)(n.h5,{id:"parameters-6",children:"Parameters"}),"\n",(0,i.jsx)(n.h6,{id:"membername-2",children:"memberName"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:'"sid"'})}),"\n",(0,i.jsx)(n.p,{children:"String name for a class member"}),"\n",(0,i.jsx)(n.h5,{id:"returns-9",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"any"})}),"\n",(0,i.jsx)(n.p,{children:"Default value"}),"\n",(0,i.jsx)(n.h5,{id:"overrides-6",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"PkiObject.defaultValues"})}),"\n",(0,i.jsx)(n.h4,{id:"call-signature-2",children:"Call Signature"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"defaultValues"}),"(",(0,i.jsx)(n.code,{children:"memberName"}),"): ",(0,i.jsx)(n.a,{href:"/docs/api/classes/AlgorithmIdentifier",children:(0,i.jsx)(n.code,{children:"AlgorithmIdentifier"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Returns default values for all class members"}),"\n",(0,i.jsx)(n.h5,{id:"parameters-7",children:"Parameters"}),"\n",(0,i.jsx)(n.h6,{id:"membername-3",children:"memberName"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:'"digestAlgorithm"'})}),"\n",(0,i.jsx)(n.p,{children:"String name for a class member"}),"\n",(0,i.jsx)(n.h5,{id:"returns-10",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/docs/api/classes/AlgorithmIdentifier",children:(0,i.jsx)(n.code,{children:"AlgorithmIdentifier"})})}),"\n",(0,i.jsx)(n.p,{children:"Default value"}),"\n",(0,i.jsx)(n.h5,{id:"overrides-7",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"PkiObject.defaultValues"})}),"\n",(0,i.jsx)(n.h4,{id:"call-signature-3",children:"Call Signature"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"defaultValues"}),"(",(0,i.jsx)(n.code,{children:"memberName"}),"): ",(0,i.jsx)(n.a,{href:"/docs/api/classes/SignedAndUnsignedAttributes",children:(0,i.jsx)(n.code,{children:"SignedAndUnsignedAttributes"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Returns default values for all class members"}),"\n",(0,i.jsx)(n.h5,{id:"parameters-8",children:"Parameters"}),"\n",(0,i.jsx)(n.h6,{id:"membername-4",children:"memberName"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:'"signedAttrs"'})}),"\n",(0,i.jsx)(n.p,{children:"String name for a class member"}),"\n",(0,i.jsx)(n.h5,{id:"returns-11",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/docs/api/classes/SignedAndUnsignedAttributes",children:(0,i.jsx)(n.code,{children:"SignedAndUnsignedAttributes"})})}),"\n",(0,i.jsx)(n.p,{children:"Default value"}),"\n",(0,i.jsx)(n.h5,{id:"overrides-8",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"PkiObject.defaultValues"})}),"\n",(0,i.jsx)(n.h4,{id:"call-signature-4",children:"Call Signature"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"defaultValues"}),"(",(0,i.jsx)(n.code,{children:"memberName"}),"): ",(0,i.jsx)(n.a,{href:"/docs/api/classes/AlgorithmIdentifier",children:(0,i.jsx)(n.code,{children:"AlgorithmIdentifier"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Returns default values for all class members"}),"\n",(0,i.jsx)(n.h5,{id:"parameters-9",children:"Parameters"}),"\n",(0,i.jsx)(n.h6,{id:"membername-5",children:"memberName"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:'"signatureAlgorithm"'})}),"\n",(0,i.jsx)(n.p,{children:"String name for a class member"}),"\n",(0,i.jsx)(n.h5,{id:"returns-12",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/docs/api/classes/AlgorithmIdentifier",children:(0,i.jsx)(n.code,{children:"AlgorithmIdentifier"})})}),"\n",(0,i.jsx)(n.p,{children:"Default value"}),"\n",(0,i.jsx)(n.h5,{id:"overrides-9",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"PkiObject.defaultValues"})}),"\n",(0,i.jsx)(n.h4,{id:"call-signature-5",children:"Call Signature"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"defaultValues"}),"(",(0,i.jsx)(n.code,{children:"memberName"}),"): ",(0,i.jsx)(n.code,{children:"OctetString"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Returns default values for all class members"}),"\n",(0,i.jsx)(n.h5,{id:"parameters-10",children:"Parameters"}),"\n",(0,i.jsx)(n.h6,{id:"membername-6",children:"memberName"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:'"signature"'})}),"\n",(0,i.jsx)(n.p,{children:"String name for a class member"}),"\n",(0,i.jsx)(n.h5,{id:"returns-13",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"OctetString"})}),"\n",(0,i.jsx)(n.p,{children:"Default value"}),"\n",(0,i.jsx)(n.h5,{id:"overrides-10",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"PkiObject.defaultValues"})}),"\n",(0,i.jsx)(n.h4,{id:"call-signature-6",children:"Call Signature"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"defaultValues"}),"(",(0,i.jsx)(n.code,{children:"memberName"}),"): ",(0,i.jsx)(n.a,{href:"/docs/api/classes/SignedAndUnsignedAttributes",children:(0,i.jsx)(n.code,{children:"SignedAndUnsignedAttributes"})})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Returns default values for all class members"}),"\n",(0,i.jsx)(n.h5,{id:"parameters-11",children:"Parameters"}),"\n",(0,i.jsx)(n.h6,{id:"membername-7",children:"memberName"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:'"unsignedAttrs"'})}),"\n",(0,i.jsx)(n.p,{children:"String name for a class member"}),"\n",(0,i.jsx)(n.h5,{id:"returns-14",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/docs/api/classes/SignedAndUnsignedAttributes",children:(0,i.jsx)(n.code,{children:"SignedAndUnsignedAttributes"})})}),"\n",(0,i.jsx)(n.p,{children:"Default value"}),"\n",(0,i.jsx)(n.h5,{id:"overrides-11",children:"Overrides"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"PkiObject.defaultValues"})}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"fromber",children:"fromBER()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"fromBER"}),"<",(0,i.jsx)(n.code,{children:"T"}),">(",(0,i.jsx)(n.code,{children:"this"}),", ",(0,i.jsx)(n.code,{children:"raw"}),"): ",(0,i.jsx)(n.code,{children:"T"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Creates PKI object from the raw data"}),"\n",(0,i.jsx)(n.h4,{id:"type-parameters",children:"Type Parameters"}),"\n",(0,i.jsxs)(n.p,{children:["\u2022 ",(0,i.jsx)(n.strong,{children:"T"})," ",(0,i.jsx)(n.em,{children:"extends"})," ",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})})]}),"\n",(0,i.jsx)(n.h4,{id:"parameters-12",children:"Parameters"}),"\n",(0,i.jsx)(n.h5,{id:"this",children:"this"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"PkiObjectConstructor"}),"<",(0,i.jsx)(n.code,{children:"T"}),">"]}),"\n",(0,i.jsx)(n.h5,{id:"raw",children:"raw"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"BufferSource"})}),"\n",(0,i.jsx)(n.p,{children:"ASN.1 encoded raw data"}),"\n",(0,i.jsx)(n.h4,{id:"returns-15",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"T"})}),"\n",(0,i.jsx)(n.p,{children:"Initialized and filled current class object"}),"\n",(0,i.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject#fromber",children:(0,i.jsx)(n.code,{children:"fromBER"})})]}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"schema-1",children:"schema()"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"static"})," ",(0,i.jsx)(n.strong,{children:"schema"}),"(",(0,i.jsx)(n.code,{children:"parameters"}),"): ",(0,i.jsx)(n.code,{children:"any"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Returns value of pre-defined ASN.1 schema for current class"}),"\n",(0,i.jsx)(n.h4,{id:"parameters-13",children:"Parameters"}),"\n",(0,i.jsx)(n.h5,{id:"parameters-14",children:"parameters"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/interfaces/SchemaParameters",children:(0,i.jsx)(n.code,{children:"SchemaParameters"})}),"<{ ",(0,i.jsx)(n.code,{children:"digestAlgorithm"}),": ",(0,i.jsx)(n.a,{href:"/docs/api/globals#algorithmidentifierschema",children:(0,i.jsx)(n.code,{children:"AlgorithmIdentifierSchema"})}),"; ",(0,i.jsx)(n.code,{children:"sid"}),": ",(0,i.jsx)(n.code,{children:"string"}),"; ",(0,i.jsx)(n.code,{children:"sidSchema"}),": ",(0,i.jsx)(n.a,{href:"/docs/api/globals#issuerandserialnumberschema",children:(0,i.jsx)(n.code,{children:"IssuerAndSerialNumberSchema"})}),"; ",(0,i.jsx)(n.code,{children:"signature"}),": ",(0,i.jsx)(n.code,{children:"string"}),"; ",(0,i.jsx)(n.code,{children:"signatureAlgorithm"}),": ",(0,i.jsx)(n.a,{href:"/docs/api/globals#algorithmidentifierschema",children:(0,i.jsx)(n.code,{children:"AlgorithmIdentifierSchema"})}),"; ",(0,i.jsx)(n.code,{children:"signedAttrs"}),": ",(0,i.jsx)(n.a,{href:"/docs/api/globals#signedandunsignedattributesschema",children:(0,i.jsx)(n.code,{children:"SignedAndUnsignedAttributesSchema"})}),"; ",(0,i.jsx)(n.code,{children:"unsignedAttrs"}),": ",(0,i.jsx)(n.a,{href:"/docs/api/globals#signedandunsignedattributesschema",children:(0,i.jsx)(n.code,{children:"SignedAndUnsignedAttributesSchema"})}),"; ",(0,i.jsx)(n.code,{children:"version"}),": ",(0,i.jsx)(n.code,{children:"string"}),"; }> = ",(0,i.jsx)(n.code,{children:"{}"})]}),"\n",(0,i.jsx)(n.p,{children:"Input parameters for the schema"}),"\n",(0,i.jsx)(n.h4,{id:"returns-16",children:"Returns"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"any"})}),"\n",(0,i.jsx)(n.p,{children:"ASN.1 schema object"}),"\n",(0,i.jsx)(n.h4,{id:"overrides-12",children:"Overrides"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(n.code,{children:"PkiObject"})}),".",(0,i.jsx)(n.a,{href:"/docs/api/classes/PkiObject#schema-1",children:(0,i.jsx)(n.code,{children:"schema"})})]})]})}function o(e={}){const{wrapper:n}={...(0,l.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(t,{...e})}):t(e)}},28453:(e,n,r)=>{r.d(n,{R:()=>d,x:()=>c});var s=r(96540);const i={},l=s.createContext(i);function d(e){const n=s.useContext(l);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:d(e.components),s.createElement(l.Provider,{value:n},e.children)}}}]);