import { redirect } from "next/navigation";

// Announcements are managed from the admin dashboard; this route just forwards there.
export default function AdminNoticesPage() {
  redirect("/admin");
}
