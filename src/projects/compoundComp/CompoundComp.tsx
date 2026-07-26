import Tabs from "./Tabs";

export default function CompoundComp() {
    return (
        <Tabs defaultTab="about">
            <Tabs.List>
                <Tabs.Tab id="about">About</Tabs.Tab>
                <Tabs.Tab id="contact">Contact</Tabs.Tab>
                <Tabs.Tab id="works">Works</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel tabId="about">about me</Tabs.Panel>
            <Tabs.Panel tabId="contact">contact me</Tabs.Panel>
            <Tabs.Panel tabId="works">my works</Tabs.Panel>
        </Tabs>
    );
}
