let state = {
    counter: 0
}

const listeners = new Set([]);

const counterStore = {
    getState: function () {
        return state;
    },
    setState: function () {
        state = { counter: state.counter + 1 }

        listeners.forEach(cb => cb());
    },
    subscribe: function (listener) {
        listeners.add(listener);

        return () => listeners.delete(listener);
    }
}
export default counterStore;