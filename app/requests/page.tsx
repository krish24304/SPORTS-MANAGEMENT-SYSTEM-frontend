import { redirect } from "next/navigation";

// Student suggestions and staff messages live on the suggestions page.
export default function RequestsPage() {
  redirect("/suggestions");
}
