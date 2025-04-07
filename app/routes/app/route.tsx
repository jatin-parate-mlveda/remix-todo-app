import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaCheck } from "react-icons/fa";
import prismaClient from "~/prismaClient.server";
import { LinksFunction } from "@remix-run/react/dist/routeModules";
import styles from "./app.css?url";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export const loader = async ({ request: { url } }: LoaderFunctionArgs) => {
  const query = new URL(url).searchParams.get("q");
  // await prismaClient.todo.deleteMany();
  const todos = await prismaClient.todo.findMany({
    take: 10,
    where: {
      isComplete: false,
      ...(query
        ? {
            title: { contains: query },
          }
        : null),
    },
  });

  return { todos };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.json();

  const updatedTodo = await prismaClient.todo.update({
    where: { id: body.id! },
    data: { isComplete: true },
  });

  return { todo: updatedTodo };
};

export default function AppLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState<string>(
    () => searchParams.get("q") ?? ""
  );
  const fetcher = useFetcher();

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  const { todos } = useLoaderData<typeof loader>();
  return (
    <div className="container flex flex-row flex-nowrap gap-4">
      <aside className="w-[30vw] bg-slate-100 p-8 min-h-screen flex flex-col">
        <Form
          onChange={(e) => {
            setSearchParams((prev) => ({
              ...prev,
              q: new FormData(e.currentTarget).get("search") ?? "",
            }));
          }}
          // onSubmit={onSubmit}
          className="flex flex-row flex-nowrap gap-2 items-start justify-center"
        >
          <label className="flex w-full h-full flex-row gap-1 p-1 bg-white border-r-2 items-center justify-start border-2 focus-within:border-solid focus-within:border-indigo-400">
            <FaSearch className="ml-2" />
            <input
              type="search"
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!border-none outline-none h-full w-full p-2"
              name="search"
            />
          </label>
        </Form>
        <ul className="list-none h-full overflow-y-auto mt-4 flex items-stretch justify-start w-full flex-col gap-4">
          <li>
            <Link
              to="/app/create-todo"
              className="w-full gap-2 flex items-center justify-center text-center bg-slate-400 text-white rounded-sm border-none p-2"
            >
              <FaPlus />
              Create Todo
            </Link>
          </li>
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex flex-row flex-nowrap align-middle justify-between p-2 w-full bg-slate-200 sidebar_item"
            >
              <NavLink
                to={`/app/todos/${todo.id}`}
                className={({ isActive, isPending }) =>
                  `w-full ${isActive ? "active" : isPending ? "pending" : ""}`
                }
              >
                {todo.title || "New Todo"}
              </NavLink>
              <button
                type="button"
                className="rounded-full border border-black p-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  fetcher.submit(
                    { id: todo.id },
                    {
                      action: "/app",
                      method: "delete",
                      encType: "application/json",
                    }
                  );
                }}
              >
                <FaCheck />
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}
