import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_lykilord';

interface TokenPayload {
    id: number;
    name: string;
    role: string;
}

export async function GET(){
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;

    if(!token){
        return NextResponse.json({ user: null });
    }
    try{
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        const user = {
            id: decoded.id,
            name: decoded.name,
            role: decoded.role,
        };
        return NextResponse.json({ user });
    } catch(error){
        console.log(error);
        return NextResponse.json({ user: null});
    }
}