import { XMLDoc, XMLNode } from "./types.ts";

export function parseXml(xml: string): XMLDoc|undefined {
    let doc = {} as XMLDoc;
    if (!xml) return doc;
    
    let doctype = /<!doctype .*?>/gi.exec(xml);
    if (doctype) {
        let idx = doctype.index;
        doc.type = "!" + xml.substring(idx+10,xml.indexOf(">",idx+10));
    }

    
    xml = xml.replace(/<!--.*?-->/g, "").replace(/<!doctype.*?>/gi, "").replace(/<(\?|.{0})xml .*?>/gi, "");
    i = 0;
    doc.root = parseTag(xml);
    return doc;
}

let i = 0;

function parseTag(xml: string): XMLNode {
    let node = {} as XMLNode;
    let currText = "";
    for (;i < xml.length; i++) {
        let char = xml[i];
        if (char === "<") {
            if (currText.trim()) {
                if (!node.sub) node.sub = [];
                node.sub.push(currText.trim());
                currText = "";
            }
            let closeIdx;
            switch (xml[i+1]) {
                case "/":
                    closeIdx = xml.indexOf(">",i);
                    if (closeIdx == -1) throw new XMLParserError(xml,i,"Tag not closed.");
                    let closeName = xml.substring(i+2,closeIdx);
                    if (closeName != node.tag) throw new XMLParserError(xml,i+2,"Tag names do not match.");
                    i += closeIdx-i;
                    currText = "";
                    return node;
                default:
                    if (node.tag) {
                        if (!node.sub) node.sub = [];
                        currText = "";
                        node.sub.push(parseTag(xml));
                        
                        continue;
                    }
                    closeIdx = xml.indexOf(">",i);
                    if (closeIdx == -1) throw new XMLParserError(xml,i,"Tag not closed.");
                    let name = xml.substring(i+1,closeIdx).trim();

                    if (name[name.length-1] == "/") {
                        node.close = true;
                        name = name.substring(0,name.length-1).trim();
                    }
                    let keys = "";
                    if (/\S+ +.+/.test(name)) {
                        keys = name.substring(name.indexOf(" ")).trim().replace(/"/g,"");
                        name = name.substring(0,name.indexOf(" ")).trim();
                    }
                    node.tag = name;
                    if (keys) {
                        let keyObj = {} as {[key:string]:string};
                        let key = "";
                        for (let j = 0; j < keys.length; j++) {
                            let keyChar = keys[j];
                            switch (keyChar) {
                                case "=":
                                    let value = "";
                                    j++;
                                    for (;j < keys.length; j++) {
                                        if (keys[j] == " ") break;
                                        value += keys[j];
                                    }
                                    keyObj[key] = value;
                                    break;
                                default:
                                    key += keyChar;
                                    break;
                            }
                        }
                        node.keys = keyObj;
                    }
                    i += closeIdx-i;
                    if (node.close) return node;
                    break;
            }
            continue;
        }
        currText += char;
    }
    return node;
}

class XMLParserError extends Error {
    constructor(xml:string, idx: number, reason: string = "") {
        super("XML Parser Error at: " + idx + "\n" + xml.substr(idx,10) + "\n" + reason);
    }
}