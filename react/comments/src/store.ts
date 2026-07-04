export interface Comment {
    id: string,
    parentId: string | null,
    comment: string,
    repliesIds?: string[]
}
export interface Comments {
    [key: string]: Comment
}

let state: Comments = {};

const listeners = new Set<() => void>();
const storeObj = {
    get() {
        return state;
    },
    set: function (data: Comments) {
        state = { ...data };
        listeners.forEach(cb => cb());
    },
    getCommentById(id) {
        return state[id];
    },
    setCommentById: function (id, obj) {
        state = { ...state, [id]: obj };

        listeners.forEach(cb => cb());
    },
    subscribe: (cb: () => void) => {
        listeners.add(cb);

        return () => listeners.delete(cb);
    }
};

export default storeObj;