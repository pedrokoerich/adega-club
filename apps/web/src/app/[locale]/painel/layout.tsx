import { redirect } from "next/navigation";
import { getUser } from "@/server/auth";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}
