import React, { useState } from "react";

interface TabProps {
  title: string;
  component: React.ReactNode;
}

interface TabsWidgetProps {
  tabs: TabProps[];
}

const WidgetTabs: React.FC<TabsWidgetProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div
        role="tablist"
        className="tabs tabs-boxed text-lg mx-6 mb-3 bg-slate-200"
      >
        {tabs.map((tab, index) => (
          <a
            key={index}
            role="tab"
            className={`tab ${
              activeTab === index
                ? "tab-active [--tab-bg:#1CBD3F] text-green-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.title}
          </a>
        ))}
      </div>
      <div>
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`rounded-xl bg-white/5 ${
              activeTab === index ? "block" : "hidden"
            }`}
          >
            {tab.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WidgetTabs;
