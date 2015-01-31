'use strict';

function setup() {
    console.log('setup');
    var new_arr = {};
    var response = JSON.parse(this.responseText);
    var tbl_body = document.getElementsByTagName('tbody')[0];
    var gist_desc, gist_lang, lang_key, link;
    tbl_body.innerHTML = '';

    if(this.filter_active && this.lang) {
        console.log('filter_active');
        for(var item of response) {
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
                    setupTable(gist_desc, gist_lang, link);
                }
            }
        }
    } else {
        console.log('!filter_active');
        for(var item of response) {
            lang_key = Object.keys(item.files)[0];
            gist_lang = item.files[lang_key].language;
            gist_desc = item.description;
            if(gist_desc === '' || gist_desc === null) {
                gist_desc = 'No description';
            }
            link = item.html_url;
            setupTable(gist_desc, gist_lang, link);
        }
    }

    function setupTable(gist_desc, gist_lang, link) {
        //setup table elements
        var row = document.createElement('tr');

        //create url links
        var a_tag = document.createElement('a');
        var href = document.createAttribute('href');
        href.value = link;
        a_tag.setAttributeNode(href);

        //create cells
        var desc_cell = document.createElement('td');
        desc_cell.id = "desc_id"
        var lang_cell = document.createElement('td');
        lang_cell.id = "lang_id"
        var desc_text = document.createTextNode(gist_desc);
        var lang_text = document.createTextNode(gist_lang);

        //create cell content and append cells content into cells and rows
        a_tag.appendChild(desc_text);
        lang_cell.appendChild(lang_text);
        desc_cell.appendChild(a_tag);
        row.appendChild(desc_cell);
        tbl_body.appendChild(row);
        desc_cell.parentNode.insertBefore(lang_cell, desc_cell.nextSibling);
    }
}

var langs_to_filter = [];
var _per_page;

function results(per_page, filter_active, checked_lang) {
    per_page = per_page === undefined ? 30 : per_page;
    if(checked_lang) {
        var checked = document.getElementById(checked_lang).checked;
    }
    if(checked_lang && checked) {
        console.log('adding lang');
        langs_to_filter.push(checked_lang);
        return;
    } else if (checked_lang && !checked) {
        console.log('removing lang');
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
