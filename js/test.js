
(function($, window, document, undefined) {
  
    console.log("============TEST============");
  
    'use strict';
    // Get member sessionStorage from maestro
    var member_dataSession = JSON.parse(window.parent.sessionStorage.getItem("member_info"));
    var ezcommCommunications;
    var scaseinteraction;

    var activeTier1IframeId = window.parent.$('div[id^="PegaWebGadget"]').filter(
        function() {
            return this.id.match(/\d$/);
        }).filter(function() {
        return $(this).attr('aria-hidden') === "false";
    }).contents()[0].id;

    if (document.forms[0].elements["TaskSectionReference"] !== undefined){
        var sCase = window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find('title').html().trim();
        var interaction = window.parent.$("label:contains('Interaction ID:')").text().split(":")[1].trim();
        scaseinteraction = interaction + " " + sCase;
        sessionStorage.setItem("revRxBenScase", scaseinteraction);
        sessionStorage.setItem("campaignName", "Review Rx Benefits");
    }

    var isAutodocEnabled = function() {
        var configuration = false;
        var myObj = requestMetaDataMandR().plugins;
        Object.keys(myObj).forEach(function (key) {
            console.log(myObj[key].pluginId); // the value of the current key.
            if (myObj[key].pluginId === "10" && myObj[key].name === "Autodoc") {
                configuration = true;
                console.log('config is ON');
            }
        });
        return configuration;
    }();

    function getMemberDataMandR() {
        var ezcommMandRMemObj = {};

        var memberDob = member_dataSession.member_dob;
        var year = memberDob.substring(0, 4);
        var month = memberDob.substring(4, 6);
        var day = memberDob.substring(6, 8);
        memberDob = month + "/" + day + "/" + year;

        ezcommMandRMemObj.version = "1.0";
        ezcommMandRMemObj.firstName = member_dataSession.member_first_name;
        ezcommMandRMemObj.lastName = member_dataSession.member_last_name;
        ezcommMandRMemObj.subscriberId = member_dataSession.member_id.split('-')[0];
        ezcommMandRMemObj.policyId = null;
        ezcommMandRMemObj.dateOfBirth = memberDob;
        return ezcommMandRMemObj;
    }

    function requestMetaDataMandR() {
        var requestMetaDataMandRObj = {};
        requestMetaDataMandRObj.agentId = pega.d.pyUID;
        requestMetaDataMandRObj.applicationName = "MAESTRO";
        requestMetaDataMandRObj.lineOfBusiness = "M&R";
        requestMetaDataMandRObj.epmpEnabled = true;

        var widgetObj = {};
        widgetObj.name = "MAESTRO-COVID19";
        widgetObj.uuid = "4566-5446-4344-3454";
        requestMetaDataMandRObj.widget = widgetObj;

        var pluginObj = [];
        var plugin = {};
        plugin.pluginId = 5;
        plugin.name = "M&R";
        plugin.defaultCampaign = "COVID19 Resources";
        pluginObj.push(plugin);
        var plugin2 = {};
        plugin2.pluginId = "10";
        plugin2.name = "Autodoc";
        plugin2.params = {
            additionalAutoDoc: ""
        };
        pluginObj.push(plugin2);
        requestMetaDataMandRObj.plugins = pluginObj;

        return requestMetaDataMandRObj;
    }

    var providerTierNotes = '';
    if (document.forms[0].elements["TaskSectionReference"] !== undefined) {

        if (document.forms[0].elements["TaskSectionReference"].value == "Tier1CompletionDetails") {
            if (sessionStorage.getItem('autodocmnrrrxb') === null) {
                sessionStorage.removeItem('tier1RevRxBenAutoDocEzcomm');
            } else {
                sessionStorage.setItem('tier1RevRxBenAutoDocEzcomm', sessionStorage.getItem('autodocmnrrrxb'));
                sessionStorage.removeItem('autodocmnrrrxb');
                if (sessionStorage.getItem('messageSuccess') !== null) {
                    sessionStorage.removeItem('messageSuccess');
                }
            }

            //TODO: ADD OPT_IN MESSAGE HERE..s
            if (sessionStorage.getItem('campaignName') === "Review Rx Benefits") {
                if (isAutodocEnabled) {
                    if (sessionStorage.getItem('tier1RevRxBenAutoDocEzcomm') !== null) { // TODO: Storage name
                        providerTierNotes = sessionStorage.getItem('tier1RevRxBenAutoDocEzcomm');
                    }
                }
                window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find('#Comments').val(providerTierNotes);
            }
        }
    }

    var ezcommCore = {
        app: {

            appWindow: null,

            open: function(config) {
                window.parent.localStorage.setItem('EzcommCommunicationsPayload', JSON.stringify(config));

                if (localStorage.getItem("EzcommWindowOpen") === 'true') {
                    window.open("", "a4meEZCommWindow").close();
                }
                window.parent.open("/a4me/ezcomm-core-dev/", "a4meEZCommWindow", 'location=no,height=600,width=1000,scrollbars=1');
            },

            get: function() {
                return this.appWindow;
            }
        }
    };

    function messageEvent(msg) {
        if (msg.data) {
            console.log('msg', msg);
            sessionStorage.setItem('messageSuccess', 'success');
            var data = msg.data.replace("Preference ", "").replace("Override ", "");
            var isNull = false;
            if (window.parent.sessionStorage.getItem('autodocmnrrrxb') === null) {
                window.parent.sessionStorage.setItem('autodocmnrrrxb', data);
                isNull = true;
            } else {
                appendToStorage('autodocmnrrrxb', data);
            }
            return false;
        }
    }

    function appendToStorage(name, data) {
        var old = window.parent.sessionStorage.getItem(name);
        var oldContainer = "";
        if (old === null) {
            old = "";
        }
        oldContainer = old;
        var newAuto = data;
        console.log(newAuto);
        window.parent.sessionStorage.setItem(name, oldContainer += newAuto);
    }


    window.parent.openEzcomm =  function() {

        ezcommCommunications = {
            config: {
                data: {
                    member: {},
                    request_metadata: {}
                }
            }
        };

        ezcommCommunications.config.data.member = getMemberDataMandR();
        ezcommCommunications.config.data.request_metadata = requestMetaDataMandR();
        ezcommCore.app.open(ezcommCommunications.config);

        window.parent.addEventListener("message", messageEvent, false);
    };

    var ezcommButtonVar = setInterval(addEzcommCoreLauncher, 1500);
    function addEzcommCoreLauncher() {
        if (window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("#ezcommLauncherButton").length === 0) {
            window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("#SelPlanID").parent().parent().next().append(
                '<button id="ezcommLauncherButton" onclick="window.parent.openEzcomm()" type="button" class="pzhc"  >' +
                '<div class="pzbtn-rnd" >' +
                    '<div class="pzbtn-lft">' +
                        '<div class="pzbtn-rgt" >' +
                            '<div class="pzbtn-mid" ><img src="webwb/zblankimage.gif" alt="" class="pzbtn-i" onclick="window.parent.openEzcomm()">EZComm</div>' +
                        '</div>' +
                '   </div>' +
                '</div>' +
                '</button>');
        }
    }


}(jQuery, window, document));
