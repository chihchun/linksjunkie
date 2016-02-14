// Saves options to chrome.storage
function save_options() {
  var tbody = document.getElementById('shortcutsTableBody');
  var len = tbody.rows.length;
  var shortcuts = [];
  for (var i = 0; i < len; i++) {
      var shortcut = {};
      fields = tbody.rows[i].querySelectorAll("*");
      [].forEach.call(fields, function (field, index) {
          if(field.type === "text") {
              shortcut[field.name] = field.value;
          } else if (field.type === 'checkbox') {
              shortcut[field.name] = field.checked;
          }
      });
      shortcuts.push(shortcut);
  }

  chrome.storage.sync.set({
      shortcuts: JSON.stringify(shortcuts),
   }, function() {
       updateContextMenu();
       
       // Update status to let user know options were saved.
       var status = document.getElementById('save');
       status.textContent = 'Options saved.';
       setTimeout(function() {
           status.textContent = 'Save';
       }, 750);
   });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    shortcuts: null,
    shortener: "http://is.gd/api.php?longurl=%URL%",
  }, function(items) {
      var shortcuts = null;
      if(items.shortcuts == null) {
          shortcuts = getDefaultShortcuts();
      } else {
          shortcuts = JSON.parse(items.shortcuts);
      }
      updateShortcuts(shortcuts);
  });
}

function reset_options() {
    updateShortcuts(getDefaultShortcuts());
}

function updateShortcuts(shortcuts)
{
    var tbody = document.getElementById('shortcutsTableBody');
    var len = tbody.rows.length;
    for (var i = 0; i < len; i++)
        tbody.deleteRow(0);

    var row;
    for (i = 0; i < shortcuts.length; i++) {
        shortcut = shortcuts[i];
        row = tbody.insertRow(-1);

        row.insertCell(-1).appendChild(createCheckbox("enable", shortcut.enable === "true" || shortcut.enable === true));
        row.insertCell(-1).appendChild(createInput("name", shortcut.name));
        row.insertCell(-1).appendChild(createInput("format", shortcut.format));
        row.insertCell(-1).appendChild(createButton("copy"));
        row.insertCell(-1).appendChild(createButton("delete"));
        column = row.insertCell(-1);
        column.appendChild(createButton("UP"));
        column.appendChild(createButton("DOWN"));
    }
}

function createButton(text) {
    var button = document.createElement('button');
    button.appendChild(document.createTextNode(text));
    return button;
}

function createInput(name, value) {
    var input = document.createElement('input');
    input.setAttribute('value', value);
    input.setAttribute('name', name);
    return input;
}

function createCheckbox(name, checked) {
    var checkbox = document.createElement('input');
    checkbox.setAttribute('name', name);
    checkbox.setAttribute('id', name);
    checkbox.setAttribute('type', 'checkbox');
    checkbox.name = name;
    checkbox.id = name;
    if(checked)
        checkbox.setAttribute('checked', '1');
    return checkbox;
}

document.addEventListener('DOMContentLoaded', function() {
    restore_options();
    document.getElementById('save').addEventListener('click', save_options);
    document.getElementById('reset').addEventListener('click', reset_options);
});
