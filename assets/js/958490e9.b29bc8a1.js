"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[6592],{28453:(e,s,r)=>{r.d(s,{R:()=>d,x:()=>l});var n=r(96540);const i={},c=n.createContext(i);function d(e){const s=n.useContext(c);return n.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function l(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:d(e.components),n.createElement(c.Provider,{value:s},e.children)}},97806:(e,s,r)=>{r.r(s),r.d(s,{assets:()=>a,contentTitle:()=>l,default:()=>o,frontMatter:()=>d,metadata:()=>n,toc:()=>t});const n=JSON.parse('{"id":"api/classes/NameConstraints","title":"NameConstraints","description":"Represents the NameConstraints structure described in RFC5280","source":"@site/docs/api/classes/NameConstraints.md","sourceDirName":"api/classes","slug":"/api/classes/NameConstraints","permalink":"/docs/api/classes/NameConstraints","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"MessageImprint","permalink":"/docs/api/classes/MessageImprint"},"next":{"title":"ObjectDigestInfo","permalink":"/docs/api/classes/ObjectDigestInfo"}}');var i=r(74848),c=r(28453);const d={},l="NameConstraints",a={},t=[{value:"Extends",id:"extends",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new NameConstraints()",id:"new-nameconstraints",level:3},{value:"Parameters",id:"parameters",level:4},{value:"parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Properties",id:"properties",level:2},{value:"excludedSubtrees?",id:"excludedsubtrees",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"permittedSubtrees?",id:"permittedsubtrees",level:3},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"CLASS_NAME",id:"class_name",level:3},{value:"Overrides",id:"overrides-1",level:4},{value:"Accessors",id:"accessors",level:2},{value:"className",id:"classname",level:3},{value:"Get Signature",id:"get-signature",level:4},{value:"Returns",id:"returns-1",level:5},{value:"Inherited from",id:"inherited-from",level:4},{value:"Methods",id:"methods",level:2},{value:"fromSchema()",id:"fromschema",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"schema",id:"schema",level:5},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"toJSON()",id:"tojson",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"toSchema()",id:"toschema",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-4",level:4},{value:"toString()",id:"tostring",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"encoding",id:"encoding",level:5},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"blockName()",id:"blockname",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"defaultValues()",id:"defaultvalues",level:3},{value:"Call Signature",id:"call-signature",level:4},{value:"Parameters",id:"parameters-4",level:5},{value:"memberName",id:"membername",level:6},{value:"Returns",id:"returns-7",level:5},{value:"Overrides",id:"overrides-5",level:5},{value:"Call Signature",id:"call-signature-1",level:4},{value:"Parameters",id:"parameters-5",level:5},{value:"memberName",id:"membername-1",level:6},{value:"Returns",id:"returns-8",level:5},{value:"Overrides",id:"overrides-6",level:5},{value:"fromBER()",id:"fromber",level:3},{value:"Type Parameters",id:"type-parameters",level:4},{value:"Parameters",id:"parameters-6",level:4},{value:"this",id:"this",level:5},{value:"raw",id:"raw",level:5},{value:"Returns",id:"returns-9",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"schema()",id:"schema-1",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"parameters",id:"parameters-8",level:5},{value:"Returns",id:"returns-10",level:4},{value:"Overrides",id:"overrides-7",level:4}];function h(e){const s={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",h6:"h6",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,c.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.header,{children:(0,i.jsx)(s.h1,{id:"nameconstraints",children:"NameConstraints"})}),"\n",(0,i.jsxs)(s.p,{children:["Represents the NameConstraints structure described in ",(0,i.jsx)(s.a,{href:"https://datatracker.ietf.org/doc/html/rfc5280",children:"RFC5280"})]}),"\n",(0,i.jsx)(s.h2,{id:"extends",children:"Extends"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})})}),"\n"]}),"\n",(0,i.jsx)(s.h2,{id:"implements",children:"Implements"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:(0,i.jsx)(s.a,{href:"/docs/api/interfaces/INameConstraints",children:(0,i.jsx)(s.code,{children:"INameConstraints"})})}),"\n"]}),"\n",(0,i.jsx)(s.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(s.h3,{id:"new-nameconstraints",children:"new NameConstraints()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.strong,{children:"new NameConstraints"}),"(",(0,i.jsx)(s.code,{children:"parameters"}),"): ",(0,i.jsx)(s.a,{href:"/docs/api/classes/NameConstraints",children:(0,i.jsx)(s.code,{children:"NameConstraints"})})]}),"\n"]}),"\n",(0,i.jsxs)(s.p,{children:["Initializes a new instance of the ",(0,i.jsx)(s.a,{href:"/docs/api/classes/NameConstraints",children:"NameConstraints"})," class"]}),"\n",(0,i.jsx)(s.h4,{id:"parameters",children:"Parameters"}),"\n",(0,i.jsx)(s.h5,{id:"parameters-1",children:"parameters"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/globals#nameconstraintsparameters",children:(0,i.jsx)(s.code,{children:"NameConstraintsParameters"})})," = ",(0,i.jsx)(s.code,{children:"{}"})]}),"\n",(0,i.jsx)(s.p,{children:"Initialization parameters"}),"\n",(0,i.jsx)(s.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.a,{href:"/docs/api/classes/NameConstraints",children:(0,i.jsx)(s.code,{children:"NameConstraints"})})}),"\n",(0,i.jsx)(s.h4,{id:"overrides",children:"Overrides"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject#constructors",children:(0,i.jsx)(s.code,{children:"constructor"})})]}),"\n",(0,i.jsx)(s.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(s.h3,{id:"excludedsubtrees",children:"excludedSubtrees?"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"optional"})," ",(0,i.jsx)(s.strong,{children:"excludedSubtrees"}),": ",(0,i.jsx)(s.a,{href:"/docs/api/classes/GeneralSubtree",children:(0,i.jsx)(s.code,{children:"GeneralSubtree"})}),"[]"]}),"\n"]}),"\n",(0,i.jsx)(s.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/interfaces/INameConstraints",children:(0,i.jsx)(s.code,{children:"INameConstraints"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/interfaces/INameConstraints#excludedsubtrees",children:(0,i.jsx)(s.code,{children:"excludedSubtrees"})})]}),"\n",(0,i.jsx)(s.hr,{}),"\n",(0,i.jsx)(s.h3,{id:"permittedsubtrees",children:"permittedSubtrees?"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"optional"})," ",(0,i.jsx)(s.strong,{children:"permittedSubtrees"}),": ",(0,i.jsx)(s.a,{href:"/docs/api/classes/GeneralSubtree",children:(0,i.jsx)(s.code,{children:"GeneralSubtree"})}),"[]"]}),"\n"]}),"\n",(0,i.jsx)(s.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/interfaces/INameConstraints",children:(0,i.jsx)(s.code,{children:"INameConstraints"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/interfaces/INameConstraints#permittedsubtrees",children:(0,i.jsx)(s.code,{children:"permittedSubtrees"})})]}),"\n",(0,i.jsx)(s.hr,{}),"\n",(0,i.jsx)(s.h3,{id:"class_name",children:"CLASS_NAME"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"static"})," ",(0,i.jsx)(s.strong,{children:"CLASS_NAME"}),": ",(0,i.jsx)(s.code,{children:"string"})," = ",(0,i.jsx)(s.code,{children:'"NameConstraints"'})]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Name of the class"}),"\n",(0,i.jsx)(s.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject#class_name",children:(0,i.jsx)(s.code,{children:"CLASS_NAME"})})]}),"\n",(0,i.jsx)(s.h2,{id:"accessors",children:"Accessors"}),"\n",(0,i.jsx)(s.h3,{id:"classname",children:"className"}),"\n",(0,i.jsx)(s.h4,{id:"get-signature",children:"Get Signature"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.strong,{children:"get"})," ",(0,i.jsx)(s.strong,{children:"className"}),"(): ",(0,i.jsx)(s.code,{children:"string"})]}),"\n"]}),"\n",(0,i.jsx)(s.h5,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"string"})}),"\n",(0,i.jsx)(s.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject#classname",children:(0,i.jsx)(s.code,{children:"className"})})]}),"\n",(0,i.jsx)(s.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(s.h3,{id:"fromschema",children:"fromSchema()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.strong,{children:"fromSchema"}),"(",(0,i.jsx)(s.code,{children:"schema"}),"): ",(0,i.jsx)(s.code,{children:"void"})]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Converts parsed ASN.1 object into current class"}),"\n",(0,i.jsx)(s.h4,{id:"parameters-2",children:"Parameters"}),"\n",(0,i.jsx)(s.h5,{id:"schema",children:"schema"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"any"})}),"\n",(0,i.jsx)(s.p,{children:"ASN.1 schema"}),"\n",(0,i.jsx)(s.h4,{id:"returns-2",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"void"})}),"\n",(0,i.jsx)(s.h4,{id:"overrides-2",children:"Overrides"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject#fromschema",children:(0,i.jsx)(s.code,{children:"fromSchema"})})]}),"\n",(0,i.jsx)(s.hr,{}),"\n",(0,i.jsx)(s.h3,{id:"tojson",children:"toJSON()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.strong,{children:"toJSON"}),"(): ",(0,i.jsx)(s.a,{href:"/docs/api/interfaces/NameConstraintsJson",children:(0,i.jsx)(s.code,{children:"NameConstraintsJson"})})]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Converts the class to JSON object"}),"\n",(0,i.jsx)(s.h4,{id:"returns-3",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.a,{href:"/docs/api/interfaces/NameConstraintsJson",children:(0,i.jsx)(s.code,{children:"NameConstraintsJson"})})}),"\n",(0,i.jsx)(s.p,{children:"JSON object"}),"\n",(0,i.jsx)(s.h4,{id:"overrides-3",children:"Overrides"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject#tojson",children:(0,i.jsx)(s.code,{children:"toJSON"})})]}),"\n",(0,i.jsx)(s.hr,{}),"\n",(0,i.jsx)(s.h3,{id:"toschema",children:"toSchema()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.strong,{children:"toSchema"}),"(): ",(0,i.jsx)(s.code,{children:"Sequence"})]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Converts current object to ASN.1 object and sets correct values"}),"\n",(0,i.jsx)(s.h4,{id:"returns-4",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"Sequence"})}),"\n",(0,i.jsx)(s.p,{children:"ASN.1 object"}),"\n",(0,i.jsx)(s.h4,{id:"overrides-4",children:"Overrides"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject#toschema",children:(0,i.jsx)(s.code,{children:"toSchema"})})]}),"\n",(0,i.jsx)(s.hr,{}),"\n",(0,i.jsx)(s.h3,{id:"tostring",children:"toString()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.strong,{children:"toString"}),"(",(0,i.jsx)(s.code,{children:"encoding"}),"): ",(0,i.jsx)(s.code,{children:"string"})]}),"\n"]}),"\n",(0,i.jsx)(s.h4,{id:"parameters-3",children:"Parameters"}),"\n",(0,i.jsx)(s.h5,{id:"encoding",children:"encoding"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:'"base64"'})," | ",(0,i.jsx)(s.code,{children:'"base64url"'})," | ",(0,i.jsx)(s.code,{children:'"hex"'})]}),"\n",(0,i.jsx)(s.h4,{id:"returns-5",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"string"})}),"\n",(0,i.jsx)(s.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject#tostring",children:(0,i.jsx)(s.code,{children:"toString"})})]}),"\n",(0,i.jsx)(s.hr,{}),"\n",(0,i.jsx)(s.h3,{id:"blockname",children:"blockName()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"static"})," ",(0,i.jsx)(s.strong,{children:"blockName"}),"(): ",(0,i.jsx)(s.code,{children:"string"})]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Returns block name"}),"\n",(0,i.jsx)(s.h4,{id:"returns-6",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"string"})}),"\n",(0,i.jsx)(s.p,{children:"Returns string block name"}),"\n",(0,i.jsx)(s.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject#blockname",children:(0,i.jsx)(s.code,{children:"blockName"})})]}),"\n",(0,i.jsx)(s.hr,{}),"\n",(0,i.jsx)(s.h3,{id:"defaultvalues",children:"defaultValues()"}),"\n",(0,i.jsx)(s.h4,{id:"call-signature",children:"Call Signature"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"static"})," ",(0,i.jsx)(s.strong,{children:"defaultValues"}),"(",(0,i.jsx)(s.code,{children:"memberName"}),"): ",(0,i.jsx)(s.a,{href:"/docs/api/classes/GeneralSubtree",children:(0,i.jsx)(s.code,{children:"GeneralSubtree"})}),"[]"]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Returns default values for all class members"}),"\n",(0,i.jsx)(s.h5,{id:"parameters-4",children:"Parameters"}),"\n",(0,i.jsx)(s.h6,{id:"membername",children:"memberName"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:'"permittedSubtrees"'})}),"\n",(0,i.jsx)(s.p,{children:"String name for a class member"}),"\n",(0,i.jsx)(s.h5,{id:"returns-7",children:"Returns"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/GeneralSubtree",children:(0,i.jsx)(s.code,{children:"GeneralSubtree"})}),"[]"]}),"\n",(0,i.jsx)(s.p,{children:"Default value"}),"\n",(0,i.jsx)(s.h5,{id:"overrides-5",children:"Overrides"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject#defaultvalues",children:(0,i.jsx)(s.code,{children:"defaultValues"})})]}),"\n",(0,i.jsx)(s.h4,{id:"call-signature-1",children:"Call Signature"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"static"})," ",(0,i.jsx)(s.strong,{children:"defaultValues"}),"(",(0,i.jsx)(s.code,{children:"memberName"}),"): ",(0,i.jsx)(s.a,{href:"/docs/api/classes/GeneralSubtree",children:(0,i.jsx)(s.code,{children:"GeneralSubtree"})}),"[]"]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Returns default values for all class members"}),"\n",(0,i.jsx)(s.h5,{id:"parameters-5",children:"Parameters"}),"\n",(0,i.jsx)(s.h6,{id:"membername-1",children:"memberName"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:'"excludedSubtrees"'})}),"\n",(0,i.jsx)(s.p,{children:"String name for a class member"}),"\n",(0,i.jsx)(s.h5,{id:"returns-8",children:"Returns"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/GeneralSubtree",children:(0,i.jsx)(s.code,{children:"GeneralSubtree"})}),"[]"]}),"\n",(0,i.jsx)(s.p,{children:"Default value"}),"\n",(0,i.jsx)(s.h5,{id:"overrides-6",children:"Overrides"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"PkiObject.defaultValues"})}),"\n",(0,i.jsx)(s.hr,{}),"\n",(0,i.jsx)(s.h3,{id:"fromber",children:"fromBER()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"static"})," ",(0,i.jsx)(s.strong,{children:"fromBER"}),"<",(0,i.jsx)(s.code,{children:"T"}),">(",(0,i.jsx)(s.code,{children:"this"}),", ",(0,i.jsx)(s.code,{children:"raw"}),"): ",(0,i.jsx)(s.code,{children:"T"})]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Creates PKI object from the raw data"}),"\n",(0,i.jsx)(s.h4,{id:"type-parameters",children:"Type Parameters"}),"\n",(0,i.jsxs)(s.p,{children:["\u2022 ",(0,i.jsx)(s.strong,{children:"T"})," ",(0,i.jsx)(s.em,{children:"extends"})," ",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})})]}),"\n",(0,i.jsx)(s.h4,{id:"parameters-6",children:"Parameters"}),"\n",(0,i.jsx)(s.h5,{id:"this",children:"this"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"PkiObjectConstructor"}),"<",(0,i.jsx)(s.code,{children:"T"}),">"]}),"\n",(0,i.jsx)(s.h5,{id:"raw",children:"raw"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"BufferSource"})}),"\n",(0,i.jsx)(s.p,{children:"ASN.1 encoded raw data"}),"\n",(0,i.jsx)(s.h4,{id:"returns-9",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"T"})}),"\n",(0,i.jsx)(s.p,{children:"Initialized and filled current class object"}),"\n",(0,i.jsx)(s.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject#fromber",children:(0,i.jsx)(s.code,{children:"fromBER"})})]}),"\n",(0,i.jsx)(s.hr,{}),"\n",(0,i.jsx)(s.h3,{id:"schema-1",children:"schema()"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.code,{children:"static"})," ",(0,i.jsx)(s.strong,{children:"schema"}),"(",(0,i.jsx)(s.code,{children:"parameters"}),"): ",(0,i.jsx)(s.code,{children:"any"})]}),"\n"]}),"\n",(0,i.jsx)(s.p,{children:"Returns value of pre-defined ASN.1 schema for current class"}),"\n",(0,i.jsx)(s.h4,{id:"parameters-7",children:"Parameters"}),"\n",(0,i.jsx)(s.h5,{id:"parameters-8",children:"parameters"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/interfaces/SchemaParameters",children:(0,i.jsx)(s.code,{children:"SchemaParameters"})}),"<{ ",(0,i.jsx)(s.code,{children:"excludedSubtrees"}),": ",(0,i.jsx)(s.code,{children:"string"}),"; ",(0,i.jsx)(s.code,{children:"permittedSubtrees"}),": ",(0,i.jsx)(s.code,{children:"string"}),"; }> = ",(0,i.jsx)(s.code,{children:"{}"})]}),"\n",(0,i.jsx)(s.p,{children:"Input parameters for the schema"}),"\n",(0,i.jsx)(s.h4,{id:"returns-10",children:"Returns"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"any"})}),"\n",(0,i.jsx)(s.p,{children:"ASN.1 schema object"}),"\n",(0,i.jsx)(s.h4,{id:"overrides-7",children:"Overrides"}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject",children:(0,i.jsx)(s.code,{children:"PkiObject"})}),".",(0,i.jsx)(s.a,{href:"/docs/api/classes/PkiObject#schema-1",children:(0,i.jsx)(s.code,{children:"schema"})})]})]})}function o(e={}){const{wrapper:s}={...(0,c.R)(),...e.components};return s?(0,i.jsx)(s,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}}}]);