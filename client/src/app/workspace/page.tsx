import { redirect } from "next/navigation";

export default async function WorkspaceRootPage({
  searchParams
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const queryStr = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([k, v]) => {
    if (typeof v === "string") queryStr.set(k, v);
    else if (Array.isArray(v) && v.length > 0) queryStr.set(k, v[0]);
  });

  const slug = `task-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  const queryString = queryStr.toString();
  redirect(`/workspace/${slug}${queryString ? `?${queryString}` : ""}`);
}
