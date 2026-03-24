import { redirect } from "next/navigation";
import { getUser, isAdmin } from "@/server/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const admin = await isAdmin(user.email);
  if (!admin) {
    redirect("/");
  }

  return <>{children}</>;
}
