import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
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
  const navigation = useNavigation();

  const isSubmitting =
    navigation.state === "submitting" &&
    navigation.formAction === "/app/todos/" + todo.id + "/edit/";

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
      <Form aria-disabled={isSubmitting} action="./" method="patch">
        <section className="m-10 p-3 rounded-md bg-slate-200 flex flex-col items-stretch justify-start gap-4">
          <label>
            <div>Todo Name</div>
            <input
              disabled={isSubmitting}
              name="title"
              defaultValue={todo.title}
            />
          </label>
          <label>
            <div>Description</div>
            <input
              disabled={isSubmitting}
              name="description"
              defaultValue={todo.description}
            />
          </label>
        </section>
        <section className="m-10 p-3 rounded-md bg-slate-200 flex flex-col items-stretch justify-start gap-4">
          <div className="flex flex-row items-center justify-between">
            <button
              disabled={navigation.state === "submitting"}
              type="submit"
              className={`${
                isSubmitting ? "bg-red-200" : "bg-red-400"
              } text-white rounded-sm border-none p-2`}
            >
              {isSubmitting ? "Loading" : "Save"}
            </button>
          </div>
        </section>
      </Form>
    </>
  );
}
