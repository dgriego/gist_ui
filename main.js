'use strict';
// var langs_to_filter = [];
var AUTH_TOKEN = '8f085258b13b28681d27875283e646ffbf7778b4';

function setup() {
    var new_arr = {};
    var response = JSON.parse(this.responseText);
    // var lang_to_filter = this.lang;
    // langs_to_filter.push(this.lang);
    console.log(langs_to_filter);
    var tbl_body = document.getElementsByTagName('tbody')[0];
    var gist_desc, gist_lang, lang_key, link;

    if(this.filter_active) {
        for(var item of response) {
            lang_key = Object.keys(item.files)[0];
            gist_lang = item.files[lang_key].language;
            if(gist_lang === this.lang) {
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
    } else {
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
        var href = document.createAttribute("href");
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

function is_checked(language) {
    console.log(language);
    var langs_to_filter = [];
    langs_to_filter.push(language);
    return langs_to_filter;
}

// document.addEventListener('click', function() {
//     document.getElementById('Python').
// }

function results(value, filter_active) {
    console.log(is_checked());
    var request = new XMLHttpRequest();
    if(!value){
        request.open('GET', 'https://api.github.com/gists/public?access_token=' + AUTH_TOKEN, true);
    }
    else {
        console.log(document.getElementsByTagName('tbody'));
        var url = 'https://api.github.com/gists/public?access_token=' + AUTH_TOKEN + '&page=1&per_page=' + value;
        request.open('GET', url, true);
    }
    request.onload = setup;
    // request.lang = lang;
    request.filter_active = filter_active ? true : false;
    request.send();
}
