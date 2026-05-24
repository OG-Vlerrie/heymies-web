import EmailPreferencesClient from "./EmailPreferencesClient";

export default function EmailPreferencesPage({
  searchParams,
}: {
  searchParams: { token?: string; status?: string; topic?: string };
}) {
  return (
    <EmailPreferencesClient
      token={searchParams.token ?? ""}
      status={searchParams.status ?? ""}
      topic={searchParams.topic ?? ""}
    />
  );
}
