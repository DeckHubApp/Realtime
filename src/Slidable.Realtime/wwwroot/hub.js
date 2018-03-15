var Slidable;
(function (Slidable) {
    var Hub;
    (function (Hub) {
        var groupName = window.location.pathname.replace("/live/", "").replace(/\/[0-9]+$/, "");
        var transport = signalR.TransportType.WebSockets;
        var logger = new signalR.ConsoleLogger(signalR.LogLevel.Information);
        var onConnectedCallbacks = [];
        var onDisconnectedCallbacks = [];
        function connected() {
            for (var _i = 0, onConnectedCallbacks_1 = onConnectedCallbacks; _i < onConnectedCallbacks_1.length; _i++) {
                var callback = onConnectedCallbacks_1[_i];
                try {
                    callback();
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        function disconnected() {
            for (var _i = 0, onDisconnectedCallbacks_1 = onDisconnectedCallbacks; _i < onDisconnectedCallbacks_1.length; _i++) {
                var callback = onDisconnectedCallbacks_1[_i];
                try {
                    callback();
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        Hub.hubConnection = null;
        function onConnected(callback) {
            onConnectedCallbacks.push(callback);
            if (Hub.hubConnection !== null) {
                callback();
            }
        }
        Hub.onConnected = onConnected;
        function onDisconnected(callback) {
            onDisconnectedCallbacks.push(callback);
        }
        Hub.onDisconnected = onDisconnected;
        function connect() {
            Hub.hubConnection = new signalR.HubConnection("/hub/live", { transport: transport, logger: logger });
            Hub.hubConnection.onclose(function (e) {
                if (e) {
                    console.error(e.message);
                    Hub.hubConnection = null;
                    disconnected();
                    // Try to reconnect in 10 seconds
                    setTimeout(connect, 10000);
                }
                else {
                    disconnected();
                }
            });
            Hub.hubConnection.start()
                .then(function () {
                Hub.hubConnection.invoke("Join", groupName);
                connected();
            })["catch"](console.error);
        }
        Hub.connect = connect;
    })(Hub = Slidable.Hub || (Slidable.Hub = {}));
})(Slidable || (Slidable = {}));
