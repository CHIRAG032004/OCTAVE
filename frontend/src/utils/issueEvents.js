export const ISSUE_UPDATED_EVENT = 'issues:updated';

export const notifyIssuesUpdated = (issue = null) => {
  window.dispatchEvent(new CustomEvent(ISSUE_UPDATED_EVENT, { detail: issue }));
};
