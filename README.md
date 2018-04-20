# Slidable/Realtime

This repo is the SignalR hub service that drives two key Slidable features:

- Notifies clients when the presenter moves the slide along
- Publishes Questions to all connected clients, including the Presenter View

Again, this is a read-only service, and at the moment it's not authenticated. The actual updates
come in over Redis pub/sub, from the Presenter and Questions services, and are forwarded to
clients connected to the relevant "show" group. This is done in the [RedisSubscriber](https://github.com/slidable/Realtime/blob/master/src/Slidable.Realtime/RedisSubscriber.cs) class,
which is a [IHostedService](https://blogs.msdn.microsoft.com/cesardelatorre/2017/11/18/implementing-background-tasks-in-microservices-with-ihostedservice-and-the-backgroundservice-class-net-core-2-x/). This is a really
nice feature in .NET Core 2.0 and up, which lets you create a managed background process with
full dependency-injection support, just by registering your implementation(s) as a Singleton
during application startup.

As well as the SignalR hub, this site serves its own 
[hub.js](https://github.com/slidable/Realtime/blob/master/src/Slidable.Realtime/wwwroot/hub.js) 
file, the SignalR client library, and Rx.js, which is used as an abstraction in the various 
consumer parts to make isolated development and testing easier.
