import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
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

export const action = async ({
  params,
  request: { method },
}: ActionFunctionArgs) => {
  if (method.toLowerCase().localeCompare("delete") === 0) {
    await prismaClient.todo.delete({
      where: { id: Number.parseInt(params.todoId!, 10) },
    });

    throw redirect("/app");
  }

  throw redirect("/404");
};

export default function TodoPage() {
  const { todo } = useLoaderData<typeof loader>();

  return (
    <>
      <section className="m-10 p-3 rounded-md bg-slate-200 flex flex-col items-stretch justify-start gap-4">
        <h1 className="text-lg font-bold">{todo.title}</h1>
        <hr className="border-t border-black" />
        <article>{todo.description}</article>
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
