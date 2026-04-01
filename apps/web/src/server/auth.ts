import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  return db.userProfile.findUnique({
    where: { id: userId },
    include: { sellerProfile: true, wallet: true },
  });
}

export async function ensureUserProfile(userId: string, email: string) {
  return db.userProfile.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email,
      displayName: email.split("@")[0],
    },
  });
}

export async function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
  return adminEmails.includes(email);
}

export async function isSeller(userId: string) {
  const profile = await db.userProfile.findUnique({
    where: { id: userId },
    select: { role: true, sellerProfile: { select: { verificationStatus: true } } },
  });
  return profile?.role === "SELLER" || profile?.role === "ADMIN";
}
