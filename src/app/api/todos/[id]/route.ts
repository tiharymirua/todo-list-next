import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const todo = await prisma.todo.update({
    where: { id: Number(id) },
    data: {
      ...(body.done !== undefined && { done: body.done }),
      ...(body.status !== undefined && {status: body.status}),
      ...(body.text !== undefined && { text: body.text }),
      ...(body.deadline !== undefined && {
        deadline: body.deadline ? new Date(body.deadline) : null,
      }),
      ...(body.priority !== undefined && { priority: body.priority }),
    },
  });

  return NextResponse.json(todo);
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