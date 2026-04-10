export const ISSUE_UPDATED_EVENT = 'issues:updated';

export const notifyIssuesUpdated = () => {
  window.dispatchEvent(new CustomEvent(ISSUE_UPDATED_EVENT));
};
