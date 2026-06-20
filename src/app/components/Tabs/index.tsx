import type { ReactNode } from "react";

export type TabItem<T extends string> = {
  id: T;
  tabId: string;
  panelId: string;
  label: string;
  children: ReactNode;
};

export type TabsProps<T extends string> = {
  ariaLabel: string;
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs: TabItem<T>[];
};

const tabClassName =
  "appearance-none border-none bg-transparent cursor-pointer font-inherit mb-[-1px] m-0 border-b-2 border-transparent px-3 py-2 text-[#555] hover:text-[#111]";

const Tabs = <T extends string>({
  ariaLabel,
  activeTab,
  onTabChange,
  tabs,
}: TabsProps<T>) => (
  <section className="mt-3" aria-label={ariaLabel}>
    <div className="flex flex-wrap gap-0 border-b border-[#ccc]" role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.tabId}
            type="button"
            id={tab.tabId}
            role="tab"
            aria-selected={isActive}
            aria-controls={tab.panelId}
            className={
              isActive
                ? `${tabClassName} border-b-current font-semibold text-[#111]`
                : tabClassName
            }
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>

    {tabs.map((tab) => {
      if (activeTab !== tab.id) {
        return null;
      }

      return (
        <div
          key={tab.panelId}
          id={tab.panelId}
          role="tabpanel"
          aria-labelledby={tab.tabId}
          className="mt-4"
        >
          {tab.children}
        </div>
      );
    })}
  </section>
);

export default Tabs;
