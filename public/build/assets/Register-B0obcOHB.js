import{T as g,e as f,o as c,b as e,u as o,Z as _,w as l,a,z as w,f as v,g as d,A as y,n as V,F as h}from"./app-DO3oQ17b.js";import{A as k}from"./AuthenticationCard-DJah-Am5.js";import{_ as x}from"./AuthenticationCardLogo-CgkAGPoP.js";import{_ as b}from"./Checkbox-C4hqvzLV.js";import{_ as u,a as i}from"./TextInput-CVrD9EP0.js";import{_ as m}from"./InputLabel-DH8_nRDZ.js";import{_ as $}from"./PrimaryButton-bDSn7Ivh.js";import"./_plugin-vue_export-helper-DlAUqK2U.js";const P={class:"mt-4"},q={class:"mt-4"},A={class:"mt-4"},C={key:0,class:"mt-4"},N={class:"flex items-center"},U={class:"ms-2"},F=["href"],T=["href"],B={class:"flex items-center justify-end mt-4"},G={__name:"Register",setup(R){const s=g({name:"",email:"",password:"",password_confirmation:"",terms:!1}),p=()=>{s.post(route("register"),{onFinish:()=>s.reset("password","password_confirmation")})};return(n,r)=>(c(),f(h,null,[e(o(_),{title:"Register"}),e(k,null,{logo:l(()=>[e(x)]),default:l(()=>[a("form",{onSubmit:w(p,["prevent"])},[a("div",null,[e(m,{for:"name",value:"Name"}),e(u,{id:"name",modelValue:o(s).name,"onUpdate:modelValue":r[0]||(r[0]=t=>o(s).name=t),type:"text",class:"mt-1 block w-full",required:"",autofocus:"",autocomplete:"name"},null,8,["modelValue"]),e(i,{class:"mt-2",message:o(s).errors.name},null,8,["message"])]),a("div",P,[e(m,{for:"email",value:"Email"}),e(u,{id:"email",modelValue:o(s).email,"onUpdate:modelValue":r[1]||(r[1]=t=>o(s).email=t),type:"email",class:"mt-1 block w-full",required:"",autocomplete:"username"},null,8,["modelValue"]),e(i,{class:"mt-2",message:o(s).errors.email},null,8,["message"])]),a("div",q,[e(m,{for:"password",value:"Password"}),e(u,{id:"password",modelValue:o(s).password,"onUpdate:modelValue":r[2]||(r[2]=t=>o(s).password=t),type:"password",class:"mt-1 block w-full",required:"",autocomplete:"new-password"},null,8,["modelValue"]),e(i,{class:"mt-2",message:o(s).errors.password},null,8,["message"])]),a("div",A,[e(m,{for:"password_confirmation",value:"Confirm Password"}),e(u,{id:"password_confirmation",modelValue:o(s).password_confirmation,"onUpdate:modelValue":r[3]||(r[3]=t=>o(s).password_confirmation=t),type:"password",class:"mt-1 block w-full",required:"",autocomplete:"new-password"},null,8,["modelValue"]),e(i,{class:"mt-2",message:o(s).errors.password_confirmation},null,8,["message"])]),n.$page.props.jetstream.hasTermsAndPrivacyPolicyFeature?(c(),f("div",C,[e(m,{for:"terms"},{default:l(()=>[a("div",N,[e(b,{id:"terms",checked:o(s).terms,"onUpdate:checked":r[4]||(r[4]=t=>o(s).terms=t),name:"terms",required:""},null,8,["checked"]),a("div",U,[r[5]||(r[5]=d(" I agree to the ")),a("a",{target:"_blank",href:n.route("terms.show"),class:"underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"},"Terms of Service",8,F),r[6]||(r[6]=d(" and ")),a("a",{target:"_blank",href:n.route("policy.show"),class:"underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"},"Privacy Policy",8,T)])]),e(i,{class:"mt-2",message:o(s).errors.terms},null,8,["message"])]),_:1})])):v("",!0),a("div",B,[e(o(y),{href:n.route("login"),class:"underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"},{default:l(()=>r[7]||(r[7]=[d(" Already registered? ")])),_:1},8,["href"]),e($,{class:V(["ms-4",{"opacity-25":o(s).processing}]),disabled:o(s).processing},{default:l(()=>r[8]||(r[8]=[d(" Register ")])),_:1},8,["class","disabled"])])],32)]),_:1})],64))}};export{G as default};
