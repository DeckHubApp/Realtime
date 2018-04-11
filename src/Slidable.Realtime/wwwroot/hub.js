var Slidable;
(function (Slidable) {
    var Hub;
    (function (Hub) {
        const subjects = new Map();
        function getGroupName() {
            const parts = window.location.pathname.split('/').filter(s => !!s);
            if (parts.length < 4)
                return null;
            parts.pop(); // Should be the slide number, we don't care
            const slug = parts.pop();
            const presenter = parts.pop();
            const place = parts.pop();
            return `${place}/${presenter}/${slug}`;
        }
        const transport = signalR.TransportType.WebSockets;
        const logger = new signalR.ConsoleLogger(signalR.LogLevel.Information);
        const onConnectedCallbacks = [];
        const onDisconnectedCallbacks = [];
        let _connected = false;
        function subject(name) {
            if (!subjects.has(name)) {
                const subject = new Rx.Subject();
                subjects.set(name, new Rx.Subject());
                if (_connected) {
                    Hub.hubConnection.on(name, subject.next);
                }
                return subject;
            }
            return subjects.get(name);
        }
        Hub.subject = subject;
        function connected() {
            _connected = true;
            subjects.forEach((subject, key) => {
                Hub.hubConnection.on(key, subject.next);
            });
        }
        function disconnected() {
            _connected = false;
        }
        Hub.hubConnection = null;
        function connect() {
            var groupName = getGroupName();
            if (!!groupName)
                return;
            Hub.hubConnection = new signalR.HubConnection('/hub/live', { transport, logger });
            Hub.hubConnection.onclose(e => {
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
                .then(() => {
                Hub.hubConnection.invoke('Join', groupName);
                connected();
            })
                .catch(console.error);
        }
        document.addEventListener('DOMContentLoaded', connect);
    })(Hub = Slidable.Hub || (Slidable.Hub = {}));
})(Slidable || (Slidable = {}));
//# sourceMappingURL=hub.js.map