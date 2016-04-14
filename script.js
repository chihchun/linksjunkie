
setTimeout(function(){
    var linkdata = {};
    linkdata.title = window.document.title;
    linkdata.text = window.document.title;
    linkdata.url = window.location.href;

    var sel = window.getSelection().toString();
    if(sel != '')
        linkdata.text = sel;

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
