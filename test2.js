var covid_vaccine_widget = (function(window) {

    "use strict";

    function _(x) {
        return document.getElementById(x);
    }

    function urlStringHas(urlSub) {
        return window.location.href.indexOf(urlSub) > -1
    }

    function covidVaccineSetSession(key, value) {
        if (sessionStorage.getItem(key) === null) {
            return sessionStorage.setItem(key, value);
        }
    }

    function covidVaccineRemoveSession(key) {
        if (sessionStorage.getItem(key) !== null) {
            return sessionStorage.removeItem(key)
        }
    }

    function covidVaccineGetSession(key) {
        return sessionStorage.getItem(key) !== null ? sessionStorage.getItem(key) : null;
    }

    function covidIsMemberCaller() {
        return covidVaccineGetSession('isMemberCaller') === 'EM';
    }

    var getUrl = function() {
        if (window.location.hostname.indexOf("-dev") > -1) {
            return "/a4me/covid-19-vaccines-widget-dev";
        }
        return "/a4me/covid-19-vaccines-widget";
    };

    var imageDivider = function() {
        var imgDivider = document.createElement("img");
        imgDivider.setAttribute("style", "width:6px; height:27px;");
        imgDivider.src = "/chap/images/divider_header.gif";
        _("divToolIcons").appendChild(imgDivider);
    };

    var appendCovidVaccineIcon = function() {
        var span = document.createElement("span");
        span.setAttribute("id", "covid_19_icon");
        span.setAttribute("style", "position:relative");
        var img = document.createElement("img");
        img.src = getUrl() + "/images/covid-vaccine.png";
        img.setAttribute("style", "width:25px; height:27px; margin-left:5px; margin-right:2px; cursor:pointer");

        var div = document.createElement('div');
        div.setAttribute("id", "datacovid19");
        div.setAttribute("style", "width:218px; position:absolute; top:0; left:0; z-index:99999999;padding-top:15px; padding-left:15px; padding-right:15px; padding-bottom:15px; background-color:#ffffff; border:1px solid #ebebeb");
        div.style.display = "none";

        span.appendChild(div);
        span.appendChild(img);
        if (_("covid_19_icon") === null) {
            _("divToolIcons").appendChild(span);
            imageDivider();
        }
        _("covid_19_icon").addEventListener("mouseover", openCovidVaccineWidget);
        _("covid_19_icon").addEventListener("mouseleave", closeCovidVaccineWidget);
    };

    function appendCovidVaccineHeader() {
        var h1 = document.createElement("h1");
        h1.id = "header_covid";
        h1.innerText = "COVID-19 vaccine";
        h1.setAttribute("style", "font-weight:bold; font-size:16px");
        _('datacovid19').appendChild(h1);
    }

    function appendCovidVaccineInfo(message) {
        var divcovid = document.createElement("div");
        divcovid.setAttribute("style", "font-size:12px");
        divcovid.id = "covidDiv";
        divcovid.innerHTML = message;
        _('datacovid19').appendChild(divcovid);
    }

    function removeDataCovid19Div() {
        _('datacovid19').innerHTML = '';
    }

    function openCovidVaccineWidget() {
        _('datacovid19').style.display = "block";
        //get data
        removeDataCovid19Div();
        appendCovidVaccineInfo("Loading Information...");

        if(isMemberChanged()) {
            setCurrentMember(getMemberData());
            var http = new XMLHttpRequest();
            var url = '/a4me/covid19-vaccine/search';
            http.open('POST', url, true);
            //Send the proper header information along with the request
            http.setRequestHeader('Content-type', 'application/json');
            http.onreadystatechange = function() {
                //Call a function when the state changes.
                if (http.readyState == 4 && http.status == 200) {
                    removeDataCovid19Div();
                    var jsonResponseData = JSON.parse(http.responseText);
                    if (jsonResponseData === '' || jsonResponseData.length == 0) {
                        setCurrentVaccineInformation("No vaccination information found");
                        appendCovidVaccineInfo("No vaccination information found");
                    } else {
                        appendCovidVaccineHeader();
                        setCurrentVaccineInformation(createTable(jsonResponseData));
                        appendCovidVaccineInfo(createTable(jsonResponseData));
                    }
                } else if (http.readyState == 4 && http.status !== 200) {
                    removeDataCovid19Div();
                    setCurrentVaccineInformation("Error encountered in retrieving information");
                    appendCovidVaccineInfo("Error encountered in retrieving information");
                }
            }
            http.send(JSON.stringify(getMemberData()));
        } else {
            removeDataCovid19Div();
            if(getCurrentVaccineInformation() === 'No vaccination information found'
                || getCurrentVaccineInformation() === 'Error encountered in retrieving information') {
            } else {
                appendCovidVaccineHeader();
            }
            appendCovidVaccineInfo(getCurrentVaccineInformation());
        }
    }

    function isMemberChanged() {
        if(getCurrentMember() !== undefined || getCurrentMember() !== null) {
            return getCurrentMember() !== JSON.stringify(getMemberData());
        } else {
            return true;
        }
    }

    function setCurrentMember(member) {
        sessionStorage.setItem('covidCurrentMember', JSON.stringify(member));
    }

    function getCurrentMember() {
        return sessionStorage.getItem('covidCurrentMember');
    }

    function setCurrentVaccineInformation(vaccineInformation) {
        sessionStorage.setItem('covidCurrentInformation', vaccineInformation);
    }

    function getCurrentVaccineInformation() {
        return sessionStorage.getItem('covidCurrentInformation');
    }

    function closeCovidVaccineWidget() {
        _('datacovid19').style.display = "none";
    }

    function createTable(data) {
        let increment = 1;

        let table = '<table>';
        data.map(function(item) {

            table = table + '<tr>',
                table = table + '<td>' + 'Dose #' + increment++ + ':</td>',
                table = table + '<td>' + item.drugName + '</td>',
                table = table + '<td>' + item.immunizationDate + '</td>'
        });
        table += "</table>";
        return table;
    }


    function checkSessionHeader() {
        if ($("#originator_sessionheader")[0] === undefined) return false;
        else if ($("#originator_sessionheader")[0].innerText !== "") return true;
        return false;
    };


    function addIconToHeader() {
        if (checkSessionHeader() && covidIsMemberCaller()) {
            var businessSegment = $('#businessSegment_sessionHeader')[0].value;
            if (businessSegment === 'ACME' || businessSegment === 'PHS') {
                appendCovidVaccineIcon();
            }
        }
    }


    function addEventsToOrigType() {
        if (document.querySelectorAll("#originatorTypeForm input[name='originatorType']") === null) return;
        var covidVacRadioBtn = document.querySelectorAll("#originatorTypeForm input[name='originatorType']");
        for (var i = 0; i < covidVacRadioBtn.length; i++) {
            covidVacRadioBtn[i].addEventListener('click', function(e) {
                if (e.target.value === 'EM') {
                    sessionStorage.setItem('isMemberCaller', "EM");
                    return;
                }
                covidVaccineRemoveSession('isMemberCaller')
            });
        }
    }


    function addEventsToBussSource() {
        if (_("searchSystemSelect") === null) return;
        var bussSelect = _("searchSystemSelect");
        bussSelect.addEventListener('change', function(e) {
            if (e.target.value === "C") return sessionStorage.setItem("getBussSource", this.options[this.selectedIndex].text);
            else if (e.target.value === "N") return sessionStorage.setItem("getBussSource", this.options[this.selectedIndex].text);
            return covidVaccineRemoveSession("getBussSource");
        });
    }

    if (typeof A4me === "undefined") {
        $('head').append('<script src="/a4me/ibaag-benefits-widget-v2/ibaagBenefits/A4meIsetLib.js" type="text/javascript"></script>');
    }


    function getMemberData() {
        //If EZComm loads before IBaag, then load the A4meIset script
        if (typeof A4me === "undefined") {
            $('head').append('<script src="/a4me/ibaag-benefits-widget-v2/ibaagBenefits/A4meIsetLib.js" type="text/javascript"></script>');
        }
        var temp = A4me.getDateOfBirthOfSubject().split('/');
        var dob = temp[2] + "-" + temp[0] + "-" + temp[1];

        var ezcommModelObject = {};
        ezcommModelObject.firstName = A4me.getFirstNameOfSubject();
        ezcommModelObject.lastName = A4me.getLastNameOfSubject();
        ezcommModelObject.dateOfBirth = dob;

        if (sessionStorage.getItem("getBussSource") === "CDB") {
            ezcommModelObject.memberId = A4me.getAlternateId();
            ezcommModelObject.idTypeCode = "0";
        } else if (sessionStorage.getItem("getBussSource") === "NICE") {
            ezcommModelObject.memberId = $('#subscriberIDEncrypted')[0].defaultValue;
            ezcommModelObject.idTypeCode = "30303";
        }

        ezcommModelObject.policyId = A4me.getGroupId();
        ezcommModelObject.lineOfBusiness = "E&I";
        return ezcommModelObject;
    }

    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var body = document.body;
    var config = {
        attributes: true,
        childList: true
    };
    var observer = new MutationObserver(createObserver);

    function createObserver() {
        setTimeout(function() {
            addIconToHeader();
        }, 1000);
        addEventsToOrigType();
        addEventsToBussSource();
        observer.disconnect();
        startObserving(body);
    }

    function startObserving(bod) {
        setTimeout(function() {
            addIconToHeader();
        }, 1000);
        addEventsToOrigType();
        addEventsToBussSource();
        observer.observe(bod, config);
    }



    function bussSourceSystem() {
        if (_("searchSystemSelect") === null) return;

        var e = _("searchSystemSelect");
        var value = e.options[e.selectedIndex].value;
        var text = e.options[e.selectedIndex].text;

        if (value === "C") return sessionStorage.setItem("getBussSource", text);
        else if (value === "N") return sessionStorage.setItem("getBussSource", text);
        return covidVaccineRemoveSession("getBussSource");

    }


    function setSessionSearchPage() {
        if (_('memberSelected') === null) return;
        if (document.getElementById("memberSelected").checked) return covidVaccineSetSession('isMemberCaller', "EM");
        return covidVaccineRemoveSession('isMemberCaller');
    }

    setSessionSearchPage();
    createObserver();
    bussSourceSystem();

    return {
        checkHeaderValues: checkSessionHeader,
        urlStringHas: urlStringHas,
        setSession: covidVaccineSetSession,
        removeSession: covidVaccineRemoveSession,
        createObserver: createObserver
    }

}(window));
