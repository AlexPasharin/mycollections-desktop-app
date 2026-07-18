import { type FC, useEffect, useState } from "react";

import AddTagForm from "./AddTagForm";
import AllTagsList from "./AllTagsList";

import FeedbackSection from "@/app/components/FeedbackSection";
import Tabs from "@/app/components/Tabs";
import type { DbSource } from "@/db/db-source";
import type { FormFeedback } from "@/types/form";
import type { TagListItem } from "@/types/tags";
import { formFeedbackInitialValue } from "@/utils/form";

type TagsProps = {
  primaryDbSource: DbSource;
};

type TagsTab = "tagsList" | "addNewTag";

/** Stable ids for this tablist (single Tags window view per document). */
const LIST_TAB_ID = "tags-list-tab";
const LIST_PANEL_ID = "tags-list-panel";
const ADD_TAB_ID = "tags-add-tab";
const ADD_PANEL_ID = "tags-add-panel";

const tagAddedSuccessClassName =
  "mb-4 rounded-md border border-[#6ee7b7] bg-[#d1fae5] px-3 py-2 text-[0.92rem] font-medium text-[#14532d]";

const Tags: FC<TagsProps> = ({ primaryDbSource }) => {
  const [activeTab, setActiveTab] = useState<TagsTab>("tagsList");
  const [recentlyAddedTag, setRecentlyAddedTag] = useState<TagListItem>();
  const [addTagFeedback, setAddTagFeedback] = useState<FormFeedback>(
    formFeedbackInitialValue,
  );
  const [tags, setTags] = useState<TagListItem[]>([]);

  useEffect(() => {
    setRecentlyAddedTag(undefined);
    setAddTagFeedback(formFeedbackInitialValue);
  }, [primaryDbSource]);

  const handleClearAddTagFeedback = () => {
    setAddTagFeedback(formFeedbackInitialValue);
    setRecentlyAddedTag(undefined);
  };

  const handleCreateTag = (result: {
    tag?: TagListItem;
    feedback: FormFeedback;
  }) => {
    const { tag, feedback } = result;
    setAddTagFeedback(feedback);

    if (tag !== undefined) {
      setRecentlyAddedTag(tag);
      setActiveTab("tagsList");
    }
  };

  return (
    <>
      <FeedbackSection
        notificationsId="add-tag-notifications"
        errorsId="add-tag-errors"
        {...addTagFeedback}
      />

      {recentlyAddedTag && (
        <div className={tagAddedSuccessClassName} role="status">
          Tag &quot;{recentlyAddedTag.tag}&quot; added successfully!
        </div>
      )}

      <Tabs
        ariaLabel="Browse tags or add a new tag"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            id: "tagsList",
            tabId: LIST_TAB_ID,
            panelId: LIST_PANEL_ID,
            label: "All tags",
            children: (
              <AllTagsList
                primaryDbSource={primaryDbSource}
                tags={tags}
                onTagsChange={setTags}
                recentlyAddedTag={recentlyAddedTag}
              />
            ),
          },
          {
            id: "addNewTag",
            tabId: ADD_TAB_ID,
            panelId: ADD_PANEL_ID,
            label: "Add a new tag",
            children: (
              <AddTagForm
                primaryDbSource={primaryDbSource}
                tags={tags}
                onClearAddTagFeedback={handleClearAddTagFeedback}
                onCreateTag={handleCreateTag}
              />
            ),
          },
        ]}
      />
    </>
  );
};

export default Tags;
