chrome.runtime.onMessage.addListener(function(request, sender) {
    bang(request,  sender.tab.id);
});

function bang(request, tab_id) {
    var search = request.srch;
    var replace = request.rpl;
    search = "!"+search.substring(1);
     var bang = search.split(" ")[0];
    var raw_search =search.substr(bang.length).trim();
    var search_url = request.srch_url;
    if (search != null && search != "") {
        chrome.storage.sync.get(['bangs'], function(result) {
            var i;
            var bangs = null;
            if (result.bangs != null) {
                bangs = JSON.parse(result.bangs);
            }

            if (bangs != null && bangs.length != 0) {
                var found = false;
                for (i = 0; i < bangs.length; i++) {
                  var bang_alias = bangs[i].bang.split(" ");
                    for(j = 0; j < bang_alias.length; j++){
                    if (bang == "!" + bang_alias[j]) {
                        found = true;
                        var URL = (bangs[i].url).replace("@search@",  encodeURIComponent(raw_search));
                     update_tab(URL);
                        break;
                    } 
                }
                if(found){break;}
                }
                if(!found){
                    checklocal();
                }
                
            } else if (search != null && search != "") {
                checklocal();
            }

        });
    } 

    function checklocal(){
            var url = chrome.runtime.getURL('bangs.json');
            var req = new XMLHttpRequest();
            req.responseType = 'json';
            req.open('GET', url, true);
            req.onload = function() {
                var found = false;
                var banglist = req.response;
                for (var i = 0; i < banglist.length; i++) {
                    if (banglist[i][0] == bang) {
                        console.log("using local list");
                     update_tab(banglist[i][1].replace("bang",  encodeURIComponent(raw_search)));
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    ddg();
                    }

                };
                req.send(null);
            }

            function ddg() {
                var xhttp = new XMLHttpRequest();
                xhttp.onload = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var response = xhttp.response;

                        // var regex= (?:\()?(?:\+bang+)(?:\))?(?:\<br\>)?(?:);
                        var regex = " (?:\\()?(?:\\" + bang + ")(?:\\))?(?:\\<br\\>)?(?:) "
                        var rex = new RegExp(regex, "g");
                        response = response.replace(/(\r\n|\n|\r)/gm, " ");

                        if (response.match(rex) != null) {

                       update_tab("https://www.duckduckgo.com/?q=" +  encodeURIComponent(search));
                        } else {
                            normalsearch();
                        }
                    }
                };

                xhttp.open("GET", "https://duckduckgo.com/bang_lite.html", true);
                xhttp.send();
            }

            function normalsearch() {
                if (search_url != null) {
                    var URL = search_url.replace("@search@",  encodeURIComponent(search));
                    update_tab(URL);
                }
            }
            function update_tab(URL){
                 var m = {
                            url: URL
                        };
                        if(tab_id != null){
                 chrome.tabs.update(tab_id, m);
                        }
                        else{
                            chrome.tabs.update(m);
                        }
            }
        }
