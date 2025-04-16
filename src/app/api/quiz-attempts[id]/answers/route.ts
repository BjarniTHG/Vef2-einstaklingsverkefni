import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_lykilord';

export async function POST(
    request: Request,
    context: { params: { id: string } }
) {
    try{
        const id = context.params.id;
        const quizAttemptId = parseInt(id);
        
        const cookieStore = cookies();
        const token = (await cookieStore).get('token')?.value;

        if(!token){
            return NextResponse.json({ error: 'Aðgangur bannaður' }, { status: 401 });
        }

        try{
            const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
            const userId = decoded.id;

            const quizAttempt = await prisma.quizAttempt.findUnique({
                where: { id: quizAttemptId },
                include: { questionSet: { include: { questions: {
                    include: { options: true }
                } } } }
            });

            if(!quizAttempt){
                return NextResponse.json({ error: 'Tilraun fannst ekki' }, { status: 404 });
            }

            if(quizAttempt.userId !== userId){
                return NextResponse.json({ error: 'Aðgangur bannaður' }, { status: 401 });
            }

            const { questionId, optionId, timeToAnswer } = await request.json();

            const question = quizAttempt.questionSet.questions.find(q => q.id === questionId);
            if(!question){
                return NextResponse.json({ error: 'Spurning fannst ekki í þessu setti'}, { status: 400 });
            }

            const option = question.options.find(o => o.id === optionId);
            if(!option){
                return NextResponse.json({ error: 'Valmöguleiki fannst ekki í þessari spurningu'}, { status: 400 });
            }

            const answer = await prisma.answer.create({
                data: {
                    quizAttemptId,
                    questionId,
                    optionId,
                    correct: option.isCorrect,
                    timeToAnswer
                }
            });

            return NextResponse.json(answer, { status: 201 });
        } catch(error){
            console.error(error);
            return NextResponse.json({ error: 'Ógildur token, aðgangur bannaður'}, { status: 401 });
        }
    } catch(error){
        console.error('Villa við að senda inn svör: ', error);
        return NextResponse.json({ error: 'Ekki tókst að senda inn svör'}, { status: 500});
    }
}
