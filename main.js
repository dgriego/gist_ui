'use strict';

// globals
var langs_to_filter = [];
var tbl_body;
var settings = [];
var response;

function setup() {
    var gist_desc, gist_lang, lang_key, link, index, new_arr = {};

    //set tbl_body to main table so items
    //from the response / filtered response are appended to correct table
    tbl_body = document.getElementsByTagName('tbody')[0];

    //parse the response from github API so we can access the objects
    response = JSON.parse(this.responseText);

    //we reset the tbl html so a newly requested response won't be appended
    //to the old response
    tbl_body.innerHTML = '';

    //check for filter by language request
    //and send values from the response accordingly
    //only objects matching the searched language will
    //be sent to be part of the table built
    if(this.filter_active && this.lang) {
        for(var item of response) {
            index = response.indexOf(item);
            lang_key = Object.keys(item.files)[0];
            gist_lang = item.files[lang_key].language;
            for(var i = 0; i < this.lang.length; i++) {
                if(gist_lang === this.lang[i]) {
                    new_arr = item;
                    lang_key = Object.keys(new_arr.files)[0];
                    gist_lang = new_arr.files[lang_key].language;
                    gist_desc = new_arr.description;
                    if(gist_desc === '' || gist_desc === null) {
                        gist_desc = 'No description';
                    }
                    link = new_arr.html_url;
                    setupTable(gist_desc, gist_lang, link, index);
                }
            }
        }
    } else {
        for(var item of response) {
            index = response.indexOf(item);
            lang_key = Object.keys(item.files)[0];
            gist_lang = item.files[lang_key].language;
            gist_desc = item.description;
            if(gist_desc === '' || gist_desc === null) {
                gist_desc = 'No description';
            }
            link = item.html_url;
            setupTable(gist_desc, gist_lang, link, index);
        }
    }
}

window.onload = function() {
    var gist_desc, gist_lang, lang_key, link, index;
    tbl_body = document.getElementById('favs_table_body');

    for(var key in localStorage) {
        var item = JSON.parse(localStorage.getItem(key));
        index = item[0].index;
        lang_key = Object.keys(item[0].files)[0];
        gist_lang = item[0].files[lang_key].language;
        gist_desc = item[0].description;
        if(gist_desc === '' || gist_desc === null) {
            gist_desc = 'No description';
        }
        link = item[0].html_url;
        //setup favorites table with pushed info
        setupTable(gist_desc, gist_lang, link, index);
    }
}

function add_fav(row_id, button_id) {
    var favs = [];
    var gist_desc, gist_lang, lang_key, link, index;
    tbl_body = document.getElementById('favs_table_body');
    var index = document.getElementById(button_id).getAttribute('name');
    var row = document.getElementById(row_id);

    // remove row that is selected as fav
    document.getElementsByTagName('tbody')[0].removeChild(row);

    // each time fav is selected push to favs array
    favs.push(response[index]);
    for(var item of favs) {
        index = response.indexOf(item);

        //add an index property to the item object
        //so we can access it from the localStorage data
        //this is what allows us to remove an item from localStorage
        item.index = index;

        lang_key = Object.keys(item.files)[0];
        gist_lang = item.files[lang_key].language;
        gist_desc = item.description;
        if(gist_desc === '' || gist_desc === null) {
            gist_desc = 'No description';
        }
        link = item.html_url;
        setupTable(gist_desc, gist_lang, link, index);
    }
    localStorage.setItem(row_id, JSON.stringify(favs));
}

function remove_fav(row_id) {
    var row = document.getElementById(row_id);
    document.getElementById('favs_table_body').removeChild(row);
    for(var key in localStorage) {
        if(key === row_id) {
            localStorage.removeItem(key);
        }
    }
}

function setupTable(gist_desc, gist_lang, link, index) {
    //to give each row and cell a unique id we pass in the index
    //from each item and add that value to the id value.
    //We do this for the row_id, button_id, and name attributes
    //Doing this allows us to access these values later on
    //for further manipulation

    //setup table elements
    var row = document.createElement('tr');
    var row_id = document.createAttribute('id');
    row_id.value = 'gist_row' + index;
    row.setAttributeNode(row_id);

    //create url links
    var a_tag = document.createElement('a');
    var href = document.createAttribute('href');
    href.value = link;
    a_tag.setAttributeNode(href);

    //create favorites button
    var button_cell = document.createElement('td');
    var button = document.createElement('input');
    var type = document.createAttribute('type');
    var button_id = document.createAttribute('id');
    var onclick = document.createAttribute('onclick');
    var button_val = document.createAttribute('value');
    var name = document.createAttribute('name');
    button_id.value = 'favorites' + index;
    name.value = index;
    type.value = 'button';

    if(tbl_body === document.getElementById('favs_table_body')) {
        onclick.value = 'remove_fav("gist_row' + index + '");';
        button_val.value = 'Remove Favorite';
    } else {
        onclick.value = 'add_fav("gist_row' + index + '", "favorites' + index + '");';
        button_val.value = 'Mark as Favorite';
    }

    button.setAttributeNode(button_id);
    button.setAttributeNode(type);
    button.setAttributeNode(button_val);
    button.setAttributeNode(onclick);
    button.setAttributeNode(name);

    //create elements needed for table
    var desc_cell = document.createElement('td');
    desc_cell.id = "desc_id";
    var lang_cell = document.createElement('td');
    lang_cell.id = "lang_id";
    var desc_text = document.createTextNode(gist_desc);
    var lang_text = document.createTextNode(gist_lang);

    //create cell content and append cells content into cells and rows
    button_cell.appendChild(button);
    a_tag.appendChild(desc_text);
    lang_cell.appendChild(lang_text);
    desc_cell.appendChild(a_tag);
    row.appendChild(desc_cell);
    tbl_body.appendChild(row);
    desc_cell.parentNode.insertBefore(lang_cell, desc_cell.nextSibling);
    lang_cell.parentNode.insertBefore(button_cell, lang_cell.nextSibling);
}

function results(per_page, filter_active, checked_lang) {
    //per_page from the github API is 30, but when filtering
    //if we do not use this ternary per_page will be undefined.
    //This still sent 30, but avoiding conflicts and possible bugs
    //we make sure it is 30 if it is in fact undefined
    per_page = per_page === undefined ? 30 : per_page;
    if(checked_lang) {
        //we only want this if the user is filtering by language
        var checked = document.getElementById(checked_lang).checked;
    }
    if(checked_lang && checked) {
        langs_to_filter.push(checked_lang);
        return;
    } else if (checked_lang && !checked) {
        langs_to_filter.splice(checked_lang, 1);
        return;
    } else {
        var url = 'https://api.github.com/gists/public?access_token='
            url+= AUTH_TOKEN + '&page=1&per_page=' + per_page;
        var request = new XMLHttpRequest();
        if(!per_page){
            request.open('GET', url, true);
        }
        else {
            request.open('GET', url, true);
        }
    }
    //call the setup function when request has been completed
    request.onload = setup;

    //were adding the desired languages to the request object so we
    //can access it from the setup function
    request.lang = langs_to_filter;

    //adding in whether the filter_active is true or not allows
    //us to tell the setup function the correct data to send to
    //the buildTable function
    request.filter_active = filter_active ? true : false;
    if(langs_to_filter.length > 0 || filter_active) {
        request.filter_active = true;
    }
    request.send();
}
