"use strict";(self.webpackChunkgolf_simulator_analysis_client=self.webpackChunkgolf_simulator_analysis_client||[]).push([[22],{40379:(e,a,t)=>{t.d(a,{A:()=>r});var n=t(65471),s=t(44414);const r=(0,n.A)((0,s.jsx)("path",{d:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"}),"Edit")},48089:(e,a,t)=>{t.d(a,{A:()=>j});var n=t(58168),s=t(98587),r=t(9950),i=t(72004),l=t(88465),o=t(59254),c=t(18463),d=t(2235),m=t(1763),x=t(423);function h(e){return(0,x.Ay)("MuiCard",e)}(0,m.A)("MuiCard",["root"]);var u=t(44414);const A=["className","raised"],p=(0,o.Ay)(d.A,{name:"MuiCard",slot:"Root",overridesResolver:(e,a)=>a.root})((()=>({overflow:"hidden"}))),j=r.forwardRef((function(e,a){const t=(0,c.b)({props:e,name:"MuiCard"}),{className:r,raised:o=!1}=t,d=(0,s.A)(t,A),m=(0,n.A)({},t,{raised:o}),x=(e=>{const{classes:a}=e;return(0,l.A)({root:["root"]},h,a)})(m);return(0,u.jsx)(p,(0,n.A)({className:(0,i.A)(x.root,r),elevation:o?8:void 0,ref:a,ownerState:m},d))}))},50704:(e,a,t)=>{t.d(a,{A:()=>p});var n=t(58168),s=t(98587),r=t(9950),i=t(72004),l=t(88465),o=t(59254),c=t(18463),d=t(1763),m=t(423);function x(e){return(0,m.Ay)("MuiCardContent",e)}(0,d.A)("MuiCardContent",["root"]);var h=t(44414);const u=["className","component"],A=(0,o.Ay)("div",{name:"MuiCardContent",slot:"Root",overridesResolver:(e,a)=>a.root})((()=>({padding:16,"&:last-child":{paddingBottom:24}}))),p=r.forwardRef((function(e,a){const t=(0,c.b)({props:e,name:"MuiCardContent"}),{className:r,component:o="div"}=t,d=(0,s.A)(t,u),m=(0,n.A)({},t,{component:o}),p=(e=>{const{classes:a}=e;return(0,l.A)({root:["root"]},x,a)})(m);return(0,h.jsx)(A,(0,n.A)({as:o,className:(0,i.A)(p.root,r),ownerState:m,ref:a},d))}))},68022:(e,a,t)=>{t.r(a),t.d(a,{default:()=>b});var n=t(9950),s=t(16491),r=t(46639),i=t(82053),l=t(60899),o=t(2235),c=t(41413),d=t(18216),m=t(8145),x=t(74745),h=t(48089),u=t(50704),A=t(98785),p=t(33174),j=t(65471),v=t(44414);const y=(0,j.A)((0,v.jsx)("path",{d:"M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12z"}),"Cancel");var f=t(40379),g=t(72934);const b=e=>{let{user:a}=e;const[t,j]=(0,n.useState)(null),[b,C]=(0,n.useState)(!1),[N,H]=(0,n.useState)(!1),[_,M]=(0,n.useState)(""),[S,w]=(0,n.useState)(""),[R,D]=(0,n.useState)({fullName:"",email:"",handicap:"",targetHandicap:""});(0,n.useEffect)((()=>{a&&(j({fullName:a.full_name||"\uc0ac\uc6a9\uc790",email:a.email||"user@example.com",username:a.username||"username",handicap:a.handicap||0,targetHandicap:a.target_handicap||0,joinDate:a.join_date?new Date(a.join_date).toLocaleDateString():"\uc54c \uc218 \uc5c6\uc74c",profileImage:a.profile_image||null}),D({fullName:a.full_name||"",email:a.email||"",handicap:a.handicap||"",targetHandicap:a.target_handicap||""}))}),[a]);const I=()=>{b&&D({fullName:t.fullName,email:t.email,handicap:t.handicap,targetHandicap:t.targetHandicap}),C(!b)},z=e=>{const{name:a,value:t}=e.target;D((e=>({...e,[a]:t})))};return t?(0,v.jsxs)(s.A,{children:[(0,v.jsx)(i.A,{variant:"h4",gutterBottom:!0,children:"\ub0b4 \ud504\ub85c\ud544"}),(0,v.jsx)(i.A,{variant:"body1",color:"text.secondary",paragraph:!0,children:"\uac1c\uc778 \uc815\ubcf4 \ubc0f \uace8\ud504 \ud1b5\uacc4\ub97c \uad00\ub9ac\ud558\uc138\uc694."}),(0,v.jsxs)(l.Ay,{container:!0,spacing:3,children:[(0,v.jsx)(l.Ay,{item:!0,xs:12,md:4,children:(0,v.jsxs)(o.A,{elevation:2,sx:{p:3,display:"flex",flexDirection:"column",alignItems:"center",borderRadius:2},children:[(0,v.jsx)(c.A,{src:t.profileImage||"/static/images/avatar/default.jpg",sx:{width:120,height:120,mb:2}}),(0,v.jsx)(i.A,{variant:"h5",children:t.fullName}),(0,v.jsxs)(i.A,{variant:"body1",color:"text.secondary",children:["@",t.username]}),(0,v.jsxs)(i.A,{variant:"body2",color:"text.secondary",sx:{mt:1},children:["\uac00\uc785\uc77c: ",t.joinDate]}),(0,v.jsx)(d.A,{variant:"outlined",startIcon:b?(0,v.jsx)(y,{}):(0,v.jsx)(f.A,{}),onClick:I,sx:{mt:2},children:b?"\ud3b8\uc9d1 \ucde8\uc18c":"\ud504\ub85c\ud544 \ud3b8\uc9d1"})]})}),(0,v.jsxs)(l.Ay,{item:!0,xs:12,md:8,children:[(0,v.jsx)(o.A,{elevation:2,sx:{p:3,borderRadius:2},children:b?(0,v.jsxs)(s.A,{component:"form",onSubmit:async e=>{e.preventDefault(),H(!0),M("");try{setTimeout((()=>{j((e=>({...e,fullName:R.fullName,email:R.email,handicap:R.handicap,targetHandicap:R.targetHandicap}))),w("\ud504\ub85c\ud544\uc774 \uc131\uacf5\uc801\uc73c\ub85c \uc5c5\ub370\uc774\ud2b8 \ub418\uc5c8\uc2b5\ub2c8\ub2e4."),C(!1),H(!1)}),1e3)}catch(a){console.error("\ud504\ub85c\ud544 \uc5c5\ub370\uc774\ud2b8 \uc5d0\ub7ec:",a),M(a.message||"\ud504\ub85c\ud544 \uc5c5\ub370\uc774\ud2b8\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4."),H(!1)}},children:[(0,v.jsx)(i.A,{variant:"h6",gutterBottom:!0,children:"\ud504\ub85c\ud544 \uc815\ubcf4 \uc218\uc815"}),(0,v.jsxs)(l.Ay,{container:!0,spacing:2,sx:{mt:1},children:[(0,v.jsx)(l.Ay,{item:!0,xs:12,children:(0,v.jsx)(m.A,{fullWidth:!0,label:"\uc774\ub984",name:"fullName",value:R.fullName,onChange:z})}),(0,v.jsx)(l.Ay,{item:!0,xs:12,children:(0,v.jsx)(m.A,{fullWidth:!0,label:"\uc774\uba54\uc77c",name:"email",value:R.email,onChange:z})}),(0,v.jsx)(l.Ay,{item:!0,xs:12,sm:6,children:(0,v.jsx)(m.A,{fullWidth:!0,label:"\ud604\uc7ac \ud578\ub514\ucea1",name:"handicap",type:"number",InputProps:{inputProps:{min:0,max:54,step:.1}},value:R.handicap,onChange:z})}),(0,v.jsx)(l.Ay,{item:!0,xs:12,sm:6,children:(0,v.jsx)(m.A,{fullWidth:!0,label:"\ubaa9\ud45c \ud578\ub514\ucea1",name:"targetHandicap",type:"number",InputProps:{inputProps:{min:0,max:54,step:.1}},value:R.targetHandicap,onChange:z})})]}),(0,v.jsxs)(s.A,{sx:{mt:3,display:"flex",justifyContent:"flex-end"},children:[(0,v.jsx)(d.A,{variant:"outlined",onClick:I,sx:{mr:1},children:"\ucde8\uc18c"}),(0,v.jsx)(d.A,{type:"submit",variant:"contained",startIcon:(0,v.jsx)(g.A,{}),disabled:N,children:N?"\uc800\uc7a5 \uc911...":"\uc800\uc7a5"})]})]}):(0,v.jsxs)(s.A,{children:[(0,v.jsx)(i.A,{variant:"h6",gutterBottom:!0,children:"\ud504\ub85c\ud544 \uc815\ubcf4"}),(0,v.jsxs)(l.Ay,{container:!0,spacing:2,sx:{mt:1},children:[(0,v.jsxs)(l.Ay,{item:!0,xs:12,sm:6,children:[(0,v.jsx)(i.A,{variant:"subtitle2",color:"text.secondary",children:"\uc774\ub984"}),(0,v.jsx)(i.A,{variant:"body1",children:t.fullName})]}),(0,v.jsxs)(l.Ay,{item:!0,xs:12,sm:6,children:[(0,v.jsx)(i.A,{variant:"subtitle2",color:"text.secondary",children:"\uc774\uba54\uc77c"}),(0,v.jsx)(i.A,{variant:"body1",children:t.email})]}),(0,v.jsx)(l.Ay,{item:!0,xs:12,children:(0,v.jsx)(x.A,{sx:{my:1}})}),(0,v.jsxs)(l.Ay,{item:!0,xs:12,sm:6,children:[(0,v.jsx)(i.A,{variant:"subtitle2",color:"text.secondary",children:"\ud604\uc7ac \ud578\ub514\ucea1"}),(0,v.jsx)(i.A,{variant:"body1",children:t.handicap})]}),(0,v.jsxs)(l.Ay,{item:!0,xs:12,sm:6,children:[(0,v.jsx)(i.A,{variant:"subtitle2",color:"text.secondary",children:"\ubaa9\ud45c \ud578\ub514\ucea1"}),(0,v.jsx)(i.A,{variant:"body1",children:t.targetHandicap||"\uc124\uc815\ub418\uc9c0 \uc54a\uc74c"})]})]})]})}),(0,v.jsx)(h.A,{sx:{mt:3,borderRadius:2},children:(0,v.jsxs)(u.A,{children:[(0,v.jsx)(i.A,{variant:"h6",gutterBottom:!0,children:"\ucd5c\uadfc \ud1b5\uacc4 \uc694\uc57d"}),(0,v.jsx)(i.A,{variant:"body2",color:"text.secondary",children:"\ucd5c\uadfc \ub77c\uc6b4\ub4dc \uae30\ubc18 \ud1b5\uacc4 \ub370\uc774\ud130\uac00 \uc5ec\uae30\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4."})]})})]})]}),(0,v.jsx)(A.A,{open:!!_,autoHideDuration:6e3,onClose:()=>M(""),anchorOrigin:{vertical:"bottom",horizontal:"right"},children:(0,v.jsx)(p.A,{onClose:()=>M(""),severity:"error",sx:{width:"100%"},children:_})}),(0,v.jsx)(A.A,{open:!!S,autoHideDuration:6e3,onClose:()=>w(""),anchorOrigin:{vertical:"bottom",horizontal:"right"},children:(0,v.jsx)(p.A,{onClose:()=>w(""),severity:"success",sx:{width:"100%"},children:S})})]}):(0,v.jsx)(s.A,{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"60vh",children:(0,v.jsx)(r.A,{})})}},72934:(e,a,t)=>{t.d(a,{A:()=>r});var n=t(65471),s=t(44414);const r=(0,n.A)((0,s.jsx)("path",{d:"M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m3-10H5V5h10z"}),"Save")}}]);