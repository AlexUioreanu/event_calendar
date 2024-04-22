import { getServerSession } from "next-auth";
import Form from "./form";
import { redirect, useRouter } from "next/navigation";

export default async function LoginPage() {
  // const session = await getServerSession();

  // if (session) {
  //   redirect("/calendar");
  // }
  return <Form />;
}
