import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_lykilord';

export async function GET(){
    try{
        const cookieStore = cookies();
        const token = (await cookieStore).get('token')?.value;

        let userId: number | undefined;

        if(token){
            const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
            userId = decoded.id;
        }

        const questionSets = await prisma.questionSet.findMany({
            where: {
                OR: [
                    { isPublic: true },
                    userId ? { createdById: userId } : {}
                ]
            },
            include: {
                createdBy: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        questions: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(questionSets);
    } catch(error){
        console.error('Villa við að sækja quiz sets: ', error);
        return NextResponse.json({ error: 'Mistókst að sækja quiz sets'}, { status: 500});
    }
}

export async function POST(request: Request){
    try{
        const cookieStore = cookies();
        const token = (await cookieStore).get('token')?.value;

        if(!token){
            return NextResponse.json({ error: 'Aðgangur bannaður'}, {status: 401});
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        const userId = decoded.id;

        const { title, description, isPublic } = await request.json();

        const questionSet = await prisma.questionSet.create({
            data: {
                title,
                description,
                isPublic: isPublic || false,
                createdById: userId
            }
        });

        return NextResponse.json(questionSet, { status: 201 });
    } catch(error){
        console.error('Error creating quiz set: ', error);
        return NextResponse.json({ error: 'Ekki tókst að búa til quiz set'}, { status: 500 });
    }
}