import type { ReactNode } from "react";

import styles from "./Tabs.module.css";

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

const Tabs = <T extends string>({
  ariaLabel,
  activeTab,
  onTabChange,
  tabs,
}: TabsProps<T>) => (
  <section className={styles.tabs} aria-label={ariaLabel}>
    <div className={styles.tabList} role="tablist">
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
              isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
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
          className={styles.tabPanel}
        >
          {tab.children}
        </div>
      );
    })}
  </section>
);

export default Tabs;
