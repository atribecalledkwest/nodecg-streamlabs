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

        // I don't think StreamLabs uses more or less than one message per event.message, but just in case
        let unformatted = event.message.pop();
        // No message? Must be an error, so we skip it because we already do raw emits.
        if(!(unformatted instanceof Object)) {
            nodecg.log.error(`Event ${event.event_id} had no ites in its event.message property, skipping.`);
        }

        switch(event.type) {
            case "donation": {
                // Donations are StreamLabs specific
                let message = {
                    id: unformatted.id || unformatted._id || null,
                    name: unformatted.name,
                    amount: {
                        amount: unformatted.amount,
                        currency: unformatted.currency
                    },
                    formatted_amount: unformatted.formatted_amount
                };
                nodecg.sendMessage("donation", message);
                emitter.emit("donation", message);
                break;
            }
            case "follow": {
                // Twitch follow == YouTube subscription == Mixer follow
                let message = {
                    id: unformatted.id || unformatted._id || null,
                    name: unformatted.name,
                    when: unformatted.created_at || unformatted.publishedAt || null
                };

                if(event.for === "twitch_account") {
                    nodecg.sendMessage("twitch-follow", message);
                    emitter.emit("twitch-follow");
                } else if(event.for === "youtube_account") {
                    nodecg.sendMessage("youtube-subscription", message);
                    emitter.emit("youtube-subscription", message);
                } else if(event.for === "mixer_account") {
                    nodecg.sendMessage("mixer-follow", message);
                    emitter.emit("mixer-follow", message);
                }
                break;
            }
            case "subscription": {
                // Twitch sub == YouTube sponsor == Mixer subscription
                let message = {
                    id: unformatted._id || null,
                    name: unformatted.name,
                    message: unformatted.message || null,
                    months: unformatted.months || 1
                };
                if(event.for === "twitch_account") {
                    nodecg.sendMessage("twitch-subscription", message);
                    emitter.emit("twitch-subscription", message);
                } else if(event.for === "youtube_account") {
                    nodecg.sendMessage("youtube-sponsor", message);
                    emitter.emit("youtube-sponsor", message);
                } else if(event.for === "mixer_account") {
                    nodecg.sendMessage("mixer-subscription", message);
                    emitter.emit("mixer-subscription", message);
                }
                break;
            }
            case "host": {
                // Twitch host == Mixer host, no YouTube equivalent
                let message = {
                    id: unformatted._id || null,
                    name: unformatted.name,
                    viewers: Number(unformatted.viewers),
                    type: unformatted.type
                };
                if(event.for === "twitch_account") {
                    nodecg.sendMessage("twitch-host", message);
                    emitter.emit("twitch-host", message);
                } else if(event.for === "mixer_account") {
                    nodecg.sendMessage("mixer-host", message);
                    emitter.emit("mixer-host", message);
                }
                break;
            }
            case "bits":
            case "superchat": {
                // Twitch bits == YouTube superchats, no Mixer equivalent
                let message = {
                    id: unformatted.id || unformatted._id || null,
                    name: unformatted.name,
                    amount:  unformatted.amount,
                    message: unformatted.message || unformatted.comment || null
                };
                if(event.for == "twitch_account") {
                    nodecg.sendMessage("twitch-bits", message);
                    emitter.emit("twitch-bits", message);
                } else if(event.for === "youtube_account") {
                    // There are some extra values we wanna add to the message if it's for youtube
                    message.currency = unformatted.currency;
                    message.display_string = unformatted.displayString;
                }
                break;
            }
            default:
                // We don't really need a default here, as we emit all events anyways under rawEvent
                break;
        }
    });

    return emitter;
};
