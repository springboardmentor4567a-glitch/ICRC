export function formatApiError(detail, fallback = "Something went wrong") {
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.msg) return item.msg;
        if (item?.detail) return formatApiError(item.detail, fallback);
        return JSON.stringify(item);
      })
      .filter(Boolean)
      .join(" ");
  }

  if (typeof detail === "object") {
    if (detail.msg) return detail.msg;
    if (detail.detail) return formatApiError(detail.detail, fallback);
    return JSON.stringify(detail);
  }

  return String(detail);
}