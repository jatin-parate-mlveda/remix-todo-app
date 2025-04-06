import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import prismaClient from "~/prismaClient.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  if (isNaN(parseInt(params.todoId!))) {
    throw redirect("/404");
  }
  const todo = await prismaClient.todo.findUnique({
    where: { id: parseInt(params.todoId!, 10) },
  });

  if (!todo) throw redirect("/404");

  return { todo };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const todo = await prismaClient.todo.update({
    where: { id: parseInt(params.todoId!, 10) },
    data: {
      title: formData.get("title")!.toString(),
      description: formData.get("description")!.toString(),
    },
  });

  throw redirect("/app/todos/" + todo.id);
};

export default function EditTodoPage() {
  const { todo } = useLoaderData<typeof loader>();
  return (
    <Form action="./" method="patch">
      <section className="m-10 p-3 rounded-md bg-slate-200 flex flex-col items-stretch justify-start gap-4">
        <label>
          <div>Todo Name</div>
          <input name="title" defaultValue={todo.title} />
        </label>
        <label>
          <div>Description</div>
          <input name="description" defaultValue={todo.description} />
        </label>
      </section>
      <section className="m-10 p-3 rounded-md bg-slate-200 flex flex-col items-stretch justify-start gap-4">
        <div className="flex flex-row items-center justify-between">
          <button
            type="submit"
            className="bg-red-400 text-white rounded-sm border-none p-2"
          >
            Save
          </button>
        </div>
      </section>
    </Form>
  );
}
