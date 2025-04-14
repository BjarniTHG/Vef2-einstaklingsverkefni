import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function UsersPage(){
    const users = await prisma.user.findMany();

    return (
        <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold">Users</h1>
            <ul className="mt-4">
                {users.map((user) => (
                <li key={user.id} className="border p-2 my-2 rounded">
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}