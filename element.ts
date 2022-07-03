/* utils
 * ©2022 LJM12914. https://github.com/wheelsmake/utils
 * Licensed under MIT License. https://github.com/wheelsmake/utils/blob/main/LICENSE
*/
import * as utils from "./index";
export function e(s :string, scope? :Element | Document) :Node[] | Node{
    if(scope === undefined || !(scope instanceof Element)) scope = document;
        let a :NodeList = scope.querySelectorAll(s);
        if(!a.length) return [];
        //note:当一个页面存在相同ID元素时不会走这里，而会返回数组，因为说好了是querySelectorAll了并且本来就不应该有重复ID，不能怪我啊
        if(a.length == 1 && s.match(/^.*#[^\s]*$/)) return a[0];
        else return Array.from(a);
}
export function isDescendant(possibleDescendant :Element, possibleParent :Element) :boolean{
    while(possibleDescendant.tagName != "HTML"){
        possibleDescendant = possibleDescendant.parentNode! as Element;
        if(possibleDescendant === possibleParent) return true; 
    }
    return false;
}
export function isInDocument(element :Element) :boolean{
    return isDescendant(element, (e("html") as Node[])[0] as Element);
}
export function isChild(element :Element, target :Element) :boolean{
    const children = target.childNodes;
    for(let i = 0; i < children.length; i++) if(element === children[i]) return true;
    return false;
}
export function toHTML(HTML :string) :Node[]{
    if(HTML === "" || typeof HTML != "string") utils.generic.E("HTML", "string", HTML);
    const ele = document.createElement("div");
    ele.innerHTML = HTML;
    return getInnerNodes(ele);
}
export function getInnerNodes(el :Node | Element) :Node[]{
    var nodes :Node[] = [];
    for(let i = 0; i < el.childNodes.length; i++) nodes[i] = el.childNodes[i].cloneNode(true);
    return nodes;
}
//剥壳器
export function hatch(element :Element, remove? :boolean) :Node[]{
    //note:Nodelist类型会实时同步造成不稳定的for循环，必须转换为Node[]！
    const par = element.parentElement!, children :Node[] = Array.from(element.childNodes);
    for(let i = 0; i < children.length; i++) par.insertBefore(children[i], element);
    if(remove === true) element.remove();
    return children;
}
//最终渲染方法，老祖宗求你别出bug
export function render(HTML :string | Element | HTMLCollection | Element[] | Node | NodeList | Node[], element :Element, insertAfter? :boolean, append? :boolean, disableDF? :boolean) :Node[]{
    if(element.parentElement === null) utils.generic.EE("cannot render by '<html>' element, since it's root of document.");
    var html :Node[] = [];
    if(typeof HTML == "string") html = toHTML(HTML);
    else if(HTML instanceof Element || HTML instanceof Node) html[0] = HTML.cloneNode(true);
    else if(HTML instanceof HTMLCollection || HTML instanceof NodeList) for(let i = 0; i < HTML.length; i++) html[i] = HTML.item(i)!.cloneNode(true);
    else html = HTML;
    const Rhtml = [...html].reverse(), parent = element.parentElement;
    if(append === true) for(let i = 0; i < html.length; i++) element.append(html[i]);
    else if(append === false) for(let i = 0; i < Rhtml.length; i++) element.prepend(Rhtml[i]);
    else if(insertAfter === true){
        if(!element.nextSibling) for(let i = 0; i < Rhtml.length; i++) parent!.append(Rhtml[i]);
        else for(let i = 0; i < Rhtml.length; i++) parent!.insertBefore(Rhtml[i], element.nextSibling);
    }
    else if(insertAfter === false) for(let i = 0; i < html.length; i++) parent!.insertBefore(html[i], element);
    else for(let i = 0; i < html.length; i++) element.append(html[i]);
    //todo:加入作用域
    return html;
}