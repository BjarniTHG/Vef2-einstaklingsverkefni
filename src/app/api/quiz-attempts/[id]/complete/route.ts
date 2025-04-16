import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_lykilord';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quizAttemptId = parseInt(params.id);
    
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const userId = decoded.id;
      
      // Check if quiz attempt exists and belongs to the user
      const quizAttempt = await prisma.quizAttempt.findUnique({
        where: { id: quizAttemptId }
      });
      
      if (!quizAttempt) {
        return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });
      }
      
      if (quizAttempt.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const { score, timeTaken } = await request.json();
      
      const updatedAttempt = await prisma.quizAttempt.update({
        where: { id: quizAttemptId },
        data: {
          finishedAt: new Date(),
          score,
          timeTaken
        }
      });
      
      return NextResponse.json(updatedAttempt);
    } catch (jwtError) {
        console.error(jwtError);
      return NextResponse.json({ error: 'Ógildur token, aðgangur bannaður' }, { status: 401 });
    }
  } catch (error) {
    console.error('Villa við að senda inn lok tilraunar:', error);
    return NextResponse.json({ error: 'Ekki tókst að senda inn lok tilraunar' }, { status: 500 });
  }
}