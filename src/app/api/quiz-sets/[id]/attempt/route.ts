import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_lykilord';

export async function POST(
    request: Request,
    { params }: { params: { id: string} }
) {
    try{
        const { id } = await params;
        const questionSetId = parseInt(id);

        const cookieStore = cookies();
        const token = (await cookieStore).get('token')?.value;

        if(!token){
            return NextResponse.json({ error: 'Aðgangur bannaður'}, { status: 401});
        }

        try{
            const decoded = jwt.verify(token, JWT_SECRET) as { id: number};
            const userId = decoded.id;

            const questionSet = await prisma.questionSet.findUnique({
                where: { id: questionSetId }
            });

            if (!questionSet){
                return NextResponse.json({ error: 'Spurningasett fannst ekki'}, { status: 404});
            }

            const quizAttempt = await prisma.quizAttempt.create({
                data: {
                    userId,
                    questionSetId
                }
            });

            return NextResponse.json(quizAttempt, { status: 201 });
        } catch(error){
            console.error('Villa við að búa til tilraun: ', error);
            return NextResponse.json({ error: 'Ógildur jwtoken'}, { status: 401});
        }
    } catch(error){
        console.error('Villa við að búa til tilraun: ', error);
        return NextResponse.json({ error: 'Ekki tókst að skrá tilraunina'}, { status: 500 });
    }
}