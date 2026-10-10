import { redirect } from "next/navigation";

// Return requests live on the staff dashboard; this route just forwards there.
export default function StaffReturnsPage() {
  redirect("/staff");
}
