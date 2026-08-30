export const NEW_CHAT_DRAFT_STORAGE_KEY =
  "veska:new-chat-draft";

export const NEW_CHAT_RESET_STORAGE_KEY =
  "veska:new-chat-reset";

export const NEW_CHAT_RESET_EVENT = "veska:new-chat-reset";

export function requestNewChatReset() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(
    NEW_CHAT_DRAFT_STORAGE_KEY,
  );
  window.sessionStorage.setItem(
    NEW_CHAT_RESET_STORAGE_KEY,
    String(Date.now()),
  );
  window.dispatchEvent(new Event(NEW_CHAT_RESET_EVENT));
}

export function consumePendingNewChatReset() {
  if (typeof window === "undefined") {
    return false;
  }

  const resetToken = window.sessionStorage.getItem(
    NEW_CHAT_RESET_STORAGE_KEY,
  );

  if (!resetToken) {
    return false;
  }

  window.sessionStorage.removeItem(
    NEW_CHAT_RESET_STORAGE_KEY,
  );

  return true;
}
