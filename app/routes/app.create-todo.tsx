import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import prismaClient from "~/prismaClient.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const title = formData.get("title")!.toString();
  const description = formData.get("description")!.toString();

  const todo = await prismaClient.todo.create({
    data: { title, description },
  });

  throw redirect("/app/todos/" + todo.id);
};

export default function CreateTodoPage() {
  const navigation = useNavigation();

  const isLoading =
    navigation.formAction?.startsWith("/app/create-todo") &&
    (navigation.state === "submitting" || navigation.state === "loading");

  return (
    <Form
      method="post"
      className="m-10 p-3 rounded-md bg-slate-200 flex flex-col items-start justify-start gap-4"
    >
      <label>
        <div>Todo Name</div>
        <input name="title" />
      </label>
      <label>
        <div>Description</div>
        <input name="description" />
      </label>

      <button
        disabled={isLoading}
        className="w-full bg-slate-400 text-white rounded-sm border-none p-2"
      >
        {isLoading ? "Submitting..." : "Submit"}
      </button>
    </Form>
  );
}
