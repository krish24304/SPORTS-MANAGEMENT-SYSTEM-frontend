import { redirect } from "next/navigation";

// Sports are managed on the admin dashboard; this old route just forwards there.
export default function AdminSportsPage() {
  redirect("/admin");
}
