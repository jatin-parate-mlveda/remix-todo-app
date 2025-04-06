import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import prismaClient from "~/prismaClient.server";
import { FaArrowLeft } from "react-icons/fa";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const todo = await prismaClient.todo.findUnique({
    where: { id: params.todoId! },
  });

  if (!todo) throw redirect("/404");

  return { todo };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const todo = await prismaClient.todo.update({
    where: { id: params.todoId! },
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
    <>
      <section className="m-10 p-3 rounded-md bg-slate-200 flex flex-row gap-4 items-center">
        <Link
          title="Go back"
          to={`/app/todos/${todo.id}`}
          className="bg-slate-400 text-white rounded-sm border-none p-2"
        >
          <FaArrowLeft />
        </Link>
        <h1 className="text-lg">
          <span className="font-bold">Edit:</span> {todo.title}
        </h1>
      </section>
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
    </>
  );
}
