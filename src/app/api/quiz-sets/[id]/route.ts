import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_lykilord';

export async function GET(
    request: Request,
    { params }: { params: { id: string} }
) {
    try {
        const { id } = await params;
        const questionId = parseInt(id);

        const questionSet = await prisma.questionSet.findUnique({
            where: { id: questionId },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                },
                createdBy: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!questionSet){
            return NextResponse.json({ error: 'Quiz set fannst ekki'}, { status: 404});
        }
    
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;

    if(!questionSet.isPublic){
        if (!token){
            return NextResponse.json({ error: 'Aðgangur bannaður'}, { status: 401 });
        }
    
    
        try{
            	const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

            	if(questionSet.createdById !== decoded.id){
            	    return NextResponse.json({
            	        error: 'Aðgangur bannaður'}, { status: 401 });
            	}
            } catch(jwtError){
                console.error('Villa við að jwt validation í [id] route.ts:', jwtError);
                return NextResponse.json({ error: 'Ógildur token '}, { status: 401 });
            }
    }

    return NextResponse.json(questionSet);
    } catch(error){
        console.error('Ekki tókst að sækja quiz set: ', error);
        return NextResponse.json({ error: 'Villa við að sækja quiz set '}, { status: 500 });
    }
}