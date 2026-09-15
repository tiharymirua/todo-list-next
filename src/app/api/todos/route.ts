import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){
    const todos = await prisma.todo.findMany({
        orderBy: { createdAt: "asc"},
    })

    return NextResponse.json(todos)
}

export async function POST(request : Request){
    const body = await request.json()
    const todo = await prisma.todo.create({
        data: {
            text: body.text,
            deadline: body.deadline ? new Date(body.deadline) : null,
            priority: body.priority,
        },
    })

    return NextResponse.json(todo)
}