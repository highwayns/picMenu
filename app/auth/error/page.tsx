"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred";
  switch (error) {
    case "SessionRequired":
      errorMessage = "Please sign in to access this page";
      break;
    case "Unauthorized":
      errorMessage = "You are not authorized to access this page";
      break;
    case "AccessDenied":
      errorMessage = "Access denied";
      break;
    case "TokenExpired":
      errorMessage = "Your session has expired. Please sign in again";
      break;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-2 text-center text-red-600">
            {errorMessage}
          </div>
        </div>
        <div className="text-center">
          <Link
            href="/auth/signin"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
} 