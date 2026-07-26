import React, { memo, type SyntheticEvent, type KeyboardEvent, useCallback, useRef, useState } from 'react';

interface ToDoItemProps {
    id: string;
    todo: string;
    isDone: boolean;
    toggleDone: (id: string) => void;
    onDeleteClick: (id: string) => void;
    onSaveClick: (id: string, newVal: string) => void;
}
function TodoItem({
    id,
    todo,
    isDone,
    toggleDone,
    onDeleteClick,
    onSaveClick,
}: ToDoItemProps) {
    const editInputRef = useRef<HTMLInputElement | null>(null);

    const [isEditting, setIsEditting] = useState(false);

    function saveEdit(newVal: string) {
        onSaveClick(id, newVal);
        setIsEditting(false);
    }

    function handleEditOrSaveClick() {
        if (!isEditting) return setIsEditting(true);

        const value = editInputRef.current?.value?.trim();
        if (value) saveEdit(value);
    }

    function handleEditSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const value = (formData.get("edit-input") as string).trim();
        if (value) saveEdit(value);
    }

    return (
        <li role='listitem' className='todo-listItem flex item-center justify-between gap-2 w-lg my-2' tabIndex={0}>
            {
                isEditting ?
                    <form onSubmit={handleEditSubmit} aria-label={`edit todo ${todo} input form`}>
                        <input
                            autoFocus
                            ref={editInputRef}
                            className='flex-1 rounded-md px-2'
                            name="edit-input"
                            type='text'
                            aria-label={`edit todo ${todo} input field`}
                            defaultValue={todo}
                        />
                    </form>
                    : <p className={`flex-1 ${isDone ? 'line-through' : ''}`}>{todo}</p>
            }

            <div role='group' aria-label="Task actions" className='flex item-center justify-between gap-2'>
                <button
                    aria-label={`${isEditting ? "save" : "edit"} todo ${todo} button`}
                    className='text-sm bg-yellow-100 px-2 py-1 rounded-md cursor-pointer'
                    onClick={handleEditOrSaveClick}
                    tabIndex={0}
                >
                    {isEditting ? "save" : "edit"}
                </button>

                <button
                    aria-label={`${isDone ? "undone" : "done"} todo ${todo} button`}
                    className='text-sm bg-green-100 px-2 py-1 rounded-md cursor-pointer'
                    onClick={() => toggleDone(id)}
                    aria-pressed={isDone}
                    tabIndex={0}
                >
                    {isDone ? "undone" : "done"}
                </button>

                <button
                    aria-label={`delete todo ${todo} button`}
                    className='text-sm bg-red-100 px-2 py-1 rounded-md cursor-pointer'
                    onClick={() => onDeleteClick(id)}
                    tabIndex={0}
                >
                    delete
                </button>
            </div>
        </li>
    )
}
const MemoisedTodoItem = memo(TodoItem);

interface TodoItemData {
    id: string,
    todo: string,
    isDone: boolean,
};

export default function Todos() {
    const [todos, setTodos] = useState<TodoItemData[]>([]);

    function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
        const key = e.key;
        if (key !== "ArrowDown" && key !== "ArrowUp") return;

        e.preventDefault();

        const items = Array.from(document.querySelectorAll<HTMLElement>(".todo-listItem"));
        if (!items.length) return;

        const activeElement = document.activeElement as HTMLElement;
        const currActiveEleIdx = items.findIndex((el) => el === activeElement || el.contains(activeElement));
        if (currActiveEleIdx < 0) return;

        if (key === "ArrowDown") {
            const next = Math.min(currActiveEleIdx + 1, items.length - 1);
            items[next]?.focus();
        } else if (key === "ArrowUp") {
            const prev = Math.max(currActiveEleIdx - 1, 0);
            items[prev]?.focus();
        }
    }

    function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const val = (formData.get("input") as string)?.trim();
        if (val) {
            setTodos(prev => [...prev, { todo: val, id: crypto.randomUUID(), isDone: false }]);

            e.currentTarget.reset(); // resetting the input field
        }
    }

    const handleToggleDone = useCallback((id: string) => {
        setTodos(prev => prev.map(item => item.id === id ? { ...item, isDone: !item.isDone } : item));
    }, []);

    const handleDeleteClick = useCallback((id: string) => {
        setTodos(prev => prev.filter(item => item.id !== id));
    }, []);

    const handleSaveClick = useCallback((id: string, newVal: string) => {
        setTodos(prev => prev.map(item => item.id === id ? { ...item, todo: newVal } : item));
    }, []);

    return (
        <main className="flex flex-col items-center p-4" onKeyDown={handleKeyDown}>
            <h1 className="text-3xl font-bold">Todo List</h1>
            <form className='my-4' onSubmit={handleSubmit} aria-label="todo input form">
                <input className='w-xs rounded-md px-2 py-1' name="input" type='text' aria-label="todo input field" autoFocus={true} />
            </form>

            <ul role='list' >
                {
                    todos.map(({ todo, id, isDone }) => (
                        <MemoisedTodoItem
                            key={id}
                            id={id}
                            todo={todo}
                            isDone={isDone}
                            toggleDone={handleToggleDone}
                            onDeleteClick={handleDeleteClick}
                            onSaveClick={handleSaveClick}
                        />
                    ))
                }
            </ul>
        </main>
    );
}
