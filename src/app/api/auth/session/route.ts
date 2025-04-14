import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_lykilord';

export async function GET(){
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;

    if(!token){
        return NextResponse.json({ user: null });
    }
    try{
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = {
            id: (decoded as any).id,
            name: (decoded as any).name,
            role: (decoded as any).role,
        };
        return NextResponse.json({ user });
    } catch(error){
        return NextResponse.json({ user: null});
    }
}