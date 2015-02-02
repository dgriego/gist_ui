'use strict';

// globals
var langs_to_filter = [];
var tbl_body;
var settings = [];
var response;

function setup() {
    tbl_body = document.getElementsByTagName('tbody')[0];
    var new_arr = {};
    response = JSON.parse(this.responseText);
    var gist_desc, gist_lang, lang_key, link, index;
    tbl_body.innerHTML = '';

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
    per_page = per_page === undefined ? 30 : per_page;
    if(checked_lang) {
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
    request.onload = setup;
    request.lang = langs_to_filter;
    request.filter_active = filter_active ? true : false;
    if(langs_to_filter.length > 0 || filter_active) {
        request.filter_active = true;
    }
    request.send();
}
