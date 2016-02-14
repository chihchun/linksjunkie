var interval = setInterval(function(){
    clearInterval(interval);
    var linkdata = {};
    linkdata.title = window.document.title;
    linkdata.text = window.document.title;
    linkdata.url = window.location.href;

    var sel = window.getSelection().toString();
    if(sel != '')
        linkdata.text = sel;

    var canonical = window.document.querySelector('link[rel=canonical],link[rel=shorturl],link[rel=shortlink]');
    if (canonical)
        linkdata.url = canonical.href;

    chrome.runtime.sendMessage({action: "copyurl", linkdata: linkdata});
},1500);
