import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import prismaClient from "~/prismaClient.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const todo = await prismaClient.todo.findUnique({
    where: { id: params.todoId! },
  });

  if (!todo) throw redirect("/app");

  return { todo };
};

export const action = async ({
  params,
  request: { method },
}: ActionFunctionArgs) => {
  if (method.toLowerCase().localeCompare("delete") === 0) {
    const deleteResult = await prismaClient.todo.delete({
      where: { id: params.todoId! },
    });

    return { todo: deleteResult };
  }

  throw redirect("/404");
};

export default function TodoPage() {
  const { todo } = useLoaderData<typeof loader>();

  return (
    <>
      <section className="m-10 p-3 rounded-md bg-slate-200 flex flex-col items-stretch justify-start gap-4">
        <h1 className="text-lg">
          <span className="font-bold">Task:</span> {todo.title}
        </h1>
        <hr className="border-t border-black" />
        <article>{todo.description}</article>
        <hr className="border-t border-black" />
        <time>Created On: {format(todo.createdAt, "yyyy-MM-dd")}</time>
      </section>
      <section className="m-10 p-3 rounded-md bg-slate-200 flex flex-col items-stretch justify-start gap-4">
        <Form
          action="./"
          method="delete"
          className="flex flex-row items-center justify-between"
        >
          <Link
            to="./edit"
            className="bg-amber-400 text-white rounded-sm border-none p-2"
          >
            Edit
          </Link>
          <button
            type="submit"
            className="bg-red-400 text-white rounded-sm border-none p-2"
          >
            Delete
          </button>
        </Form>
      </section>
    </>
  );
}
