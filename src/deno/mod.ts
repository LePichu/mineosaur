import { Webview } from "https://deno.land/x/webview@0.7.0-pre.1/mod.ts";
const webview = new Webview();
webview.navigate(`data:text/html,${encodeURIComponent("")}`);
webview.title = "Mineosaur Client"
webview.run();