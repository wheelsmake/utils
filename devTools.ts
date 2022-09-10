/* utils
 * ©2022 LJM12914. https://github.com/wheelsmake/utils
 * Licensed under MIT License. https://github.com/wheelsmake/utils/blob/main/LICENSE
*/
import * as utils from "./index";
//禁用开发者工具的hack变量
const cI = clearInterval;
export default class devTools{
    #dtInterval :number = 0;
    constructor(){
        this.disable();
    }
    enable() :void{
        (clearInterval as any) = cI;
        clearInterval(this.#dtInterval);
    }
    disable() :void{
        if(clearInterval !== cI) utils.generic.EE("DevTools has been disabled.");
        this.#dtInterval = (()=>{
            return setInterval(()=>{
                debugger;
            }, 20) as unknown as number; //怎么默认在NodeJS环境下呢？？？
        })();
        //hack clearInterval，让它不清除我们的这个 
        (clearInterval as any) = (id :number | undefined) :void=>{
            if(id != this.#dtInterval) cI.call(window, id);
        }
    }
}