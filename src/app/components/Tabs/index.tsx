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

const tabBaseClassName =
  "m-0 mb-[-1px] cursor-pointer appearance-none border-0 border-b-2 bg-transparent px-3 py-2 [font-family:inherit] [font-size:inherit] [line-height:inherit] text-[#555] hover:text-[#111]";

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
                ? `${tabBaseClassName} border-b-[currentColor] font-semibold text-[#111]`
                : `${tabBaseClassName} border-b-transparent [font-weight:inherit]`
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
