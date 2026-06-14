let clickedItem = null;
const listeners = new Set<() => void>();

const store = {
    get: function () {
        return clickedItem;
    },
    set: function (value) {
        clickedItem = value;

        listeners.forEach(cb => cb());
    },
    subsribe: function (cb) {
        listeners.add(cb);

        return () => listeners.delete(cb);
    }
}

export default store;