import{h as ie}from"./chunk-Y5JEGQKB.js";import{ga as X,ha as y,ia as Y,ka as Z,ma as ee}from"./chunk-ZXANPB2F.js";import{$a as D,Bb as d,Cb as r,Cc as U,Db as R,Eb as B,Ec as G,Gc as J,Hb as T,Ja as P,Jb as w,Kb as k,Kc as W,Ma as s,Nb as N,Ob as Q,P as $,Pb as K,Q as E,V,Vb as L,Xa as S,Ya as F,aa as M,ba as p,bb as j,ca as l,cb as m,fa as C,ic as q,jb as _,ka as b,kb as c,lb as z,mc as H,nb as A,ob as f,tb as h,ub as g,vb as O,wb as x,xb as I,zb as u}from"./chunk-TX7UWVJS.js";var te=["removeicon"],oe=["*"];function re(e,a){if(e&1){let i=u();h(0,"img",4),d("error",function(t){p(i);let o=r();return l(o.imageError(t))}),g()}if(e&2){let i=r();c("src",i.image,P)("alt",i.alt)}}function ce(e,a){if(e&1&&O(0,"span",6),e&2){let i=r(2);f(i.icon),c("ngClass","p-chip-icon"),_("data-pc-section","icon")}}function ae(e,a){if(e&1&&m(0,ce,1,4,"span",5),e&2){let i=r();c("ngIf",i.icon)}}function se(e,a){if(e&1&&(h(0,"div",7),Q(1),g()),e&2){let i=r();_("data-pc-section","label"),s(),K(i.label)}}function pe(e,a){if(e&1){let i=u();h(0,"span",11),d("click",function(t){p(i);let o=r(3);return l(o.close(t))})("keydown",function(t){p(i);let o=r(3);return l(o.onKeydown(t))}),g()}if(e&2){let i=r(3);f(i.removeIcon),c("ngClass","p-chip-remove-icon"),_("data-pc-section","removeicon")("aria-label",i.removeAriaLabel)}}function le(e,a){if(e&1){let i=u();h(0,"TimesCircleIcon",12),d("click",function(t){p(i);let o=r(3);return l(o.close(t))})("keydown",function(t){p(i);let o=r(3);return l(o.onKeydown(t))}),g()}if(e&2){let i=r(3);f("p-chip-remove-icon"),_("data-pc-section","removeicon")("aria-label",i.removeAriaLabel)}}function me(e,a){if(e&1&&(x(0),m(1,pe,1,5,"span",9)(2,le,1,4,"TimesCircleIcon",10),I()),e&2){let i=r(2);s(),c("ngIf",i.removeIcon),s(),c("ngIf",!i.removeIcon)}}function _e(e,a){}function he(e,a){e&1&&m(0,_e,0,0,"ng-template")}function ge(e,a){if(e&1){let i=u();h(0,"span",13),d("click",function(t){p(i);let o=r(2);return l(o.close(t))})("keydown",function(t){p(i);let o=r(2);return l(o.onKeydown(t))}),m(1,he,1,0,null,14),g()}if(e&2){let i=r(2);_("data-pc-section","removeicon")("aria-label",i.removeAriaLabel),s(),c("ngTemplateOutlet",i.removeIconTemplate||i._removeIconTemplate)}}function fe(e,a){if(e&1&&(x(0),m(1,me,3,2,"ng-container",3)(2,ge,2,3,"span",8),I()),e&2){let i=r();s(),c("ngIf",!i.removeIconTemplate&&!i._removeIconTemplate),s(),c("ngIf",i.removeIconTemplate||i._removeIconTemplate)}}var ue=({dt:e})=>`
.p-chip {
    display: inline-flex;
    align-items: center;
    background: ${e("chip.background")};
    color: ${e("chip.color")};
    border-radius: ${e("chip.border.radius")};
    padding: ${e("chip.padding.y")} ${e("chip.padding.x")};
    gap: ${e("chip.gap")};
}

.p-chip-icon {
    color: ${e("chip.icon.color")};
    font-size: ${e("chip.icon.font.size")};
    width: ${e("chip.icon.size")};
    height: ${e("chip.icon.size")};
}

.p-chip-image {
    border-radius: 50%;
    width: ${e("chip.image.width")};
    height: ${e("chip.image.height")};
    margin-left: calc(-1 * ${e("chip.padding.y")});
}

.p-chip:has(.p-chip-remove-icon) {
    padding-inline-end: ${e("chip.padding.y")};
}

.p-chip:has(.p-chip-image) {
    padding-top: calc(${e("chip.padding.y")} / 2);
    padding-bottom: calc(${e("chip.padding.y")} / 2);
}

.p-chip-remove-icon {
    cursor: pointer;
    font-size: ${e("chip.remove.icon.font.size")};
    width: ${e("chip.remove.icon.size")};
    height: ${e("chip.remove.icon.size")};
    color: ${e("chip.remove.icon.color")};
    border-radius: 50%;
    transition: outline-color ${e("chip.transition.duration")}, box-shadow ${e("chip.transition.duration")};
    outline-color: transparent;
}

.p-chip-remove-icon:focus-visible {
    box-shadow: ${e("chip.remove.icon.focus.ring.shadow")};
    outline: ${e("chip.remove.icon.focus.ring.width")} ${e("chip.remove.icon.focus.ring.style")} ${e("chip.remove.icon.focus.ring.color")};
    outline-offset: ${e("chip.remove.icon.focus.ring.offset")};
}
`,de={root:"p-chip p-component",image:"p-chip-image",icon:"p-chip-icon",label:"p-chip-label",removeIcon:"p-chip-remove-icon"},ne=(()=>{class e extends Z{name="chip";theme=ue;classes=de;static \u0275fac=(()=>{let i;return function(t){return(i||(i=C(e)))(t||e)}})();static \u0275prov=$({token:e,factory:e.\u0275fac})}return e})();var ve=(()=>{class e extends ee{label;icon;image;alt;style;styleClass;removable=!1;removeIcon;onRemove=new b;onImageError=new b;visible=!0;get removeAriaLabel(){return this.config.getTranslation(Y.ARIA).removeLabel}get chipProps(){return this._chipProps}set chipProps(i){this._chipProps=i,i&&typeof i=="object"&&Object.entries(i).forEach(([n,t])=>this[`_${n}`]!==t&&(this[`_${n}`]=t))}_chipProps;_componentStyle=V(ne);removeIconTemplate;templates;_removeIconTemplate;ngAfterContentInit(){this.templates.forEach(i=>{switch(i.getType()){case"removeicon":this._removeIconTemplate=i.template;break;default:this._removeIconTemplate=i.template;break}})}ngOnChanges(i){if(super.ngOnChanges(i),i.chipProps&&i.chipProps.currentValue){let{currentValue:n}=i.chipProps;n.label!==void 0&&(this.label=n.label),n.icon!==void 0&&(this.icon=n.icon),n.image!==void 0&&(this.image=n.image),n.alt!==void 0&&(this.alt=n.alt),n.style!==void 0&&(this.style=n.style),n.styleClass!==void 0&&(this.styleClass=n.styleClass),n.removable!==void 0&&(this.removable=n.removable),n.removeIcon!==void 0&&(this.removeIcon=n.removeIcon)}}containerClass(){let i="p-chip p-component";return this.styleClass&&(i+=` ${this.styleClass}`),i}close(i){this.visible=!1,this.onRemove.emit(i)}onKeydown(i){(i.key==="Enter"||i.key==="Backspace")&&this.close(i)}imageError(i){this.onImageError.emit(i)}static \u0275fac=(()=>{let i;return function(t){return(i||(i=C(e)))(t||e)}})();static \u0275cmp=S({type:e,selectors:[["p-chip"]],contentQueries:function(n,t,o){if(n&1&&(T(o,te,4),T(o,X,4)),n&2){let v;w(v=k())&&(t.removeIconTemplate=v.first),w(v=k())&&(t.templates=v)}},hostVars:9,hostBindings:function(n,t){n&2&&(_("data-pc-name","chip")("aria-label",t.label)("data-pc-section","root"),A(t.style),f(t.containerClass()),z("display",!t.visible&&"none"))},inputs:{label:"label",icon:"icon",image:"image",alt:"alt",style:"style",styleClass:"styleClass",removable:[2,"removable","removable",H],removeIcon:"removeIcon",chipProps:"chipProps"},outputs:{onRemove:"onRemove",onImageError:"onImageError"},features:[L([ne]),j,D,M],ngContentSelectors:oe,decls:6,vars:4,consts:[["iconTemplate",""],["class","p-chip-image",3,"src","alt","error",4,"ngIf","ngIfElse"],["class","p-chip-label",4,"ngIf"],[4,"ngIf"],[1,"p-chip-image",3,"error","src","alt"],[3,"class","ngClass",4,"ngIf"],[3,"ngClass"],[1,"p-chip-label"],["tabindex","0","class","p-chip-remove-icon","role","button",3,"click","keydown",4,"ngIf"],["tabindex","0","role","button",3,"class","ngClass","click","keydown",4,"ngIf"],["tabindex","0","role","button",3,"class","click","keydown",4,"ngIf"],["tabindex","0","role","button",3,"click","keydown","ngClass"],["tabindex","0","role","button",3,"click","keydown"],["tabindex","0","role","button",1,"p-chip-remove-icon",3,"click","keydown"],[4,"ngTemplateOutlet"]],template:function(n,t){if(n&1&&(R(),B(0),m(1,re,1,2,"img",1)(2,ae,1,1,"ng-template",null,0,q)(4,se,2,2,"div",2)(5,fe,3,2,"ng-container",3)),n&2){let o=N(3);s(),c("ngIf",t.image)("ngIfElse",o),s(3),c("ngIf",t.label),s(),c("ngIf",t.removable)}},dependencies:[W,U,G,J,ie,y],encapsulation:2,changeDetection:0})}return e})(),ze=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=F({type:e});static \u0275inj=E({imports:[ve,y,y]})}return e})();export{ve as a,ze as b};
