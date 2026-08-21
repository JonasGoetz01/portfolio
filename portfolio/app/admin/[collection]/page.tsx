import { redirect } from "next/navigation";

/** `/admin/blog` has no list of its own — both folders are listed on `/admin`. */
export default async function CollectionPage() {
  redirect("/admin");
}
