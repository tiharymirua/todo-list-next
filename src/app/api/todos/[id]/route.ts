import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: Request,
    {params} : {params: Promise<{ id: string }>}
){
    const { id } = await params
    const body = await request.json()
    const todo = await prisma.todo.update({
        where: { id: Number(id)},
        data: {done: body.done},
    })

    return NextResponse.json(todo)
}

export async function DELETE(
    request: Request,
    {params} : {params: Promise<{ id: string }>}
){
    const {id} = await params;

    await prisma.todo.delete({
        where: {id : Number(id)},
    })

    return NextResponse.json({success:true})
}