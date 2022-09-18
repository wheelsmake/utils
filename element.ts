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
/**@deprecated use `Node.contains` instead.*/
export function isDescendant(possibleDescendant :Node, possibleParent :Node) :boolean{
    return possibleParent.contains(possibleDescendant);
    /*while(
        possibleDescendant instanceof Text
     || (possibleDescendant instanceof Element && possibleDescendant.tagName != "HTML")
    ){
        possibleDescendant = possibleDescendant.parentNode! as Element;
        if(possibleDescendant === possibleParent) return true; 
    }
    return false;*/
}
export function isInDocument(node :Node) :boolean{
    return ((e("html") as Node[])[0]).contains(node);
    //return isDescendant(element, (e("html") as Node[])[0] as Element);
}
export function isChild(node :Node, target :Element) :boolean{
    return Array.from(target.childNodes).indexOf(node as ChildNode) != -1;
    /*const children = target.childNodes;
    for(let i = 0; i < children.length; i++) if(element === children[i]) return true;
    return false;*/
}
export function toHTML(HTML :string) :Node[]{
    if(HTML === "" || typeof HTML != "string") utils.generic.E("HTML", "string", HTML);
    const ele = document.createElement("div");
    ele.innerHTML = HTML;
    return getInnerNodesClone(ele);
}
export function getInnerNodesClone(el :Node) :Node[]{
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
//fixme:这个方法特异性太强了吧，能不能不要放在这里？
//最终渲染方法，老祖宗求你别出bug
export function render(
    HTML :string | Element | HTMLCollection | Element[] | Node | NodeList | Node[],
    element :Element,
    insertAfter? :boolean,
    append? :boolean
) :Node[]{
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
/****!PURE 非纯函数**
 * 
 * 检测某个文本节点是否为垃圾文本节点（即缩进造成的文本节点）
 * 
 * 这种文本节点会造成 vDOM 大小明显变大，必须处理
 * 
 * 如果全部垃圾，那么就直接删除这个节点并返回 `null`
 * 
 * 如果不完全垃圾，那么删除垃圾部分并返回剩下的 `textContent`
 * 
 * 如果没有垃圾或**被判定为豁免节点**，那么直接返回 `textContent`
 */
 export function processNLIText(textNode :Text) :string | null{
    //fixme:存在末尾\n文本节点被浏览器自动加回去的问题（但并未影响vDOM）
    const textContent = textNode.textContent!,
          //这个是用来标记原字符串是否需要处理的
          signContent = textContent.replace(/\n\s*/g, ""), //只有\n也要删
          parent = textNode.parentElement as Element; //replace不改动原字符串
    //排除可编辑内容的元素的内容
    const des = document.designMode;
    if(
        (parent !== null && parent.tagName == "TEXTAREA")
     || (parent instanceof HTMLElement && parent.isContentEditable)
     || (des == "on" || des == "ON" /*|| des == "inherit"*/) //inherit基本只出现在IE，不管它
    ) return textContent;
    else{
        if(signContent === ""){ //完全就是垃圾节点
            textNode.remove();
            return null;
        }
        else if(signContent !== textContent){ //部分垃圾
            textNode.textContent = textContent.replace(/\n\s*/g, " "); //更新文本节点，插入空格，保持视觉效果
            return textNode.textContent; //fixed:signContent和textContent都不一样，干嘛返回signContent啊
        }
        else return textContent; //没有垃圾
    }
}