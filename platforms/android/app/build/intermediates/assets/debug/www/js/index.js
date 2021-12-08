var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
    },

    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var pixelRatio = window.devicePixelRatio || 1; /// get pixel ratio of device

        canvasMain = document.getElementById("landing");
        canvasMain2 = document.getElementById("main");

        canvasMain.width = windowWidth * pixelRatio;   /// resolution of canvas
        canvasMain.height = windowHeight * pixelRatio;
        canvasMain.style.width = windowWidth + 'px';   /// CSS size of canvas
        canvasMain.style.height = windowHeight + 'px';

        canvasMain2.width = windowWidth * pixelRatio;   /// resolution of canvas
        canvasMain2.height = windowHeight * pixelRatio;
        canvasMain2.style.width = windowWidth + 'px';   /// CSS size of canvas
        canvasMain2.style.height = windowHeight + 'px';

        // var physicalScreenWidth = window.screen.width * window.devicePixelRatio;
        // var physicalScreenHeight = window.screen.height * window.devicePixelRatio;
        document.getElementById("btnStartActivityChooseImage").addEventListener("click", startActivityChooseImage);
        document.getElementById("submitappbtn").addEventListener("click", submitapplication);
        document.getElementById("btnlanding").addEventListener("click", landing);
        document.getElementById("btnClear").addEventListener("click", clearfield);
        
        registerBroadcastReceiver();

        window.plugins.intentShim.onIntent(function (intent) {
            console.log('Received Intent: ' + JSON.stringify(intent.extras));
            
            var parentElement = document.getElementById('newIntentData');
            parentElement.innerHTML = "Received intent: " + JSON.stringify(intent.extras);
        });
    },
    onPause: function()
    {
        console.log('Paused');
        unregisterBroadcastReceiver();
    },
    onResume: function()
    {
        console.log('Resumed');
        registerBroadcastReceiver();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        console.log('Received Event: ' + id);
    }
};

app.initialize();

var data = [];

function clearfield(){
    document.getElementById('startActivityResultData').innerHTML = "";
    document.getElementById('hiddenApp').value = "";
}

function landing(){
    document.getElementById('landing').style.display = "none";
    document.getElementById('main').style.display = "block";
    const options = {
        method: 'get',
        headers: {}
      };
      
    cordova.plugin.http.sendRequest('http://rollcall.mbpj.gov.my/api/checkin/', options, function(response) {

        //alert(response.status);

        //alert(response.data);
        var rollcallval = JSON.parse(response.data);
        //alert(rollcallval[0].tajuk_rollcall);
        //var index = 0;
        for(var element in rollcallval)
        {
            var opt = document.createElement("option");
            opt.value= rollcallval[element].id;
            opt.innerHTML = rollcallval[element].tajuk_rollcall + "(" + rollcallval[element].mula_rollcall + ")"; // whatever property it has

            // then append it to the select element
            document.getElementById('sltrollcall').appendChild(opt);
            //index++;
        }
        
    }, function(response) {

        //alert(response.status);
        alert("Terdapat Ganguan Teknikal Sila Cuba Sebentar Lagi");
        alert(response.error);
    });
}

function submitapplication()
{
    //document.getElementById('hiddenApp').style.display= "block";
    var data = document.getElementById('hiddenApp').value;
    var check = document.getElementById('sltcheck').value;
    var rollcall = document.getElementById('sltrollcall').value;
    
    var res = [];
    res.push(data);
    const options = {
        method: 'post',
        data: { data: res, check:check, rollcall:rollcall},
        headers: {}
      };
      
    cordova.plugin.http.sendRequest('http://rollcall.mbpj.gov.my/api/checkin/', options, function(response) {
        if(response.status == 200){
            alert("Info berjaya dihantar");
        }
        //alert(response.status);

        //alert(response.data);
    }, function(response) {
        alert("Terdapat Ganguan Teknikal Sila Cuba Sebentar Lagi");

        //alert(response.status);

        alert(response.error);
    });
}

function startActivityChooseImage()
{
        window.plugins.intentShim.startActivityForResult(
            {
                action: "com.causalidea.cikad.showkad.READ_MYKAD",
                extras: {
                    "READ_PHOTO":false
                },
                requestCode: 2
            },
            function(intent)
            {
                if (intent.extras.requestCode == 2 && intent.extras.resultCode == window.plugins.intentShim.RESULT_OK)
                {
                    document.getElementById('startActivityResultData').innerHTML += "<br> NAME : "+JSON.stringify(intent.extras.NAME);
                    document.getElementById('startActivityResultData').innerHTML += "<br> IC NUMBER : "+JSON.stringify(intent.extras.IC_NUMBER);
                    document.getElementById('startActivityResultData').innerHTML += "<br>";
                    if(document.getElementById('hiddenApp').value == ""){
                        document.getElementById('hiddenApp').value += JSON.stringify(intent.extras);
                    }else{
                        value = ","+JSON.stringify(intent.extras);
                        document.getElementById('hiddenApp').value += value;
                    }
                }
                else
                {
                    document.getElementById('startActivityResultData').innerHTML = "IC SCan Canceled";
                }
            },
            function()
            {
                document.getElementById('startActivityResultData').innerHTML = "IC SCan failure";
            }
        );

}

function startService()
{
        window.plugins.intentShim.startService(
            {
                action: "Test Start Service",
                component:
                {
                    "package": "com.darryncampbell.pluginintentapiexerciserhelper",
                    "class": "com.darryncampbell.pluginintentapiexerciserhelper.MyIntentService"
                },
                extras:
                {
                    'random.number': Math.floor((Math.random() * 1000) + 1)
                }
            },
            function()
            {
                document.getElementById('startServiceData').innerHTML = "StartService Success";
            },
            function()
            {
                document.getElementById('startServiceData').innerHTML = "StartService Failure";
            }
        );
}

function registerBroadcastReceiver()
{
    window.plugins.intentShim.registerBroadcastReceiver({
        filterActions: [
            'com.darryncampbell.cordova.plugin.broadcastIntent.ACTION'
            ]
        },
        function(intent) {
            //  Broadcast received
            console.log('Received Intent: ' + JSON.stringify(intent.extras));
            var parentElement = document.getElementById('broadcastData');
            parentElement.innerHTML = "Received Broadcast: " + JSON.stringify(intent.extras);
        }
    );
}

function unregisterBroadcastReceiver()
{
    window.plugins.intentShim.unregisterBroadcastReceiver();
}

function getIntent()
{
    window.plugins.intentShim.getIntent(
        function(intent)
        {
            console.log(JSON.stringify(intent));
            var parentElement = document.getElementById('getIntentData');
            parentElement.innerHTML = "Launch Intent Action: " + JSON.stringify(intent.action);
            var intentExtras = intent.extras;
            if (intentExtras == null)
                intentExtras = "No extras in intent";
            parentElement.innerHTML += "<br>Launch Intent Extras: " + JSON.stringify(intentExtras);
        },
        function()
        {
            alert('Error getting launch intent');
        });
}

function sendResultForStartActivity()
{
        window.plugins.intentShim.sendResult(
            {
                extras: {
                    'Test Intent': 'Successfully sent',
                    'Test Intent int': 42,
                    'Test Intent bool': true,
                    'Test Intent double': parseFloat("142.12")
                }
            },
            function()
            {

            }
        );
}