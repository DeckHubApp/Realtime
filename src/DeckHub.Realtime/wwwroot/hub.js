var DeckHub;
(function (DeckHub) {
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
        let _connected = false;
        function subject(name) {
            if (!subjects.has(name)) {
                const subject = new rxjs.Subject();
                subjects.set(name, subject);
                if (_connected) {
                    Hub.hubConnection.on(name, (data) => {
                        console.log(data);
                        subject.next(data);
                    });
                }
                return subject;
            }
            return subjects.get(name);
        }
        Hub.subject = subject;
        function attachCallbacks() {
            _connected = true;
            subjects.forEach((subject, key) => {
                Hub.hubConnection.on(key, (data) => {
                    console.log(data);
                    subject.next(data);
                });
            });
        }
        function disconnected() {
            _connected = false;
        }
        Hub.hubConnection = null;
        function connect() {
            var groupName = DeckHub.show || getGroupName();
            if (!groupName)
                return;
            Hub.hubConnection = new signalR.HubConnectionBuilder()
                .withUrl('/hub/live')
                .configureLogging(signalR.LogLevel.Information)
                .build();
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
            attachCallbacks();
            Hub.hubConnection.start()
                .then(() => {
                Hub.hubConnection.invoke('Join', groupName);
            })
                .catch(console.error);
        }
        document.addEventListener('DOMContentLoaded', connect);
    })(Hub = DeckHub.Hub || (DeckHub.Hub = {}));
})(DeckHub || (DeckHub = {}));
//# sourceMappingURL=hub.js.map