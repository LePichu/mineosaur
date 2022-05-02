import { XMLDoc, XMLNode } from "./types.ts";

export function parseXon(xon: string): XMLDoc {
    let doc = {} as XMLDoc;
    if (!xon) return doc;
    
    xon = xon.replace(/\/\/.*?\n/g, "\n").replace(/\/\/.*?$/, "").replace(/\/\*[\s\S]*\*\//g, "\n").trim();
    
    if (xon.startsWith("!"))
        doc.type = xon.substring(1,xon.indexOf("\n")).trim();
    
    xon = xon.replace(/^!.*\n?/, "").trim().replace(/\s*\n\s*/g, "\n").replace(/\s+{/g," {");
    i = 0;
    doc.root = parseTag(xon);

    return doc;
}

let i = 0;

function parseTag(xon: string): XMLNode {
    let node = {} as XMLNode;
    let char = xon[i];
    if (char == "/") {
        node.close = true;
        i++
    }
    char = xon[i]
    
    if (/\s/.test(char)) {
        for (; i < xon.length; i++) {
            char = xon[i];
            if (!/\s/.test(char)) break;
        }
    }
    let name = "";
    for (; i < xon.length; i++) {
        if (/\s/.test(xon[i])) break;
        name += xon[i];
    }
    node.tag = name;
    
    char = xon[i]
    
    if (/\s/.test(char)) {
        for (; i < xon.length; i++) {
            char = xon[i];
            if (!/\s/.test(char)) break;
        }
    }
    i--
    
    for (; i < xon.length; i++) {
        char = xon[i];
        if (char == "\n" || char == "\r") break;
        if (/\s/.test(char)) continue;
        if (/({|")/.test(char)) break;
        let key = "";
        let value = "";
        for (; i < xon.length; i++) {
            char = xon[i];
            if (char == "=") {
                i += 2;
                for (; i < xon.length; i++) {
                    char = xon[i];
                    if (char == "\"")
                        break;
                    value += char;
                }
                break;
            }
            key += char;
        }
        if (!node.keys) node.keys = {};
        node.keys[key] = value;
        i++;
    }
    
    if (node.close) return node;
    
    if (char == "{") {
        i++;
        for (; i < xon.length; i++) {
            char = xon[i];
            if (char == "}") {
                i++;
                return node;
            }
            if (/\s/.test(char)) continue;
            if (char == "\"") {
                let idx = xon.indexOf("\"",i+1);
                let str = xon.substring(i+1,idx);
                if (!node.sub) node.sub = [];
                node.sub.push(str);
                i = idx;
                continue;
            }
            if (!node.sub) node.sub = [];
            node.sub.push(parseTag(xon));
            i--;
        }
    } else if (char == "\"") {
        let idx = xon.indexOf("\"",i+1);
        let str = xon.substring(i+1,idx);
        if (!node.sub) node.sub = [];
        node.sub.push(str);
        i = idx+1;
    }
    
    return node;
}

class XONParserError extends Error {
    constructor(xon:string, idx: number, reason: string = "") {
        super("XON Parser Error at: " + idx + "\n" + xon.substr(idx,10) + "\n" + reason);
    }
}