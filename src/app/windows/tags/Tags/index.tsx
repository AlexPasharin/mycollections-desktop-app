import { type FC, useEffect, useState } from "react";

import AddTagForm from "./AddTagForm";
import AllTagsList from "./AllTagsList";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
import Tabs from "@/app/components/Tabs";
import type { DbSource } from "@/db/db-source";
import type { TagListItem } from "@/types/tags";

type TagsProps = {
  primaryDbSource: DbSource;
};

type TagsTab = "tagsList" | "addNewTag";

/** Stable ids for this tablist (single Tags window view per document). */
const LIST_TAB_ID = "tags-list-tab";
const LIST_PANEL_ID = "tags-list-panel";
const ADD_TAB_ID = "tags-add-tab";
const ADD_PANEL_ID = "tags-add-panel";

const Tags: FC<TagsProps> = ({ primaryDbSource }) => {
  const [activeTab, setActiveTab] = useState<TagsTab>("tagsList");
  const [recentlyAddedTagId, setRecentlyAddedTagId] = useState<string>();
  const [addTagNotifications, setAddTagNotifications] = useState<string[]>([]);
  const [addTagErrors, setAddTagErrors] = useState<string[]>([]);
  const [tags, setTags] = useState<TagListItem[]>([]);

  useEffect(() => {
    setRecentlyAddedTagId(undefined);
    setAddTagNotifications([]);
    setAddTagErrors([]);
  }, [primaryDbSource]);

  const handleClearAddTagFeedback = () => {
    setAddTagNotifications([]);
    setAddTagErrors([]);
  };

  const handleCreateTag = ({
    tagId,
    notifications: successNotifications,
    errors: failureMessages,
  }: {
    tagId: string | undefined;
    notifications: string[];
    errors: string[];
  }) => {
    setAddTagNotifications(successNotifications);
    setAddTagErrors(failureMessages);

    if (tagId !== undefined) {
      setRecentlyAddedTagId(tagId);
      setActiveTab("tagsList");
    }
  };

  return (
    <>
      <FormFieldNotifications
        id="add-tag-notifications"
        messages={addTagNotifications.map((notification) => ({
          notification,
        }))}
      />
      <FormFieldErrorMessages
        id="add-tag-errors"
        messages={addTagErrors.map((message) => ({ message }))}
      />

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
                recentlyAddedTagId={recentlyAddedTagId}
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
