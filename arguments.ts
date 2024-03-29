﻿/* utils
 * ©2022 LJM12914. https://github.com/wheelsmake/utils
 * Licensed under MIT License. https://github.com/wheelsmake/utils/blob/main/LICENSE
*/
import * as utils from "./index";
/**一定会返回Element，void为报错hack*/
export function reduceToElement(input :Elementy) :Element | void{
    if(input instanceof Element) return input;
    else if(typeof input == "string"){
        const el = utils.element.e(input);
        if(el instanceof Node) return el as Element;
        else utils.generic.E("rootNode", "string | Element", input, "rootNode should be a VALID #id selector");
    }
    else utils.generic.E("rootNode", "string | Element", input, "rootNode should be a #id selector or an Element");
}
/**一定会返回Node，void为报错hack*/
export function reduceToNode(input :Nody) :Node | void{
    if(input instanceof Node) return input;
    else if(typeof input == "string"){
        const el = utils.element.e(input);
        if(el instanceof Node) return el;
        else utils.generic.E("rootNode", "string | Element", input, "rootNode should be a VALID #id selector");
    }
    else utils.generic.E("rootNode", "string | Element", input, "rootNode should be a #id selector or an Element");
}