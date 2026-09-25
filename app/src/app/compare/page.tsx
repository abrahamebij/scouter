import { redirect } from "next/navigation";

interface CompareRedirectProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CompareRedirect({ searchParams }: CompareRedirectProps) {
  const params = await searchParams;
  const queryString = params?.symbols ? `?symbols=${params.symbols}` : "";
  redirect(`/dashboard/compare${queryString}`);
}
