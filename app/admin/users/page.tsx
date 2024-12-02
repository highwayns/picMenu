import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserManagement } from "@/components/user-management";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/auth/signin?error=AccessDenied");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <UserManagement users={users} />
    </div>
  );
} 