import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState, type KeyboardEvent } from "react"

const KEYS = {
    "ARROW_LEFT": "ArrowLeft",
    "ARROW_RIGHT": "ArrowRight",
    "SPACE": " ",
    "ENTER": "Enter",
} as const;

interface TabContextValue {
    activeTab: string,
    setActiveTab: (id: string) => void,
    tabs: string[],
    registerTab: (id: string) => void,
}
const TabContext = createContext<TabContextValue | null>(null);

function useTabsContext(): TabContextValue {
    const context = useContext(TabContext);
    if (!context) throw new Error("context is not there");

    return context;
}

function useTabs(defaultTab: string): TabContextValue {
    const [activeTab, setActiveTab] = useState<string>(defaultTab);
    const [tabs, setTabs] = useState<string[]>([]);

    const registerTab = useCallback((id: string) => {
        setTabs(prev => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

    return { activeTab, setActiveTab, tabs, registerTab };
    // TODO: Should return: activeTab, setActiveTab, registerTab, tabs
}

interface TabsProps {
    defaultTab: string,
    children: ReactNode | string,
    className?: string
}
function Tabs({ children, className = "", defaultTab }: TabsProps) {
    const { activeTab, setActiveTab, tabs, registerTab } = useTabs(defaultTab);

    const contextValues = useMemo(() => {
        return { activeTab, setActiveTab, tabs, registerTab };
    }, [activeTab, setActiveTab, tabs, registerTab]);

    return (
        <TabContext.Provider value={contextValues}>
            <section className={`${className}`}>
                {children}
            </section>
        </TabContext.Provider>
    )
    // TODO: use useTabs hook, provide context
}

interface ListProps {
    children: ReactNode | string,
    className?: string
}
function List({ children, className = "" }: ListProps) {
    const { setActiveTab, tabs } = useTabsContext();

    function handleKeyDown(e: KeyboardEvent<HTMLUListElement>) {
        const key = e.key;
        const target = e.target as HTMLElement;

        if (target.getAttribute("role") !== "tab") return;

        if (key === KEYS.ARROW_RIGHT || key === KEYS.ARROW_LEFT) {
            e.preventDefault();
            const currIdx = tabs.indexOf(target.id);
            const newIdx = key === KEYS.ARROW_RIGHT ? (currIdx + 1) % tabs.length : (currIdx - 1 + tabs.length) % tabs.length;
            const newId = tabs[newIdx];

            document.getElementById(newId)?.focus()
        } else if (key === KEYS.SPACE || key === KEYS.ENTER) {
            e.preventDefault();

            setActiveTab(target.id)
        }
    }

    return (
        <ul role="tablist" className={`flex items-center gap-2 m-2 ${className}`} onKeyDown={handleKeyDown}>
            {children}
        </ul>
    )
    // TODO: render role="tablist", handle arrow key navigation
}

interface TabProps {
    id: string,
    children: ReactNode | string,
    className?: string
}
function Tab({ id, children, className = "" }: TabProps) {
    const { activeTab, setActiveTab, registerTab } = useTabsContext();
    const isActive = activeTab === id;

    useEffect(() => {
        registerTab(id)
    }, [id]);

    function handleTabClick() {
        setActiveTab(id);
    }

    return (
        <li
            id={id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            aria-controls={`panel-${id}`}
            className={`flex items-center gap-2 p-2 cursor-pointer bg-red-50 focus:outline-2 focus:outline-red-600 focus:outline-offset-2  ${isActive ? "bg-red-100" : ""} ${className}`}
            onClick={handleTabClick}
        >
            {children}
        </li>
    )
    // TODO: render role="tab", aria-selected, aria-controls, tabIndex, Tailwind styles
}

interface PanelProps {
    tabId: string,
    children: ReactNode | string,
    className?: string
}
function Panel({ tabId, className = "", children }: PanelProps) {
    const { activeTab } = useTabsContext();

    return (
        <section
            id={`panel-${tabId}`}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={activeTab !== tabId}
            className={`m-2 ${className}`}
        >
            {children}
        </section>
    )
    // TODO: render role="tabpanel", aria-labelledby, hide if not active
};

Tabs.List = List;
Tabs.Tab = Tab;
Tabs.Panel = Panel;

export default Tabs;