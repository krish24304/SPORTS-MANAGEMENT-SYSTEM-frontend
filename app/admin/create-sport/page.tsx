import { redirect } from "next/navigation";

// "Create Sport" is a popup on the admin dashboard; this old route just forwards there.
export default function CreateSportPage() {
  redirect("/admin");
}
