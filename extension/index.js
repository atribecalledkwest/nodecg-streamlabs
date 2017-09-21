const EventEmitter = require("events");
const io = require("socket.io-client");

module.exports = nodecg => {
    if(!nodecg.bundleConfig) {
        nodecg.log.error("No bundleConfig found, nodecg-streamlabs will not work without a configuration. Exiting.");
        return;
    } else if(typeof nodecg.bundleConfig.socket_token !== "string") {
        nodecg.log.error("No socket_token value present in bundleConfig, nodecg-streamlabs will not work without a socket_token. Exiting");
        return;
    }

    // Default options
    let opts = {
        reconnect: true
    };
    // Apply options to defaults if they exist
    if(typeof nodecg.bundleConfig.socketio === "object") {
        nodecg.bundleConfig.socketio.forEach((value, key) => {
            opts[key] = value;
        });
    }

    let socket = io.connect(`https://sockets.streamlabs.com/?token=${nodecg.bundleConfig.socket_token}`, opts);
    let emitter = new EventEmitter();

    socket.on("event", event => {
        // For people who wanna handle some of the dirty work themselves
        nodecg.sendMessage("rawEvent", event);
        emitter.emit("rawEvent", event);
    });

    return emitter;
};
