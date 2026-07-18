import { type FC, useEffect, useState } from "react";

import AddLabelForm from "./AddLabelForm";
import AllLabelsList from "./AllLabelsList";

import FeedbackSection from "@/app/components/FeedbackSection";
import Tabs from "@/app/components/Tabs";
import type { DbSource } from "@/db/db-source";
import type { FormFeedback } from "@/types/form";
import type { LabelListItem } from "@/types/labels";
import { formFeedbackInitialValue } from "@/utils/form";

type LabelsProps = {
  primaryDbSource: DbSource;
};

type LabelsTab = "labelsList" | "addNewLabel";

/** Stable ids for this tablist (single Labels window view per document). */
const LIST_TAB_ID = "labels-list-tab";
const LIST_PANEL_ID = "labels-list-panel";
const ADD_TAB_ID = "labels-add-tab";
const ADD_PANEL_ID = "labels-add-panel";

const labelAddedSuccessClassName =
  "mb-4 rounded-md border border-[#6ee7b7] bg-[#d1fae5] px-3 py-2 text-[0.92rem] font-medium text-[#14532d]";

const Labels: FC<LabelsProps> = ({ primaryDbSource }) => {
  const [activeTab, setActiveTab] = useState<LabelsTab>("labelsList");
  const [recentlyAddedLabel, setRecentlyAddedLabel] = useState<LabelListItem>();
  const [addLabelFeedback, setAddLabelFeedback] = useState<FormFeedback>(
    formFeedbackInitialValue,
  );
  const [labels, setLabels] = useState<LabelListItem[]>([]);

  useEffect(() => {
    setRecentlyAddedLabel(undefined);
    setAddLabelFeedback(formFeedbackInitialValue);
  }, [primaryDbSource]);

  const handleClearAddLabelFeedback = () => {
    setAddLabelFeedback(formFeedbackInitialValue);
    setRecentlyAddedLabel(undefined);
  };

  const handleCreateLabel = (result: {
    label?: LabelListItem;
    feedback: FormFeedback;
  }) => {
    const { label, feedback } = result;
    setAddLabelFeedback(feedback);

    if (label !== undefined) {
      setRecentlyAddedLabel(label);
      setActiveTab("labelsList");
    }
  };

  return (
    <>
      <FeedbackSection
        notificationsId="add-label-notifications"
        errorsId="add-label-errors"
        {...addLabelFeedback}
      />

      {recentlyAddedLabel && (
        <div className={labelAddedSuccessClassName} role="status">
          Label &quot;{recentlyAddedLabel.name}&quot; added successfully!
        </div>
      )}

      <Tabs
        ariaLabel="Browse labels or add a new label"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            id: "labelsList",
            tabId: LIST_TAB_ID,
            panelId: LIST_PANEL_ID,
            label: "All labels",
            children: (
              <AllLabelsList
                primaryDbSource={primaryDbSource}
                labels={labels}
                onLabelsChange={setLabels}
                recentlyAddedLabel={recentlyAddedLabel}
              />
            ),
          },
          {
            id: "addNewLabel",
            tabId: ADD_TAB_ID,
            panelId: ADD_PANEL_ID,
            label: "Add a new label",
            children: (
              <AddLabelForm
                primaryDbSource={primaryDbSource}
                labels={labels}
                onClearAddLabelFeedback={handleClearAddLabelFeedback}
                onCreateLabel={handleCreateLabel}
              />
            ),
          },
        ]}
      />
    </>
  );
};

export default Labels;
