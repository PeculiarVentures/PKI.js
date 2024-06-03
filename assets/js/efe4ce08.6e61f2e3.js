"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[6578],{77426:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>c,contentTitle:()=>d,default:()=>o,frontMatter:()=>l,metadata:()=>i,toc:()=>a});var r=s(85893),t=s(11151);const l={id:"EncryptedData",title:"Class: EncryptedData",sidebar_label:"EncryptedData",sidebar_position:0,custom_edit_url:null},d=void 0,i={id:"api/classes/EncryptedData",title:"Class: EncryptedData",description:"Represents the EncryptedData structure described in RFC5652",source:"@site/docs/api/classes/EncryptedData.md",sourceDirName:"api/classes",slug:"/api/classes/EncryptedData",permalink:"/docs/api/classes/EncryptedData",draft:!1,unlisted:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"EncryptedData",title:"Class: EncryptedData",sidebar_label:"EncryptedData",sidebar_position:0,custom_edit_url:null},sidebar:"docs",previous:{title:"EncryptedContentInfo",permalink:"/docs/api/classes/EncryptedContentInfo"},next:{title:"EnvelopedData",permalink:"/docs/api/classes/EnvelopedData"}},c={},a=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Properties",id:"properties",level:2},{value:"encryptedContentInfo",id:"encryptedcontentinfo",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"unprotectedAttrs",id:"unprotectedattrs",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"version",id:"version",level:3},{value:"Implementation of",id:"implementation-of-2",level:4},{value:"CLASS_NAME",id:"class_name",level:3},{value:"Overrides",id:"overrides-1",level:4},{value:"Accessors",id:"accessors",level:2},{value:"className",id:"classname",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Methods",id:"methods",level:2},{value:"decrypt",id:"decrypt",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"encrypt",id:"encrypt",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"fromSchema",id:"fromschema",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"toJSON",id:"tojson",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"toSchema",id:"toschema",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"toString",id:"tostring",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"blockName",id:"blockname",level:3},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"compareWithDefault",id:"comparewithdefault",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-9",level:4},{value:"defaultValues",id:"defaultvalues",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Overrides",id:"overrides-5",level:4},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Overrides",id:"overrides-6",level:4},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-12",level:4},{value:"Overrides",id:"overrides-7",level:4},{value:"fromBER",id:"fromber",level:3},{value:"Type parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-9",level:4},{value:"Returns",id:"returns-13",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"schema",id:"schema",level:3},{value:"Parameters",id:"parameters-10",level:4},{value:"Returns",id:"returns-14",level:4},{value:"Overrides",id:"overrides-8",level:4}];function h(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,t.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(n.p,{children:["Represents the EncryptedData structure described in ",(0,r.jsx)(n.a,{href:"https://datatracker.ietf.org/doc/html/rfc5652",children:"RFC5652"})]}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"Example"})})}),"\n",(0,r.jsx)(n.p,{children:"The following example demonstrates how to create and encrypt CMS Encrypted Data"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:'const cmsEncrypted = new pkijs.EncryptedData();\n\nawait cmsEncrypted.encrypt({\n  contentEncryptionAlgorithm: {\n    name: "AES-GCM",\n    length: 256,\n  },\n  hmacHashAlgorithm: "SHA-256",\n  iterationCount: 1000,\n  password: password,\n  contentToEncrypt: dataToEncrypt,\n});\n\n// Add Encrypted Data into CMS Content Info\nconst cmsContent = new pkijs.ContentInfo();\ncmsContent.contentType = pkijs.ContentInfo.ENCRYPTED_DATA;\ncmsContent.content = cmsEncrypted.toSchema();\n\nconst cmsContentRaw = cmsContent.toSchema().toBER();\n'})}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"Example"})})}),"\n",(0,r.jsx)(n.p,{children:"The following example demonstrates how to decrypt CMS Encrypted Data"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:'// Parse CMS Content Info\nconst cmsContent = pkijs.ContentInfo.fromBER(cmsContentRaw);\nif (cmsContent.contentType !== pkijs.ContentInfo.ENCRYPTED_DATA) {\n  throw new Error("CMS is not Encrypted Data");\n}\n// Parse CMS Encrypted Data\nconst cmsEncrypted = new pkijs.EncryptedData({ schema: cmsContent.content });\n\n// Decrypt data\nconst decryptedData = await cmsEncrypted.decrypt({\n  password: password,\n});\n'})}),"\n",(0,r.jsx)(n.h2,{id:"hierarchy",children:"Hierarchy"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,r.jsx)(n.code,{children:"PkiObject"})})}),"\n",(0,r.jsxs)(n.p,{children:["\u21b3 ",(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"EncryptedData"})})]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"implements",children:"Implements"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"/docs/api/interfaces/IEncryptedData",children:(0,r.jsx)(n.code,{children:"IEncryptedData"})})}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"constructor",children:"constructor"}),"\n",(0,r.jsxs)(n.p,{children:["\u2022 ",(0,r.jsx)(n.strong,{children:"new EncryptedData"}),"(",(0,r.jsx)(n.code,{children:"parameters?"}),"): ",(0,r.jsx)(n.a,{href:"/docs/api/classes/EncryptedData",children:(0,r.jsx)(n.code,{children:"EncryptedData"})})]}),"\n",(0,r.jsxs)(n.p,{children:["Initializes a new instance of the ",(0,r.jsx)(n.a,{href:"/docs/api/classes/EncryptedData",children:"EncryptedData"})," class"]}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"parameters"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.a,{href:"/docs/api/modules#encrypteddataparameters",children:(0,r.jsx)(n.code,{children:"EncryptedDataParameters"})})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"Initialization parameters"})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/docs/api/classes/EncryptedData",children:(0,r.jsx)(n.code,{children:"EncryptedData"})})}),"\n",(0,r.jsx)(n.h4,{id:"overrides",children:"Overrides"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:"PkiObject"}),".",(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject#constructor",children:"constructor"})]}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"encryptedcontentinfo",children:"encryptedContentInfo"}),"\n",(0,r.jsxs)(n.p,{children:["\u2022 ",(0,r.jsx)(n.strong,{children:"encryptedContentInfo"}),": ",(0,r.jsx)(n.a,{href:"/docs/api/classes/EncryptedContentInfo",children:(0,r.jsx)(n.code,{children:"EncryptedContentInfo"})})]}),"\n",(0,r.jsx)(n.p,{children:"Encrypted content information"}),"\n",(0,r.jsx)(n.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/interfaces/IEncryptedData",children:"IEncryptedData"}),".",(0,r.jsx)(n.a,{href:"/docs/api/interfaces/IEncryptedData#encryptedcontentinfo",children:"encryptedContentInfo"})]}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"unprotectedattrs",children:"unprotectedAttrs"}),"\n",(0,r.jsxs)(n.p,{children:["\u2022 ",(0,r.jsx)(n.code,{children:"Optional"})," ",(0,r.jsx)(n.strong,{children:"unprotectedAttrs"}),": ",(0,r.jsx)(n.a,{href:"/docs/api/classes/Attribute",children:(0,r.jsx)(n.code,{children:"Attribute"})}),"[]"]}),"\n",(0,r.jsx)(n.p,{children:"Collection of attributes that are not encrypted"}),"\n",(0,r.jsx)(n.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/interfaces/IEncryptedData",children:"IEncryptedData"}),".",(0,r.jsx)(n.a,{href:"/docs/api/interfaces/IEncryptedData#unprotectedattrs",children:"unprotectedAttrs"})]}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"version",children:"version"}),"\n",(0,r.jsxs)(n.p,{children:["\u2022 ",(0,r.jsx)(n.strong,{children:"version"}),": ",(0,r.jsx)(n.code,{children:"number"})]}),"\n",(0,r.jsx)(n.p,{children:"Version number."}),"\n",(0,r.jsxs)(n.p,{children:["If ",(0,r.jsx)(n.code,{children:"unprotectedAttrs"})," is present, then the version MUST be 2. If ",(0,r.jsx)(n.code,{children:"unprotectedAttrs"})," is absent, then version MUST be 0."]}),"\n",(0,r.jsx)(n.h4,{id:"implementation-of-2",children:"Implementation of"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/interfaces/IEncryptedData",children:"IEncryptedData"}),".",(0,r.jsx)(n.a,{href:"/docs/api/interfaces/IEncryptedData#version",children:"version"})]}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"class_name",children:"CLASS_NAME"}),"\n",(0,r.jsxs)(n.p,{children:["\u25aa ",(0,r.jsx)(n.code,{children:"Static"})," ",(0,r.jsx)(n.strong,{children:"CLASS_NAME"}),": ",(0,r.jsx)(n.code,{children:"string"})," = ",(0,r.jsx)(n.code,{children:'"EncryptedData"'})]}),"\n",(0,r.jsx)(n.p,{children:"Name of the class"}),"\n",(0,r.jsx)(n.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:"PkiObject"}),".",(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject#class_name",children:"CLASS_NAME"})]}),"\n",(0,r.jsx)(n.h2,{id:"accessors",children:"Accessors"}),"\n",(0,r.jsx)(n.h3,{id:"classname",children:"className"}),"\n",(0,r.jsxs)(n.p,{children:["\u2022 ",(0,r.jsx)(n.code,{children:"get"})," ",(0,r.jsx)(n.strong,{children:"className"}),"(): ",(0,r.jsx)(n.code,{children:"string"})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"string"})}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,r.jsx)(n.p,{children:"PkiObject.className"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"decrypt",children:"decrypt"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"decrypt"}),"(",(0,r.jsx)(n.code,{children:"parameters"}),", ",(0,r.jsx)(n.code,{children:"crypto?"}),"): ",(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"ArrayBuffer"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"Creates a new CMS Encrypted Data content"}),"\n",(0,r.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"parameters"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"Object"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"Parameters necessary for encryption"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"parameters.password"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"ArrayBuffer"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"-"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"crypto"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.a,{href:"/docs/api/interfaces/ICryptoEngine",children:(0,r.jsx)(n.code,{children:"ICryptoEngine"})})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"Crypto engine"})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"ArrayBuffer"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"Returns decrypted raw data"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"encrypt",children:"encrypt"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"encrypt"}),"(",(0,r.jsx)(n.code,{children:"parameters"}),", ",(0,r.jsx)(n.code,{children:"crypto?"}),"): ",(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n",(0,r.jsx)(n.p,{children:"Creates a new CMS Encrypted Data content"}),"\n",(0,r.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"parameters"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.a,{href:"/docs/api/modules#encrypteddataencryptparams",children:(0,r.jsx)(n.code,{children:"EncryptedDataEncryptParams"})})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"Parameters necessary for encryption"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"crypto"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.a,{href:"/docs/api/interfaces/ICryptoEngine",children:(0,r.jsx)(n.code,{children:"ICryptoEngine"})})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"-"})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"fromschema",children:"fromSchema"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"fromSchema"}),"(",(0,r.jsx)(n.code,{children:"schema"}),"): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n",(0,r.jsx)(n.p,{children:"Converts parsed ASN.1 object into current class"}),"\n",(0,r.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"schema"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"any"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"ASN.1 schema"})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.h4,{id:"overrides-2",children:"Overrides"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:"PkiObject"}),".",(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject#fromschema",children:"fromSchema"})]}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"tojson",children:"toJSON"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"toJSON"}),"(): ",(0,r.jsx)(n.a,{href:"/docs/api/interfaces/EncryptedDataJson",children:(0,r.jsx)(n.code,{children:"EncryptedDataJson"})})]}),"\n",(0,r.jsx)(n.p,{children:"Converts the class to JSON object"}),"\n",(0,r.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/docs/api/interfaces/EncryptedDataJson",children:(0,r.jsx)(n.code,{children:"EncryptedDataJson"})})}),"\n",(0,r.jsx)(n.p,{children:"JSON object"}),"\n",(0,r.jsx)(n.h4,{id:"overrides-3",children:"Overrides"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:"PkiObject"}),".",(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject#tojson",children:"toJSON"})]}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"toschema",children:"toSchema"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"toSchema"}),"(): ",(0,r.jsx)(n.code,{children:"Sequence"})]}),"\n",(0,r.jsx)(n.p,{children:"Converts current object to ASN.1 object and sets correct values"}),"\n",(0,r.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Sequence"})}),"\n",(0,r.jsx)(n.p,{children:"ASN.1 object"}),"\n",(0,r.jsx)(n.h4,{id:"overrides-4",children:"Overrides"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:"PkiObject"}),".",(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject#toschema",children:"toSchema"})]}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"tostring",children:"toString"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"toString"}),"(",(0,r.jsx)(n.code,{children:"encoding?"}),"): ",(0,r.jsx)(n.code,{children:"string"})]}),"\n",(0,r.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Default value"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"encoding"})}),(0,r.jsxs)(n.td,{style:{textAlign:"left"},children:[(0,r.jsx)(n.code,{children:'"base64"'})," | ",(0,r.jsx)(n.code,{children:'"base64url"'})," | ",(0,r.jsx)(n.code,{children:'"hex"'})]}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:'"hex"'})})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"string"})}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:"PkiObject"}),".",(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject#tostring",children:"toString"})]}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"blockname",children:"blockName"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"blockName"}),"(): ",(0,r.jsx)(n.code,{children:"string"})]}),"\n",(0,r.jsx)(n.p,{children:"Returns block name"}),"\n",(0,r.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"string"})}),"\n",(0,r.jsx)(n.p,{children:"Returns string block name"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:"PkiObject"}),".",(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject#blockname",children:"blockName"})]}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"comparewithdefault",children:"compareWithDefault"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"compareWithDefault"}),"(",(0,r.jsx)(n.code,{children:"memberName"}),", ",(0,r.jsx)(n.code,{children:"memberValue"}),"): ",(0,r.jsx)(n.code,{children:"boolean"})]}),"\n",(0,r.jsx)(n.p,{children:"Compare values with default values for all class members"}),"\n",(0,r.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"memberName"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"string"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"String name for a class member"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"memberValue"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"any"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"Value to compare with default value"})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"boolean"})}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"defaultvalues",children:"defaultValues"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"defaultValues"}),"(",(0,r.jsx)(n.code,{children:"memberName"}),"): ",(0,r.jsx)(n.code,{children:"number"})]}),"\n",(0,r.jsx)(n.p,{children:"Returns default values for all class members"}),"\n",(0,r.jsx)(n.h4,{id:"parameters-6",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"memberName"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:'"version"'})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"String name for a class member"})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"number"})}),"\n",(0,r.jsx)(n.p,{children:"Default value"}),"\n",(0,r.jsx)(n.h4,{id:"overrides-5",children:"Overrides"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:"PkiObject"}),".",(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject#defaultvalues",children:"defaultValues"})]}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"defaultValues"}),"(",(0,r.jsx)(n.code,{children:"memberName"}),"): ",(0,r.jsx)(n.a,{href:"/docs/api/classes/EncryptedContentInfo",children:(0,r.jsx)(n.code,{children:"EncryptedContentInfo"})})]}),"\n",(0,r.jsx)(n.h4,{id:"parameters-7",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"memberName"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:'"encryptedContentInfo"'})})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-11",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/docs/api/classes/EncryptedContentInfo",children:(0,r.jsx)(n.code,{children:"EncryptedContentInfo"})})}),"\n",(0,r.jsx)(n.h4,{id:"overrides-6",children:"Overrides"}),"\n",(0,r.jsx)(n.p,{children:"PkiObject.defaultValues"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"defaultValues"}),"(",(0,r.jsx)(n.code,{children:"memberName"}),"): ",(0,r.jsx)(n.a,{href:"/docs/api/classes/Attribute",children:(0,r.jsx)(n.code,{children:"Attribute"})}),"[]"]}),"\n",(0,r.jsx)(n.h4,{id:"parameters-8",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"memberName"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:'"unprotectedAttrs"'})})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-12",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/classes/Attribute",children:(0,r.jsx)(n.code,{children:"Attribute"})}),"[]"]}),"\n",(0,r.jsx)(n.h4,{id:"overrides-7",children:"Overrides"}),"\n",(0,r.jsx)(n.p,{children:"PkiObject.defaultValues"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"fromber",children:"fromBER"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"fromBER"}),"<",(0,r.jsx)(n.code,{children:"T"}),">(",(0,r.jsx)(n.code,{children:"this"}),", ",(0,r.jsx)(n.code,{children:"raw"}),"): ",(0,r.jsx)(n.code,{children:"T"})]}),"\n",(0,r.jsx)(n.p,{children:"Creates PKI object from the raw data"}),"\n",(0,r.jsx)(n.h4,{id:"type-parameters",children:"Type parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"T"})}),(0,r.jsxs)(n.td,{style:{textAlign:"left"},children:["extends ",(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:(0,r.jsx)(n.code,{children:"PkiObject"})})]})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"parameters-9",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"this"})}),(0,r.jsxs)(n.td,{style:{textAlign:"left"},children:[(0,r.jsx)(n.code,{children:"PkiObjectConstructor"}),"<",(0,r.jsx)(n.code,{children:"T"}),">"]}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"-"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"raw"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"BufferSource"})}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"ASN.1 encoded raw data"})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-13",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"T"})}),"\n",(0,r.jsx)(n.p,{children:"Initialized and filled current class object"}),"\n",(0,r.jsx)(n.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:"PkiObject"}),".",(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject#fromber",children:"fromBER"})]}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"schema",children:"schema"}),"\n",(0,r.jsxs)(n.p,{children:["\u25b8 ",(0,r.jsx)(n.strong,{children:"schema"}),"(",(0,r.jsx)(n.code,{children:"parameters?"}),"): ",(0,r.jsx)(n.code,{children:"any"})]}),"\n",(0,r.jsx)(n.p,{children:"Returns value of pre-defined ASN.1 schema for current class"}),"\n",(0,r.jsx)(n.h4,{id:"parameters-10",children:"Parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Type"}),(0,r.jsx)(n.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"left"},children:(0,r.jsx)(n.code,{children:"parameters"})}),(0,r.jsxs)(n.td,{style:{textAlign:"left"},children:[(0,r.jsx)(n.a,{href:"/docs/api/interfaces/SchemaParameters",children:(0,r.jsx)(n.code,{children:"SchemaParameters"})}),"<{ ",(0,r.jsx)(n.code,{children:"encryptedContentInfo?"}),": ",(0,r.jsx)(n.a,{href:"/docs/api/modules#encryptedcontentinfoschema",children:(0,r.jsx)(n.code,{children:"EncryptedContentInfoSchema"})})," ; ",(0,r.jsx)(n.code,{children:"unprotectedAttrs?"}),": ",(0,r.jsx)(n.code,{children:"string"})," ; ",(0,r.jsx)(n.code,{children:"version?"}),": ",(0,r.jsx)(n.code,{children:"string"}),"  }>"]}),(0,r.jsx)(n.td,{style:{textAlign:"left"},children:"Input parameters for the schema"})]})})]}),"\n",(0,r.jsx)(n.h4,{id:"returns-14",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"any"})}),"\n",(0,r.jsx)(n.p,{children:"ASN.1 schema object"}),"\n",(0,r.jsx)(n.h4,{id:"overrides-8",children:"Overrides"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject",children:"PkiObject"}),".",(0,r.jsx)(n.a,{href:"/docs/api/classes/PkiObject#schema",children:"schema"})]})]})}function o(e={}){const{wrapper:n}={...(0,t.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},11151:(e,n,s)=>{s.d(n,{Z:()=>i,a:()=>d});var r=s(67294);const t={},l=r.createContext(t);function d(e){const n=r.useContext(l);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:d(e.components),r.createElement(l.Provider,{value:n},e.children)}}}]);