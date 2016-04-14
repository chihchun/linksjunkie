function getDefaultShortcuts()
{
    return [
	{
	    enable    : true,
        name      : "Plain Text",
	    format    : '* %text% - %url%',
	},
    {
	    enable    : true,
        name      : "Markdown",
	    format    : '[%text%] (%url%)',
	},
	{
	    enable    : false,
        name      : "HTML",
	    format    : '<a href="%url%">%text%</a>',
	},
    {
	    enable    : false,
        name      : "MediaWiki",
	    format    : '[%url% %text%]',
	},
    {
	    enable    : false,
        name      : "TiddlyWiki",
	    format    : '[[%text%|%url%]]',
	},
    {
	    enable    : false,
        name      : "hyperlink for Google Sheet",
	    format    : '=hyperlink("%url%", "%text%")',
	}];
}

function getOptions (callback) {
    chrome.storage.sync.get({
      shortcuts: null,
    }, function(items) {
        var shortcuts = null;
        if(items.shortcuts == null) {
            shortcuts = getDefaultShortcuts();
        } else {
            shortcuts = JSON.parse(items.shortcuts);
        }
        callback(shortcuts);
    });

}

function getFormat(callback) {
    var format = getDefaultShortcuts()[0].format;
    chrome.storage.sync.get({
        default: null,
    }, function(items) {
        if(items.default != null) {
            format = items.default;
            // console.log("Get default format: " + format);
        }
        callback(format);
    });
}

function copyToClipBoard(text)
{
    textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.opacity = 0;
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy', false, null);
    document.body.removeChild(textarea);
}

function notify(message)
{
    // Web Notifications https://www.w3.org/TR/notifications/
    notification = new Notification("Copied", { 'body': message });
    notification.onshow = function() { setTimeout(notification.close, 1000) }
}

function parseText (format, linkdata) {
    r = format;
    r = r.replace("%text%", linkdata.text, "g");
    r = r.replace("%title%", linkdata.title, "g");
    r = r.replace("%url%", linkdata.url, "g");
    // r = r.replace("%wikiname%", wikiname(linkdata.url), "g");
    r = r.replace("\n", " ", "g");
    r = parseDate(r, new DateExt(new Date()));
    // r = isgd(r, linkdata.url);
    r = r.replace("\\t", "\t", "g");
    r = r.replace("\\n", "\n", "g");
    return r;
}

parseDate = function(linkform, dateExt) {
  var r = linkform;
  r = r.replace("%date%", dateExt.to_s_date(), "g");
  r = r.replace("%Date%", dateExt.to_s_Date(), "g");
  r = r.replace("%datetime%", dateExt.to_s_dateTime(), "g");
  r = r.replace("%DateTime%", dateExt.to_s_DateTime(), "g");
  r = r.replace("%year%", dateExt.year(), "g");
  r = r.replace("%month%", dateExt.Month(), "g");
  r = r.replace("%day%", dateExt.Day(), "g");
  r = r.replace("%hour%", dateExt.Hour(), "g");
  r = r.replace("%min%", dateExt.Min(), "g");
  r = r.replace("%min%", dateExt.Min(), "g");
  return r;
}


DateExt = function (date) {
    if(date) {
        this._date = date;
    } else {
        this._date = new Date();
    }

    this.raw = function() {
        return this._date;
    };

    this.formatNum =  function (keta, num) {
      var src = new String(num);
      var cnt = keta - src.length;
      if (cnt <= 0) return src;
      while (cnt-- > 0) src = "0" + src; return src;
    };

    this.year = function() { return this._date.getFullYear(); };
    this.month = function () { return this._date.getMonth() + 1; };
    this.day = function() { return this._date.getDate(); };
    this.hour = function() { return this._date.getHours(); };
    this.min = function() { return this._date.getMinutes(); };
    this.Month = function() { return this.formatNum(2, this.month()); };
    this.Day = function() { return this.formatNum(2, this.day()); };
    this.Hour = function() { return this.formatNum(2, this.hour()); };
    this.Min = function() { return this.formatNum(2, this.min()); };

    this.to_s_date = function() { return this.year()  + "/" + this.Month() + "/" + this.Day(); };

    this.to_s_Date = function() { return this.year()  + "-" + this.Month() + "-" + this.Day(); };

    this.to_s_dateTime = function() {
        return this.year()  + "/" + this.Month() + "/" + this.Day() + " " + this.Hour() + " =" + this.Min();
    };

    this.to_s_DateTime = function() {
        return this.year()  + "-" + this.Month() + "-" + this.Day() + " " + this.Hour() + ":" + this.Min();
    };
};


function inBlocklist(url) {
    var blocklist = [ 
        /^chrome/i,
        /^https:\/\/chrome.google.com\/webstore/
    ];

    var ret = false;
    blocklist.forEach(function(pattern, index) {
        if(pattern.test(url)) {
            ret = true;
        }
    });
    return ret;
}

function toggleCopy(tab) {

    if(inBlocklist(tab.url)) {
        // The blocked web site does not allowed to inject script or sending messages.
        var linkdata = {};
        linkdata.title = tab.title;
        linkdata.text = tab.title;
        linkdata.url = tab.url;
        getFormat(function(format) {
            var buf = parseText(format, linkdata);
            copyToClipBoard(buf);
            notify(buf);
        });
    } else {
        chrome.tabs.executeScript(tab.id, {file: "script.js"});
    }
}

function contextMenuOnClick(format) {
    return function (info, tab) {
        // set default format.
        chrome.storage.sync.set({
            default: format,
        }, function() {
            toggleCopy(tab);
        });
    }
}

function contentMenuCopyTabsOnClick(info, tab) {
    chrome.tabs.query({}, function(tabs) {
        var buf = "";
        getFormat(function(format) {
            tabs.forEach(function(tab, index) {
                if(tab.url.indexOf("chrome") != 0) {
                    buf += parseText(format, {"text": tab.title, "url": tab.url}) + "\n";
                }
            });
            copyToClipBoard(buf);
            notify(buf);
        });
    });
}

function updateContextMenu () {
    chrome.contextMenus.removeAll();
    getOptions(function(options) {
        options.forEach(function(option, index){
            if(option.enable === true) {
                chrome.contextMenus.create({"title": option.name, contexts: ['page', 'link', 'selection'], "onclick": contextMenuOnClick(option.format)});
            }
        });
        chrome.contextMenus.create({"title": "separator", "type": "separator"});
        chrome.contextMenus.create({"title": "Copy all tabs", contexts: ['page', 'link', 'selection'], "onclick": contentMenuCopyTabsOnClick});
        chrome.contextMenus.create({"title": "separator", "type": "separator"});
        // chrome.contextMenus.create({"title": "Enable keyboard hotkey", "checked": "true", "type": "checkbox", "onclick": function(info,tab) {}});
        chrome.contextMenus.create({"title": "Settings", "onclick": function(info,tab) { chrome.runtime.openOptionsPage()} });
    });
}
