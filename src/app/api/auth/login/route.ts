import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_lykilord';

export async function POST(request: Request){
    try{
        const { email, password } = await request.json();

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if(!user || !(await bcrypt.compare(password, user.password))){
            return NextResponse.json({ error: 'Ekki rétt netfang eða lykilorð' }, { status: 401});
        }
        const token = jwt.sign(
            { 
                id: user.id,
                name: user.name,
                role: user.role
            }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        const response = NextResponse.json({ message: 'Innskráning tókst!' });
        response.cookies.set('token', token, {
            httpOnly: true, //Þetta 'option' gerir cookieið óaðgengilegt fyrir client-side js
            secure: process.env.NODE_ENV === 'production', //Þýðir að cookieið verður bara sent yfir HTTPS tengingar, ekki HTTP
            path: '/', // "the cookie will be sent with every request to any route on your domain"
        });

        return response;
    } catch (error){
        console.error('Login villa: ', error);
        return NextResponse.json({ error: 'Login feilaði' }, { status: 500 });
    }
}