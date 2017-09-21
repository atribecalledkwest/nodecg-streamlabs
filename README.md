# nodecg-streamlabs

nodecg-streamlabs is a bundle designed to wrap around StreamLabs' API and expose events to other bundles. All that's required to use nodecg-streamlabs is your socket token.


## Using in your bundle
### In a graphic or dashboard panel
```js
nodecg.listenFor("twitch-event", "nodecg-streamlabs", event => {
    // do work
});

nodecg.listenFor("youtube-event", "nodecg-streamlabs", event => {
    // do work
});

nodecg.listenFor("mixer-event", "nodecg-streamlabs", event => {
    // do work
});
```
### In an extension
```js
module.exports = nodecg => {
    const streamlabs = nodecg.extensions['nodecg-streamlabs'];

    streamlabs.on("twitch-event", event => {
        // do work
    });

    streamlabs.on("youtube-event", event => {
        // do work
    });

    streamlabs.on("mixer-event", event => {
        // do work
    });
};
```

## Events
Each platform has a platform specific event that bundles can listen for: `twitch-event`, `youtube-event`, and `mixer-event`. Events from these are structured as such:
```js
{
    type: "...",
    message: {
        ...
    }
}
```

Additionally, a `donation` event is emitted seperately from all three of these event streams, as it is streamlabs specific.

For those who want more fine-tuned control over what events they're listening to, there are also event-specific streams for each platform and event:
```
twitch-follow
twitch-subscription
twitch-host
twitch-bits
youtube-subscription
youtube-sponsor
youtube-superchat
mixer-follow
mixer-subscription
mixer-host
```

And lastly, for those who want to handle everything themselves, the `rawEvent` stream emits every event directly.