function inCanonicalBlocklist (url) {
    var blocklist = [
        /^https:\/\/mail.google.com/i,
        /^https:\/\/www.draw.io/i
    ];

    var ret = false;
    blocklist.forEach(function(pattern, index) {
        if(pattern.test(url)) {
            ret = true;
        }
    });
    return ret;
}
function hexdump(buffer, blockSize) {
    blockSize = blockSize || 16;
    var lines = [];
    var hex = "0123456789ABCDEF";
    for (var b = 0; b < buffer.length; b += blockSize) {
        var block = buffer.slice(b, Math.min(b + blockSize, buffer.length));
        var addr = ("0000" + b.toString(16)).slice(-4);
        var codes = block.split('').map(function (ch) {
            var code = ch.charCodeAt(0);
            return " " + hex[(0xF0 & code) >> 4] + hex[0x0F & code];
        }).join("");
        codes += "   ".repeat(blockSize - block.length);
        var chars = block.replace(/[\x00-\x1F\x20]/g, '.');
        chars +=  " ".repeat(blockSize - block.length);
        lines.push(addr + " " + codes + "  " + chars);
    }
    return lines.join("\n");
}

setTimeout(function(){
    var linkdata = {};
    linkdata.title = window.document.title;
    linkdata.text = window.document.title;
    linkdata.url = window.location.href;

    var sel = window.getSelection().toString();
    if(sel != '')
        linkdata.text = sel;

    // clean line break at the end of string.
    linkdata.text = linkdata.text.replace(/[\r\n]+$/, '');

    if(!inCanonicalBlocklist(linkdata.url)) {
        var canonical = window.document.querySelector('link[rel=canonical],link[rel=shorturl],link[rel=shortlink]');
        if (canonical)
            linkdata.url = canonical.href;
    }

    chrome.runtime.sendMessage({action: "copyurl", linkdata: linkdata},
                function(response) {
                var lastError = chrome.runtime.lastError;
                if (lastError) {
                    console.log(lastError.message);
                }
            });
},100);
