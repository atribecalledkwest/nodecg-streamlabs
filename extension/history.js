let history_length = 60;

module.exports = nodecg => {
    let history = nodecg.Replicant("history", { defaultValue: [] });

    nodecg.listenFor("clearHistory", () => {
        clear();
    });

    nodecg.listenFor("getHistory", cb => {
        cb(history.value);
    });

    nodecg.listenFor("addHistory", (item, cb) => {
        add(item);
        cb(history.value);
    });

    history.on("change", () => {
        nodecg.sendMessage("historyChanged", history.value);
    });

    function add(item) {
        history.value.unshift(item);
        while(history.value.length > history_length) {
            history.value.shift();
        }
    }

    function clear() {
        history.value = [];
    }

    return {
        add,
        clear
    };
};

