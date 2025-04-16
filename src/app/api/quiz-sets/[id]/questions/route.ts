import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_lykilord';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try{
        const { id } = await params;
        const questionSetId = parseInt(id);

        const cookieStore = cookies();
        const token = (await cookieStore).get('token')?.value;

        if(!token){
            return NextResponse.json({ error: 'Aðgangur bannaður' }, { status: 401 });
        }

        try{
            const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

            const questionSet = await prisma.questionSet.findUnique({
                where: { id: questionSetId }
            });

            if(!questionSet){
                return NextResponse.json({ error: 'Spurningasett fannst ekki'}, { status: 404 });
            }

            if(questionSet.createdById !== decoded.id){
                return NextResponse.json({ error: 'Aðgangur bannaður '}, { status: 401 });
            }

            const { text, options } = await request.json();

            const hasCorrectOption = options.some((option: {
                isCorrect: boolean }) => option.isCorrect);

            if(!hasCorrectOption){
                return NextResponse.json(
                    { error: 'Að minnsta kosti einn möguleiki verður að vera merktur sem rétt svar'},
                    { status: 400 }
                );
            }

            const question = await prisma.question.create({
                data: {
                    text,
                    type: 'MULTIPLE_CHOICE',
                    questionSetId,
                    options:{
                        create: options.map((option: { text: string; isCorrect: boolean}) => ({
                            text: option.text,
                            isCorrect: option.isCorrect
                        }))
                    }
                },
                include:{
                    options: true
                }
            });

            return NextResponse.json(question, { status: 201 });
        } catch(error){
            console.error('Villa innan innri try catch í [id]/questions/route.ts: ', error);
            return NextResponse.json({ error: 'Ógildur jwt token'}, { status: 401 });
        }
    } catch(error){
        console.error('Villa við að búa til spurningu: ', error);
        return NextResponse.json({ error: 'Ekki tókst að búa til spurningu'}, { status: 500});
    }
}