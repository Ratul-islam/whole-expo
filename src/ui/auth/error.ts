export function getErrorMessage(e: any) {
  return e?.response?.data?.message ?? e?.message ?? "Something went wrong";
}
